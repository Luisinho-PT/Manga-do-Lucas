# Mangá do Luquinhas — React, TypeScript e Tailwind CSS 4

Conversão da aplicação Django localizada em `Mangá Do Lucas/Mangázin do Luquinhas` para a arquitetura atual deste repositório.

## Estrutura

- `meu-frontend`: Next.js 16, React 19, TypeScript estrito e Tailwind CSS 4.
- `meu-backend`: Express em TypeScript, Supabase, GitHub e Discord.
- `meu-frontend/public`: favicon e mídias estáticas da aplicação.

## Funcionalidades migradas

- Home com changelog, versão, autenticação e mural de recados.
- História, personagens e página sobre o projeto.
- Página individual de cada personagem com imagens e vídeos do Cloudinary.
- Interações especiais de Lucas, Luis e Ness.
- Redirecionamentos das URLs antigas do Django para as novas rotas em português.
- Imagens de background com parallax controlado.

## Versão

Versão atual: **0.5 (Beta)**.

## Commits e atualizações da Home

O changelog é opt-in: somente commits que começam com `[changelog]` aparecem na Home. Commits com `[no-changelog]` ou sem marcador não são exibidos.

Para criar um commit com escolha interativa, prepare os arquivos com `git add` e execute na raiz:

```powershell
npm run commit
```

O comando pergunta a mensagem e se o commit deve aparecer nas atualizações, adicionando o marcador correto automaticamente.

## Proteção de conteúdo e crawlers

- O site e as mídias são públicos; autenticação é exigida somente para comentar e executar ações administrativas.
- `robots.txt`, metadados e o cabeçalho `X-Robots-Tag` proíbem indexação, cache de busca e indexação de imagens.
- User-agents conhecidos de bots, scrapers e navegadores headless recebem `403`.
- O backend limita cada endereço IP a 80 leituras por minuto e responde `429` quando o limite é excedido.
- Imagens e vídeos bloqueiam menu de contexto e arraste. Impressão e atalhos comuns de captura recebem uma tela de proteção, que também aparece quando a janela perde foco.
- Cabeçalhos impedem que o site seja embutido em frames e desativam a API de captura de tela do navegador.

O sistema operacional sempre pode capturar o que foi exibido na tela, e bots maliciosos podem imitar um navegador comum. Essas medidas são barreiras de dissuasão, não DRM ou proteção absoluta.

## Executar localmente

Na raiz do projeto, execute:

```powershell
npm run dev
```

Esse comando inicia o frontend e o backend no mesmo terminal. Use `Ctrl+C` para encerrar os dois.

### Executar separadamente

Em um terminal:

```powershell
cd meu-backend
npm install
npm run dev
```

Em outro terminal:

```powershell
cd meu-frontend
npm install
npm run dev
```

O frontend abre em `http://localhost:3000` e encaminha `/api/*` para o backend em `http://localhost:3001`.

## Variáveis de ambiente

Frontend (`meu-frontend/.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BACKEND_URL` (opcional; padrão `http://localhost:3001`)

Backend (`meu-backend/.env`):

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GITHUB_TOKEN`
- `FRONTEND_URL`
- `DISCORD_BOT_TOKEN`
- `ADMIN_DISCORD_IDS`
- `PRIVATE_ACCESS_EMAILS` (opcional; restringe comentários e ações autenticadas a uma allowlist)

## Verificação

```powershell
cd meu-frontend
npm run lint
npm test
npm run build

cd ../meu-backend
npm test
npm run build
```
