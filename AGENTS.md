# Mangá do Luquinhas — instruções do repositório

## Arquitetura obrigatória

- O frontend usa Next.js App Router, React, TypeScript estrito e Tailwind CSS 4.
- O backend usa Express e TypeScript estrito.
- Não introduza novos arquivos JavaScript em `src/`; configurações `.mjs` são permitidas quando exigidas pelas ferramentas.
- Preserve o conteúdo em português do Brasil e a separação `meu-frontend` / `meu-backend`.

## Interface e backgrounds

- Toda imagem de fundo deve responder à rolagem com o componente compartilhado `ScrollBackground`, usando parallax suave e limitado.
- Não use `background-attachment: fixed`; a camada fixa controlada por JavaScript em `ScrollBackground` é a única exceção permitida para backgrounds.
- Conteúdo abaixo da dobra deve entrar progressivamente com o componente `Reveal` e `IntersectionObserver`.
- O layout deve funcionar em celular, teclado e `prefers-reduced-motion`.

## Verificação

- O comando local único é `npm run dev` na raiz.
- Antes de concluir alterações no frontend, rode `npm run lint`, `npm test` e `npm run build` em `meu-frontend`.
- Antes de concluir alterações no backend, rode `npm test` e `npm run build` em `meu-backend`.
- Não exponha valores de `.env` em logs, testes ou documentação.

As instruções mais específicas de `meu-frontend/AGENTS.md` e `meu-backend/AGENTS.md` prevalecem dentro dessas pastas.
