# Desenho

- `src/app/_layout.tsx`: ponto de montagem global único, para que o painel permaneça ao navegar.
- `src/components/debug-console.web.tsx`: efeito no browser; import dinâmico de `vconsole` e limpeza no unmount.
- `src/components/debug-console.tsx`: fallback nativo sem UI/efeitos.
- `.env.example`: flag de build `EXPO_PUBLIC_ENABLE_VCONSOLE`; produção desligada sem flag.
- `package.json`/`bun.lock`: instalar pacote de navegador com `bunx expo install vconsole --bun`.

Não utilizar `NODE_ENV=test` no bundle web: export do Expo usa modo de produção. A seleção de teste é uma variável pública explícita do build. Não são necessárias mudanças em API ou backend.
