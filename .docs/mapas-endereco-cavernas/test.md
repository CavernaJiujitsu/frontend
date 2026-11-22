# Testes — mapas OpenFreeMap

## Executados

- `frontend`: `bun run lint` passou com um aviso antigo de `require()` em `schedule-screen-test.tsx`; `bunx tsc --noEmit` passou; `bun run test --runInBand --silent --forceExit` passou (34 suítes, 241 testes); `bunx expo export --platform all` gerou web, Android e iOS sem erro; `bunx expo-doctor` passou (21 checks).
- `caverna-desktop`: `npm run lint` e `npm run build` passaram; `npm run test:run -- --reporter=dot` passou (49 arquivos, 248 testes). A primeira execução falhou em 2 testes: um conflito de mensagens de status do mapa, corrigido antes da repetição, e um teste de contexto intermitente que passou isolado e na repetição. jsdom registra avisos sobre canvas não implementado; não representa verificação visual do mapa.
- URL de estilo `https://tiles.openfreemap.org/styles/liberty` respondeu com JSON de estilo versão 8.

## Pendências de validação

- Abrir as quatro telas em navegador real, verificar tiles, atribuição, pinos e seleção com API/autenticação de desenvolvimento.
- Instalar **development build** Android/iOS e verificar carregamento nativo e pinos em dispositivo/simulador. Export do bundle não equivale a compilar o código nativo ou testar em aparelho; Expo Go não contém o módulo MapLibre.
- Verificar disponibilidade do serviço público e política/atribuição antes da publicação; não há SLA.

**Status:** implementação parcial validada estaticamente e por testes automatizados; experiência visual e builds nativos ainda não verificados. Não declarar a feature finalizada nem publicada até completar essas verificações.
