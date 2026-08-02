const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const children = [];
let shuttingDown = false;

function start(name, directory) {
  const child = spawn(npmCommand, ['run', 'dev'], {
    cwd: path.join(projectRoot, directory),
    env: process.env,
    shell: isWindows,
    stdio: 'inherit',
  });

  children.push(child);

  child.on('error', (error) => {
    console.error(`[${name}] Não foi possível iniciar: ${error.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;

    if (signal) {
      console.error(`[${name}] encerrado pelo sinal ${signal}.`);
    } else if (code !== 0) {
      console.error(`[${name}] encerrado com código ${code}.`);
    }

    shutdown(code || 0);
  });
}

function stopChild(child) {
  if (!child.pid || child.exitCode !== null) return;

  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
  } else {
    child.kill('SIGTERM');
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) stopChild(child);
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (error) => {
  console.error(error);
  shutdown(1);
});

console.log('Iniciando Mangá do Luquinhas...');
console.log('Frontend: http://localhost:3000');
console.log('Backend:  http://localhost:3001');
console.log('Pressione Ctrl+C para encerrar os dois serviços.\n');

start('backend', 'meu-backend');
start('frontend', 'meu-frontend');
