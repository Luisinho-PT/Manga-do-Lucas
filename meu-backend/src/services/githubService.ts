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

function isGitHubCommit(value: unknown): value is GitHubCommit {
  if (!value || typeof value !== 'object') return false;
  const commit = value as Partial<GitHubCommit>;
  return typeof commit.sha === 'string'
    && typeof commit.html_url === 'string'
    && typeof commit.commit?.message === 'string'
    && typeof commit.commit?.author?.date === 'string';
}

const GithubService = {
  async getCommitsDireto(): Promise<ChangelogEntry[]> {
    const owner = process.env.REPO_OWNER || 'Luisinho-PT';
    const repo = process.env.REPO_NAME || 'Manga-do-Lucas';
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`;

    try {
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
    } catch (error) {
      console.error('Falha ao buscar commits:', error instanceof Error ? error.message : error);
      return [];
    }
  },
};

export default GithubService;
