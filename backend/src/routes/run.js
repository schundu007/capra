import { Router } from 'express';
import { spawn, execSync } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { validate } from '../middleware/validators.js';
import { AppError, ErrorCode } from '../middleware/errorHandler.js';

// Safe logging that ignores EPIPE errors
function safeLog(...args) {
  try {
    console.log(...args);
  } catch {
    // Ignore EPIPE and other write errors
  }
}

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
    safeLog(`[CodeRunner] Package ${packageName} not in safe list, skipping auto-install`);
    return false;
  }

  // Try different pip install strategies using system python
  const strategies = [
    `/usr/bin/python3 -m pip install --user --quiet ${packageName}`,
    `/usr/bin/pip3 install --user --quiet ${packageName}`,
  ];

  for (const cmd of strategies) {
    try {
      execSync(cmd, { timeout: 120000, stdio: 'pipe' });
      installedPackages.add(packageName);
      safeLog(`[CodeRunner] Installed ${packageName}`);
      return true;
    } catch (err) {
      continue;
    }
  }

  safeLog(`[CodeRunner] Failed to install ${packageName}`);
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
    safeLog(`[CodeRunner] npm package ${packageName} not in safe list`);
    return false;
  }

  try {
    execSync(`npm install -g ${packageName}`, { timeout: 120000, stdio: 'pipe' });
    installedNpmPackages.add(packageName);
    safeLog(`[CodeRunner] Installed npm package: ${packageName}`);
    return true;
  } catch {
    return false;
  }
}

const RUNNERS = {
  python: {
    ext: '.py',
    cmd: '/usr/bin/python3',
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
  c: {
    ext: '.c',
    compile: true,
    compileCmd: 'gcc',
    compileArgs: (file, outFile) => [file, '-o', outFile, '-lm'],
    cmd: (outFile) => outFile,
    args: (file, cliArgs) => cliArgs,
  },
  cpp: {
    ext: '.cpp',
    compile: true,
    compileCmd: 'g++',
    compileArgs: (file, outFile) => [file, '-o', outFile, '-std=c++17'],
    cmd: (outFile) => outFile,
    args: (file, cliArgs) => cliArgs,
  },
  java: {
    ext: '.java',
    compile: true,
    compileCmd: 'javac',
    compileArgs: (file) => [file],
    cmd: () => 'java',
    args: (file, cliArgs, className) => ['-cp', join(tmpdir()), className, ...cliArgs],
    extractClassName: (code) => {
      const match = code.match(/public\s+class\s+(\w+)/);
      return match ? match[1] : 'Main';
    },
  },
  go: {
    ext: '.go',
    cmd: 'go',
    args: (file, cliArgs) => ['run', file, ...cliArgs],
  },
  rust: {
    ext: '.rs',
    compile: true,
    compileCmd: 'rustc',
    compileArgs: (file, outFile) => [file, '-o', outFile],
    cmd: (outFile) => outFile,
    args: (file, cliArgs) => cliArgs,
  },
};

async function compileCode(runner, filepath, outFile, className) {
  return new Promise((resolve) => {
    const compileArgs = runner.compileArgs(filepath, outFile, className);
    const proc = spawn(runner.compileCmd, compileArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({ success: false, error: 'Compilation timeout (30s limit)' });
    }, 30000);

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      if (exitCode === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: stderr || `Compilation failed with exit code: ${exitCode}` });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ success: false, error: `Compiler not found: ${err.message}` });
    });
  });
}

async function executeCode(code, language, input = '', args = [], retryCount = 0) {
  const runner = RUNNERS[language];
  if (!runner) {
    return { success: false, error: `Unsupported language: ${language}` };
  }

  const uuid = randomUUID();
  const filename = `code_${uuid}${runner.ext}`;
  const filepath = join(tmpdir(), filename);
  const outFile = join(tmpdir(), `code_${uuid}`);

  let processedCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (language === 'bash' && !processedCode.startsWith('#!')) {
    processedCode = '#!/bin/bash\n' + processedCode;
  }

  // For Java, extract class name and rename file
  let className = null;
  let javaFilepath = filepath;
  if (language === 'java' && runner.extractClassName) {
    className = runner.extractClassName(processedCode);
    javaFilepath = join(tmpdir(), `${className}.java`);
  }

  const actualFilepath = language === 'java' ? javaFilepath : filepath;

  try {
    await writeFile(actualFilepath, processedCode);

    // Handle compiled languages
    if (runner.compile) {
      const compileResult = await compileCode(runner, actualFilepath, outFile, className);
      if (!compileResult.success) {
        await unlink(actualFilepath).catch(() => {});
        return compileResult;
      }
    }

    return new Promise((resolve) => {
      const cmd = runner.compile ? runner.cmd(outFile) : runner.cmd;
      const runArgs = runner.compile
        ? runner.args(actualFilepath, args, className)
        : runner.args(actualFilepath, args);

      const proc = spawn(cmd, runArgs, {
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
        unlink(actualFilepath).catch(() => {});
        if (runner.compile) {
          unlink(outFile).catch(() => {});
          if (language === 'java') {
            unlink(join(tmpdir(), `${className}.class`)).catch(() => {});
          }
        }

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
        unlink(actualFilepath).catch(() => {});
        if (runner.compile) unlink(outFile).catch(() => {});
        resolve({ success: false, error: err.message });
      });
    });
  } catch (err) {
    await unlink(actualFilepath).catch(() => {});
    if (runner.compile) await unlink(outFile).catch(() => {});
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
