const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const defaultHeaders = {
  'ngrok-skip-browser-warning': 'true',
};

export type VersionInfo = {
  numero: string;
  atualizado_em?: string;
};

export type CharacterSummary = {
  nome: string;
  imagem: string;
};

export type MediaItem = {
  type: 'image' | 'video';
  src: string;
  caption: string;
};

export type SpeechBalloon = {
  text: string;
  sound: string;
};

export type Character = CharacterSummary & {
  media: MediaItem[];
  balloons: SpeechBalloon[];
};

export type ChangelogEntry = {
  commit_hash?: string;
  message: string;
  date: string;
  url?: string;
};

export type Comment = {
  id: number | string;
  nome: string;
  mensagem: string;
  criado_em: string;
  fixado: boolean;
  avatar_url: string | null;
};

export type CommentInput = Pick<Comment, 'mensagem'>;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...defaultHeaders, ...init?.headers },
  });

  if (!response.ok) throw new Error(`Falha na requisição: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchVersao(accessToken?: string): Promise<VersionInfo> {
  try {
    return await requestJson<VersionInfo>('/api/system/version', accessToken ? {
      headers: { Authorization: `Bearer ${accessToken}` },
    } : undefined);
  } catch {
    throw new Error('Erro ao buscar versão');
  }
}

export async function fetchPersonagens(accessToken?: string): Promise<CharacterSummary[]> {
  try {
    const data = await requestJson<unknown>('/api/characters', accessToken ? {
      headers: { Authorization: `Bearer ${accessToken}` },
    } : undefined);
    return Array.isArray(data) ? data as CharacterSummary[] : [];
  } catch {
    throw new Error('Erro ao buscar personagens');
  }
}

export async function fetchPersonagem(nome: string, accessToken?: string): Promise<Character | null> {
  const response = await fetch(`${API_URL}/api/characters/${encodeURIComponent(nome)}`, {
    headers: {
      ...defaultHeaders,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Erro ao buscar personagem');
  return response.json() as Promise<Character>;
}

export async function fetchChangelog(accessToken?: string): Promise<ChangelogEntry[]> {
  const data = await requestJson<unknown>('/api/system/changelog', accessToken ? {
    headers: { Authorization: `Bearer ${accessToken}` },
  } : undefined).catch(() => {
    throw new Error('Erro ao buscar changelog');
  });
  return Array.isArray(data) ? data as ChangelogEntry[] : [];
}

export async function fetchComentarios(accessToken?: string): Promise<Comment[]> {
  const data = await requestJson<unknown>('/api/system/comments', accessToken ? {
    headers: { Authorization: `Bearer ${accessToken}` },
  } : undefined).catch(() => {
    throw new Error('Erro ao buscar comentários');
  });
  return Array.isArray(data) ? data as Comment[] : [];
}

export function enviarComentario(payload: CommentInput, accessToken: string): Promise<Comment> {
  return requestJson<Comment>('/api/system/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    throw new Error('Erro ao salvar comentário no servidor');
  });
}

export async function checkAdmin(accessToken: string): Promise<{ isAdmin: boolean }> {
  const response = await fetch(`${API_URL}/api/system/check-admin`, {
    headers: { ...defaultHeaders, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return { isAdmin: false };
  return response.json() as Promise<{ isAdmin: boolean }>;
}

export function deletarComentarioAPI(commentId: Comment['id'], accessToken: string): Promise<{ sucesso: boolean }> {
  return requestJson<{ sucesso: boolean }>(`/api/system/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {
    throw new Error('Erro ao deletar comentário');
  });
}

export function fixarComentarioAPI(commentId: Comment['id'], fixado: boolean, accessToken: string): Promise<Comment> {
  return requestJson<Comment>(`/api/system/comments/${commentId}/pin`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ fixado }),
  }).catch(() => {
    throw new Error('Erro ao fixar/desfixar comentário');
  });
}

export async function syncDiscordAvatar(accessToken: string): Promise<{ avatar_url: string; atualizados: number } | null> {
  try {
    return await requestJson<{ avatar_url: string; atualizados: number }>('/api/system/profile/sync-avatar', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    return null;
  }
}
