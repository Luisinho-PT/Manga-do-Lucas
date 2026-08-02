-- Vincula novos comentários à identidade autenticada e impede acesso direto
-- pelas chaves públicas. A API Express, usando a chave secreta do servidor,
-- continua responsável por todas as operações.
alter table public.comments
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists comments_user_id_idx on public.comments(user_id);

alter table public.comments enable row level security;

revoke all on table public.comments from anon, authenticated;
grant select, insert, update, delete on table public.comments to service_role;
