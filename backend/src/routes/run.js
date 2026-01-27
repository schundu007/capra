/**
 * Run Route
 * Handles code execution in sandboxed environment
 */

import { Router } from 'express';
import { spawn, execSync } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { ExecutionError, ValidationError } from '../lib/errors.js';
import { asyncHandler, sendSuccess } from '../lib/response.js';
import { validate, validateRunRequest, SUPPORTED_LANGUAGES } from '../lib/validators.js';
import { config } from '../lib/config.js';
import { createLogger } from '../lib/logger.js';

const router = Router();
const logger = createLogger('routes:run');

/**
 * Cache of installed Python packages to avoid repeated installations
 */
const installedPackages = new Set();

/**
 * Language runner configurations
 */
const RUNNERS = {
  python: {
    ext: '.py',
    cmd: config.execution.pythonPath,
    args: (file, cliArgs) => [file, ...cliArgs],
  },
  bash: {
    ext: '.sh',
    cmd: 'bash',
    args: (file, cliArgs) => [file, ...cliArgs],
  },
  javascript: {
    ext: '.js',
    cmd: 'node',
    args: (file, cliArgs) => [file, ...cliArgs],
  },
  typescript: {
    ext: '.ts',
    cmd: 'npx',
    args: (file, cliArgs) => ['tsx', file, ...cliArgs],
  },
  sql: {
    ext: '.sql',
    cmd: 'sqlite3',
    args: (file) => [':memory:', '-init', file, '.quit'],
  },
};

/**
 * Install a Python package on demand
 * @param {string} packageName - Package to install
 * @returns {Promise<boolean>} - Success status
 */
async function installPythonPackage(packageName) {
  if (installedPackages.has(packageName)) {
    return true;
  }

  if (!config.execution.allowPackageInstall) {
    logger.warn('Package installation disabled', { package: packageName });
    return false;
  }

  try {
    logger.info('Installing Python package', { package: packageName });
    execSync(
      `${config.execution.pythonPath} -m pip install --break-system-packages ${packageName}`,
      { timeout: 60000, stdio: 'pipe' }
    );
    installedPackages.add(packageName);
    logger.info('Package installed successfully', { package: packageName });
    return true;
  } catch (error) {
    logger.warn('Package installation failed', {
      package: packageName,
      error: error.message,
    });
    return false;
  }
}

/**
 * Extract missing module name from Python error
 * @param {string} error - Error message
 * @returns {string|null} - Module name or null
 */
function extractMissingModule(error) {
  const match = error.match(/ModuleNotFoundError: No module named '([^']+)'/);
  if (match) {
    return match[1].split('.')[0];
  }
  return null;
}

/**
 * Execute code in sandboxed environment
 * @param {string} code - Code to execute
 * @param {string} language - Programming language
 * @param {string} input - stdin input
 * @param {string[]} args - Command line arguments
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} - Execution result
 */
async function executeCode(code, language, input = '', args = [], retryCount = 0) {
  const runner = RUNNERS[language];
  if (!runner) {
    return {
      success: false,
      error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
    };
  }

  const executionId = randomUUID().split('-')[0];
  const filename = `code_${executionId}${runner.ext}`;
  const filepath = join(tmpdir(), filename);

  // Normalize line endings
  let processedCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Add shebang for bash if missing
  if (language === 'bash' && !processedCode.startsWith('#!')) {
    processedCode = '#!/bin/bash\n' + processedCode;
  }

  try {
    await writeFile(filepath, processedCode);

    return new Promise((resolve) => {
      const startTime = Date.now();
      const proc = spawn(runner.cmd, runner.args(filepath, args), {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      if (input) {
        proc.stdin.write(input);
      }
      proc.stdin.end();

      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        const duration = Date.now() - startTime;
        logger.warn('Execution timeout', { executionId, language, duration });
        resolve({
          success: false,
          error: `Execution timeout (${config.execution.timeout / 1000}s limit)`,
          duration,
        });
      }, config.execution.timeout);

      proc.on('close', async (exitCode) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        // Cleanup temp file
        unlink(filepath).catch(() => {});

        if (exitCode === 0) {
          logger.debug('Execution successful', { executionId, language, duration });
          resolve({
            success: true,
            output: stdout || '(no output)',
            duration,
          });
        } else {
          // Handle Python missing module with auto-install
          if (language === 'python' && retryCount < config.execution.maxRetries) {
            const missingModule = extractMissingModule(stderr);
            if (missingModule) {
              logger.info('Attempting to install missing module', {
                executionId,
                module: missingModule,
                attempt: retryCount + 1,
              });

              const installed = await installPythonPackage(missingModule);
              if (installed) {
                const retryResult = await executeCode(code, language, input, args, retryCount + 1);
                resolve(retryResult);
                return;
              }
            }
          }

          logger.debug('Execution failed', { executionId, language, exitCode, duration });
          resolve({
            success: false,
            error: stderr || `Exit code: ${exitCode}`,
            duration,
          });
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        // Cleanup temp file
        unlink(filepath).catch(() => {});

        logger.error('Execution process error', {
          executionId,
          language,
          error: err.message,
        });

        resolve({
          success: false,
          error: err.message,
          duration,
        });
      });
    });
  } catch (err) {
    await unlink(filepath).catch(() => {});
    logger.error('Execution setup error', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * POST /api/run
 * Execute code in sandboxed environment
 *
 * @body {string} code - Code to execute
 * @body {string} language - Programming language
 * @body {string} [input] - stdin input
 * @body {string[]|string} [args] - Command line arguments
 */
router.post(
  '/',
  validate(validateRunRequest),
  asyncHandler(async (req, res) => {
    const { code, language, input, args = [] } = req.body;

    logger.info('Executing code', {
      requestId: req.id,
      language,
      codeLength: code.length,
      hasInput: !!input,
    });

    // Normalize args
    const cliArgs = Array.isArray(args)
      ? args
      : typeof args === 'string'
        ? args.split(' ').filter(Boolean)
        : [];

    const result = await executeCode(code, language, input, cliArgs);

    logger.info('Execution completed', {
      requestId: req.id,
      language,
      success: result.success,
      duration: result.duration,
    });

    sendSuccess(res, result);
  })
);

export default router;
