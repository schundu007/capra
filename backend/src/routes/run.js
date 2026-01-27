import { Router } from 'express';
import { spawn, execSync } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const router = Router();

const TIMEOUT = 10000;
const installedPackages = new Set();

async function installPythonPackage(packageName) {
  if (installedPackages.has(packageName)) return true;
  try {
    execSync(`pip install ${packageName}`, { timeout: 30000, stdio: 'pipe' });
    installedPackages.add(packageName);
    return true;
  } catch {
    return false;
  }
}

function extractMissingModule(error) {
  const match = error.match(/ModuleNotFoundError: No module named '([^']+)'/);
  if (match) {
    return match[1].split('.')[0];
  }
  return null;
}

const RUNNERS = {
  python: {
    ext: '.py',
    cmd: 'python3',
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
          if (language === 'python' && retryCount < 3) {
            const missingModule = extractMissingModule(stderr);
            if (missingModule) {
              const installed = await installPythonPackage(missingModule);
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

router.post('/', async (req, res) => {
  try {
    const { code, language, input, args = [] } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' });
    }

    if (!language || !RUNNERS[language]) {
      return res.status(400).json({
        error: `Unsupported language. Supported: ${Object.keys(RUNNERS).join(', ')}`,
      });
    }

    const cliArgs = Array.isArray(args) ? args : args.split(' ').filter(Boolean);
    const result = await executeCode(code, language, input, cliArgs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute code', details: error.message });
  }
});

export default router;
