import supabase from '../config/supabase';

export type Comment = {
  id: number | string;
  nome: string;
  mensagem: string;
  criado_em: string;
  fixado: boolean;
  avatar_url: string | null;
};

export type CommentInput = Pick<Comment, 'nome' | 'mensagem' | 'fixado' | 'avatar_url'> & {
  user_id: string;
};

const COMMENT_FIELDS = 'id,nome,mensagem,criado_em,fixado,avatar_url';

export type SystemVersion = {
  numero: string;
  atualizado_em?: string;
};

const SystemService = {
  async getComments(): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(COMMENT_FIELDS)
      .order('fixado', { ascending: false })
      .order('criado_em', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Comment[];
  },

  async createComment(commentData: CommentInput): Promise<Comment> {
    if (commentData.fixado) {
      const { error } = await supabase.from('comments').update({ fixado: false }).neq('id', 0);
      if (error) throw new Error(error.message);
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select(COMMENT_FIELDS)
      .single();

    if (error) throw new Error(error.message);
    return data as Comment;
  },

  async getLastVersion(): Promise<SystemVersion | null> {
    const { data, error } = await supabase
      .from('system_versions')
      .select('numero,atualizado_em')
      .order('atualizado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as SystemVersion | null;
  },

  async deleteComment(commentId: string): Promise<{ sucesso: true }> {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw new Error(error.message);
    return { sucesso: true };
  },

  async togglePin(commentId: string): Promise<Comment> {
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('fixado')
      .eq('id', commentId)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    const novoEstado = !comment.fixado;

    if (novoEstado) {
      const { error } = await supabase.from('comments').update({ fixado: false }).neq('id', commentId);
      if (error) throw new Error(error.message);
    }

    const { data, error } = await supabase
      .from('comments')
      .update({ fixado: novoEstado })
      .eq('id', commentId)
      .select(COMMENT_FIELDS)
      .single();

    if (error) throw new Error(error.message);
    return data as Comment;
  },

  async updateAvatarByUserId(userId: string, avatarUrl: string): Promise<{ atualizados: number }> {
    const { data, error } = await supabase
      .from('comments')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', userId)
      .select('id');

    if (error) throw new Error(error.message);
    return { atualizados: data?.length ?? 0 };
  },
};

export default SystemService;
