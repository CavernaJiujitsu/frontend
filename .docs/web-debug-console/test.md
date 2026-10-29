# Validação

## Comandos e resultados
- `bun install --frozen-lockfile`: passou antes da instalação do novo pacote.
- `bunx expo install vconsole --bun`: instalado `vconsole@3.15.1`.
- `bunx tsc --noEmit && bunx expo lint`: passou.
- `EXPO_PUBLIC_API_URL=https://api.example.test EXPO_PUBLIC_ENABLE_VCONSOLE=false bunx expo export --platform web`: exportou 32 rotas e `dist/index.html` em `dev`.
- `EXPO_PUBLIC_API_URL=https://api.example.test EXPO_PUBLIC_ENABLE_VCONSOLE=true bunx expo export --platform web`: exportou 32 rotas e `dist/index.html` em `dev`.
- `git diff --check`: passou.

## Matriz de comportamento
- Web local com `__DEV__`: habilitado automaticamente.
- Web exportado com flag `true`: inicializa após montar no browser.
- Web exportado sem flag ou com flag `false`: não inicializa o painel.
- Nativo: componente fallback retorna `null` e não importa a biblioteca web.
- SSR: efeito não executado no servidor.

Não há suíte automatizada nem navegador end-to-end configurado para este painel; renderização/interação visual precisam ser verificadas manualmente após habilitar a flag no ambiente de teste. Os exports são de build; não comprovam que a flag foi configurada no host de teste.
