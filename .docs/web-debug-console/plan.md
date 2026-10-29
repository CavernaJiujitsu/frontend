# Console de depuração para Expo Web

## Contexto e objetivo
Demanda direta: disponibilizar no navegador do computador e celular um painel de logs/rede para depurar o frontend Expo Web, somente em desenvolvimento local e no ambiente publicado de teste.

## Requisitos e decisões aprovadas pelo pedido
- Usar `vconsole` (Tencent), criado para web mobile e compatível com browser desktop; React Native DevTools é voltado ao runtime nativo/Hermes, e `react-native-vconsole` é voltado a React Native nativo.
- Carregar a biblioteca somente no browser, depois da montagem (SSR seguro), sem afetar iOS/Android.
- Ativar no desenvolvimento local (`__DEV__`) ou em build web de teste com `EXPO_PUBLIC_ENABLE_VCONSOLE=true`; produção deve ficar desligada por padrão.
- Documentar que a flag é pública, definida no momento do build e deve ser habilitada só no ambiente de teste.
- Alterar apenas frontend e publicar diretamente na `main`, conforme autorização do usuário.

## Critérios de aceite
1. Painel aparece em Expo Web local e no build de teste com a flag explícita.
2. Build publicado sem flag (inclusive main/prod) e plataforma nativa não inicializam o painel.
3. TypeScript, lint e export web passam; artefatos registram testes.

## Fora de escopo e riscos
Não é um depurador do runtime nativo; logs do painel podem conter dados pessoais ou tokens. Não ativar a flag em produção nem usá-lo para armazenar segredos.
