import { Router } from 'express';
import { spawn, execSync } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { validate } from '../middleware/validators.js';
import { AppError, ErrorCode } from '../middleware/errorHandler.js';

const router = Router();

const TIMEOUT = 10000;
const installedPackages = new Set();

async function installPythonPackage(packageName) {
  if (installedPackages.has(packageName)) return true;

  // Common safe packages that can be auto-installed
  const safePackages = new Set([
    'requests', 'numpy', 'pandas', 'beautifulsoup4', 'bs4', 'lxml',
    'sortedcontainers', 'aiohttp', 'httpx', 'pillow', 'matplotlib',
    'scipy', 'sklearn', 'networkx', 'sympy', 'cryptography', 'pyyaml',
  ]);

  if (!safePackages.has(packageName.toLowerCase())) {
    console.log(`[CodeRunner] Package ${packageName} not in safe list, skipping auto-install`);
    return false;
  }

  // Try different pip install strategies using python3 from PATH
  const strategies = [
    `python3 -m pip install --user --quiet ${packageName}`,
    `pip3 install --user --quiet ${packageName}`,
  ];

  for (const cmd of strategies) {
    try {
      execSync(cmd, { timeout: 120000, stdio: 'pipe' });
      installedPackages.add(packageName);
      console.log(`[CodeRunner] Installed ${packageName}`);
      return true;
    } catch (err) {
      continue;
    }
  }

  console.log(`[CodeRunner] Failed to install ${packageName}`);
  return false;
}

function extractMissingModule(error, language) {
  // Python
  if (language === 'python') {
    const match = error.match(/ModuleNotFoundError: No module named '([^']+)'/);
    if (match) return { name: match[1].split('.')[0], language: 'python' };
  }

  // JavaScript/TypeScript - various error formats
  if (language === 'javascript' || language === 'typescript') {
    // Cannot find module 'xxx'
    let match = error.match(/Cannot find module '([^']+)'/);
    if (match && !match[1].startsWith('.') && !match[1].startsWith('/')) {
      return { name: match[1], language: 'node' };
    }
    // Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'xxx'
    match = error.match(/Cannot find package '([^']+)'/);
    if (match) return { name: match[1], language: 'node' };
  }

  return null;
}

const installedNpmPackages = new Set();

async function installNpmPackage(packageName) {
  if (installedNpmPackages.has(packageName)) return true;

  const safePackages = new Set([
    'axios', 'node-fetch', 'lodash', 'underscore', 'moment', 'dayjs',
    'uuid', 'chalk', 'commander', 'inquirer', 'ora', 'got',
  ]);

  if (!safePackages.has(packageName.toLowerCase())) {
    console.log(`[CodeRunner] npm package ${packageName} not in safe list`);
    return false;
  }

  try {
    execSync(`npm install -g ${packageName}`, { timeout: 120000, stdio: 'pipe' });
    installedNpmPackages.add(packageName);
    console.log(`[CodeRunner] Installed npm package: ${packageName}`);
    return true;
  } catch {
    return false;
  }
}

const RUNNERS = {
  python: {
    ext: '.py',
    cmd: 'python3',  // Use python3 from PATH (user's installed Python with packages)
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
    args: (file, cliArgs) => [':memory:', '-init', file, '.quit'],
  },
};

async function executeCode(code, language, input = '', args = [], retryCount = 0) {
  const runner = RUNNERS[language];
  if (!runner) {
    return { success: false, error: `Unsupported language: ${language}` };
  }

  const filename = `code_${randomUUID()}${runner.ext}`;
  const filepath = join(tmpdir(), filename);

  let processedCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (language === 'bash' && !processedCode.startsWith('#!')) {
    processedCode = '#!/bin/bash\n' + processedCode;
  }

  try {
    await writeFile(filepath, processedCode);

    return new Promise((resolve) => {
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
        resolve({ success: false, error: 'Execution timeout (10s limit)' });
      }, TIMEOUT);

      proc.on('close', async (exitCode) => {
        clearTimeout(timer);
        unlink(filepath).catch(() => {});

        if (exitCode === 0) {
          resolve({ success: true, output: stdout || '(no output)' });
        } else {
          // Try to auto-install missing packages
          if (retryCount < 3) {
            const missing = extractMissingModule(stderr, language);
            if (missing) {
              let installed = false;
              if (missing.language === 'python') {
                installed = await installPythonPackage(missing.name);
              } else if (missing.language === 'node') {
                installed = await installNpmPackage(missing.name);
              }
              if (installed) {
                const retryResult = await executeCode(code, language, input, args, retryCount + 1);
                resolve(retryResult);
                return;
              }
            }
          }
          resolve({ success: false, error: stderr || `Exit code: ${exitCode}` });
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        unlink(filepath).catch(() => {});
        resolve({ success: false, error: err.message });
      });
    });
  } catch (err) {
    await unlink(filepath).catch(() => {});
    return { success: false, error: err.message };
  }
}

router.post('/', validate('run'), async (req, res, next) => {
  try {
    const { code, language, input, args = [] } = req.body;

    const cliArgs = Array.isArray(args) ? args : args.split(' ').filter(Boolean);
    const result = await executeCode(code, language, input, cliArgs);
    res.json(result);
  } catch (error) {
    next(new AppError(
      'Failed to execute code',
      ErrorCode.INTERNAL_ERROR,
      error.message
    ));
  }
});

export default router;
