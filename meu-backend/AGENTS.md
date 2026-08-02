# Backend — Express e TypeScript

## Código

- Todo código da aplicação e dos testes deve ser TypeScript com `strict: true`.
- Preserve as camadas `routes`, `controllers`, `services`, `middleware` e `config`.
- Controllers traduzem HTTP; regras e integrações ficam em services.
- Tipar `Request`, `Response`, payloads, respostas externas e variáveis de ambiente usadas pela aplicação.
- Valide entrada não confiável antes de acessar Supabase, Discord ou GitHub.

## API e segurança

- Nunca envie a chave de serviço do Supabase ao frontend.
- Rotas mutáveis exigem autenticação; ações administrativas exigem também autorização.
- Mensagens de erro públicas devem ser úteis sem revelar tokens, stack traces ou detalhes sensíveis.
- O catálogo de personagens deve ser determinístico e independente do sistema de arquivos do frontend.

## Verificação

- Use o runner nativo `node:test` para testes unitários.
- `npm run build` deve executar o typecheck e gerar `dist/`.
- `npm run dev` deve executar TypeScript diretamente em desenvolvimento.
- Execute `npm test` e `npm run build` antes da entrega.
