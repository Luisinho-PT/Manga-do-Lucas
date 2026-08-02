# Frontend — Next.js, React, TypeScript e Tailwind CSS 4

## Código

- Todo código em `src/` deve ser `.ts` ou `.tsx`, com `strict: true`.
- Tipar props, respostas da API, dados do Supabase, handlers e referências do DOM.
- Use Server Components por padrão; adicione `use client` somente para estado, efeitos ou APIs do navegador.
- Use o alias `@/*` para imports internos.

## Estilos

- Use classes utilitárias do Tailwind CSS 4 diretamente nos componentes.
- Centralize tokens, animações e poucos estilos globais inevitáveis em `src/app/globals.css` usando a sintaxe CSS-first do Tailwind 4.
- Não crie CSS Modules, CSS-in-JS nem configuração `tailwind.config.js` sem necessidade comprovada.
- Imagens de background usam `src/components/ScrollBackground.tsx`, com uma camada fixa e parallax limitado pelo progresso do scroll; não use `background-attachment: fixed`.
- Seções e cards abaixo da dobra usam `src/components/Reveal.tsx`; não implemente listeners de scroll individuais em cada componente.
- Preserve foco visível, contraste, texto alternativo e suporte a movimento reduzido.

## Next.js

- Mantenha o App Router em `src/app`.
- Use `next/link` para navegação interna e `next/image` para imagens locais quando adequado.
- Não acople o frontend ao sistema de arquivos do backend; dados dinâmicos vêm de `src/lib/api.ts`.

## Testes

- Testes de componentes usam Testing Library e arquivos `.test.tsx`.
- Testes de módulos usam `.test.ts`.
- Execute `npm run lint`, `npm test -- --runInBand` e `npm run build` antes da entrega.
