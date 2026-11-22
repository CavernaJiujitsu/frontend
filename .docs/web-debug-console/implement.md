# Implementação

- `vconsole` instalado com `bunx expo install vconsole --bun` (package e lockfile atualizados); ao transferir para `dev`, o lockfile foi reconciliado com `bun install` para preservar as versões dessa branch.
- `src/components/debug-console.web.tsx` monta o console via import dinâmico no browser, somente em `__DEV__` ou com `EXPO_PUBLIC_ENABLE_VCONSOLE=true`, destruindo-o no unmount.
- `src/components/debug-console.tsx` mantém nativo sem painel. `src/app/_layout.tsx` monta a versão adequada uma vez na raiz.
- `.env.example` descreve a flag pública desativada por padrão e sua ativação apenas no build de teste.

Pendente externo: configurar a flag no serviço que compila o frontend de teste. A pipeline de `main` não foi alterada e portanto não configura a flag.
