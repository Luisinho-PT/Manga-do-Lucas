import 'dotenv/config';

type GitHubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date: string };
  };
};

export type ChangelogEntry = {
  commit_hash: string;
  message: string;
  date: string;
  url: string;
};

const CACHE_TTL_MS = 5 * 60_000;
let cachedCommits: ChangelogEntry[] | null = null;
let cacheExpiresAt = 0;
let pendingRequest: Promise<ChangelogEntry[]> | null = null;

function isGitHubCommit(value: unknown): value is GitHubCommit {
  if (!value || typeof value !== 'object') return false;
  const commit = value as Partial<GitHubCommit>;
  return typeof commit.sha === 'string'
    && typeof commit.html_url === 'string'
    && typeof commit.commit?.message === 'string'
    && typeof commit.commit?.author?.date === 'string';
}

async function fetchCommits(): Promise<ChangelogEntry[]> {
  const owner = process.env.REPO_OWNER || 'Luisinho-PT';
  const repo = process.env.REPO_NAME || 'Manga-do-Lucas';
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`;
  const headers: Record<string, string> = { 'User-Agent': 'MangaDoLucas/1.0' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Erro no GitHub: ${response.status} ${response.statusText}`);

  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) throw new Error('Resposta inválida do GitHub.');

  return raw
    .filter(isGitHubCommit)
    .filter((entry) => {
      const message = entry.commit.message.toLowerCase();
      return message.includes('[changelog]') && !message.includes('[no-changelog]');
    })
    .map((entry) => {
      const cleaned = entry.commit.message
        .replace(/\[changelog\]/gi, '')
        .replace(/\[no-changelog\]/gi, '')
        .trim();
      return {
        commit_hash: entry.sha,
        message: cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : 'Atualização do projeto',
        date: entry.commit.author.date,
        url: entry.html_url,
      };
    })
    .slice(0, 6);
}

const GithubService = {
  async getCommitsDireto(): Promise<ChangelogEntry[]> {
    if (cachedCommits && Date.now() < cacheExpiresAt) return cachedCommits;
    if (pendingRequest) return pendingRequest;

    pendingRequest = fetchCommits()
      .then((commits) => {
        cachedCommits = commits;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return commits;
      })
      .catch((error: unknown) => {
        console.error('Falha ao buscar commits:', error instanceof Error ? error.message : error);
        return cachedCommits ?? [];
      })
      .finally(() => {
        pendingRequest = null;
      });

    return pendingRequest;
  },
};

export default GithubService;
