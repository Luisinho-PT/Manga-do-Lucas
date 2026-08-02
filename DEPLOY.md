# Publicação do Mangá do Luquinhas

O projeto está preparado para usar o frontend Next.js na Vercel e a API Express no Render. Hoje apenas `meu-frontend` possui o histórico Git próprio; por isso, a opção de menor risco é publicar `meu-frontend` e `meu-backend` como dois repositórios separados. Não envie nenhum arquivo `.env` ao Git.

## 1. Banco e autenticação

1. No SQL Editor do Supabase, execute `meu-backend/supabase/migrations/202608020001_secure_comment_ownership.sql` antes de publicar a nova API.
2. Em Authentication > URL Configuration, defina a URL de produção da Vercel como Site URL e permita `https://SEU-DOMINIO/auth/callback` nos Redirect URLs.
3. Nos provedores Google e Discord, mantenha o callback do próprio Supabase configurado.
4. Para o backend, prefira a nova Secret key do Supabase. Ela nunca deve usar o prefixo `NEXT_PUBLIC_` nem entrar na Vercel.

## 2. Backend no Render

1. Crie um repositório para o conteúdo de `meu-backend` e conecte-o ao Render como Web Service/Blueprint. O arquivo `render.yaml` já define build, start e health check.
2. Preencha no painel do Render todas as variáveis marcadas com `sync: false`. Use em `FRONTEND_URL` apenas a origem final, por exemplo `https://manga.exemplo.com`, sem barra no fim. Mais de uma origem pode ser separada por vírgula.
3. Use `SUPABASE_SECRET_KEY`; `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_KEY` permanecem apenas como compatibilidade temporária com projetos antigos.
4. O endpoint de saúde é `GET /api/health`. O Render o usa para só promover uma versão que esteja respondendo.

## 3. Frontend na Vercel

1. Importe o repositório que já existe em `meu-frontend`. A Vercel detecta Next.js pelo `vercel.json`.
2. Cadastre `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `BACKEND_URL` em Production e Preview. `BACKEND_URL` deve ser a origem do Render, sem `/api` e sem barra final.
3. Não cadastre `NEXT_PUBLIC_API_URL` em produção. Assim o navegador chama `/api` na própria Vercel, e o rewrite server-side encaminha para o Render sem expor uma segunda origem à interface.
4. Depois do primeiro deploy, volte ao Render e confirme que `FRONTEND_URL` contém a origem definitiva da Vercel ou do domínio personalizado.

## 4. Verificação depois do deploy

- Abra `/api/health` pelo domínio da Vercel e confirme `{"status":"ok"}`.
- Entre com Discord, publique um comentário e troque o avatar. Ao recarregar a home, o avatar deve ser consultado novamente; com a página aberta, a sincronização ocorre a cada 15 minutos.
- Confirme no Supabase que os comentários novos possuem `user_id`; os antigos continuam visíveis com `user_id` nulo.
- Teste uma origem não cadastrada contra o Render e confirme o bloqueio de CORS.

## Limites conhecidos

O bloqueio de crawler reduz bots simples, mas não impede automação que imite um navegador real. Da mesma forma, nenhuma aplicação web consegue impedir captura de tela pelo sistema operacional; a proteção atual é apenas uma barreira de interface. Os rate limits atuais ficam em memória e funcionam bem em uma instância pequena. Se o backend crescer para várias instâncias, migre os contadores para Redis/Upstash.
