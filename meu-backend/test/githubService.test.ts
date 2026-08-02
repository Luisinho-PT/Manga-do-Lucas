import assert from 'node:assert/strict';
import test from 'node:test';
import GithubService from '../src/services/githubService';

test('exibe somente commits marcados explicitamente para o changelog', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify([
    {
      sha: 'visivel',
      html_url: 'https://github.com/example/repo/commit/visivel',
      commit: { message: '[changelog] nova área do mural', author: { date: '2026-08-02T00:00:00Z' } },
    },
    {
      sha: 'oculto-explicito',
      html_url: 'https://github.com/example/repo/commit/oculto-explicito',
      commit: { message: '[no-changelog] ajuste interno', author: { date: '2026-08-02T00:00:00Z' } },
    },
    {
      sha: 'oculto-por-padrao',
      html_url: 'https://github.com/example/repo/commit/oculto-por-padrao',
      commit: { message: 'commit sem marcador', author: { date: '2026-08-02T00:00:00Z' } },
    },
  ]), { status: 200, headers: { 'Content-Type': 'application/json' } });

  try {
    const commits = await GithubService.getCommitsDireto();
    assert.equal(commits.length, 1);
    assert.equal(commits[0]?.commit_hash, 'visivel');
    assert.equal(commits[0]?.message, 'Nova área do mural');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
