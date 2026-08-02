const { spawnSync } = require('node:child_process');
const { createInterface } = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

function runGit(args, stdio = 'inherit') {
  return spawnSync('git', args, { encoding: 'utf8', stdio, windowsHide: true });
}

async function main() {
  const staged = runGit(['diff', '--cached', '--quiet'], 'ignore');
  if (staged.status === 0) {
    console.error('Nenhuma alteração preparada. Use git add antes de criar o commit.');
    process.exitCode = 1;
    return;
  }
  if (staged.status !== 1) {
    console.error('Não foi possível verificar as alterações preparadas.');
    process.exitCode = staged.status || 1;
    return;
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    let message = process.argv.slice(2).join(' ').trim();
    if (!message) message = (await prompt.question('Mensagem do commit: ')).trim();
    message = message.replace(/\[(?:no-)?changelog\]/gi, '').trim();

    if (!message) {
      console.error('A mensagem do commit não pode ficar vazia.');
      process.exitCode = 1;
      return;
    }

    stdout.write('\nEsse commit deve aparecer nas atualizações da Home?\n');
    stdout.write('  1. Sim — adicionar [changelog]\n');
    stdout.write('  2. Não — adicionar [no-changelog]\n\n');
    const choice = (await prompt.question('Escolha 1 ou 2: ')).trim().toLowerCase();
    const visible = choice === '1' || choice === 's' || choice === 'sim';
    const marker = visible ? '[changelog]' : '[no-changelog]';
    const result = runGit(['commit', '-m', `${marker} ${message}`]);
    process.exitCode = result.status || 0;
  } finally {
    prompt.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
