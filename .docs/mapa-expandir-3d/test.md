# Testes — expandir mapa e visão 3D

## Ambiente

- `frontend` Expo SDK 57, Bun, export web estático servido em `http://localhost:4173` com `python3 -m http.server`.
- API mockada no smoke de navegador via `page.route` do Playwright em `http://localhost:3000` (sem backend/DB reais).
- Viewport do smoke: 390×844 (mobile), Chromium headless; locale `pt-BR`.
- Sem emulador Android/iOS nem development build disponíveis neste ambiente.

## Checks do projeto

| Comando | Resultado |
| --- | --- |
| `bun run lint` | Passou; 1 aviso antigo de `require()` em `src/components/__tests__/schedule-screen-test.tsx`, sem erros. |
| `bunx tsc --noEmit` | Passou sem erros. |
| `bunx jest --runInBand` | 35 suítes, 244 testes passando. |
| `bunx expo-doctor` | 21/21 checks passando. |
| `bunx expo export --platform all` | Export web, Android e iOS concluído. |

## Matriz de casos

| Caso | Esperado | Obtido |
| --- | --- | --- |
| Mapa inline com centro e unidades | Controles `3D` e `Expandir` visíveis sobre o mapa | Passou (smoke + teste automatizado). |
| Toque em `Expandir` | Modal de tela cheia com título, fechar e os mesmos pinos | Passou (smoke; screenshot `/tmp/opencode/cavernas-inline.png`). |
| 3D no modal | Inclina, aplica zoom mínimo 15 e mostra prédios extrudados | Passou (smoke; screenshot `/tmp/opencode/cavernas-3d.png` com prédios). |
| Estado 3D compartilhado | Alternar no modal reflete no inline e permanece ao fechar | Passou no teste automatizado `cave-map-shell.test.tsx`. |
| Pinos inline e no modal | `onUnitPress` dispara o mesmo fluxo nos dois canvases | Passou no teste automatizado. |
| Sem centro e sem unidades | Controles não aparecem; estado vazio existente permanece | Passou no teste automatizado. |
| Fechar modal | Volta para a tela anterior e `Expandir` volta a aparecer | Passou (smoke). |
| Voltar do Android | `onRequestClose` fecha o modal | Código presente; não validado em dispositivo. |
| Falha de tiles | Fallback textual sem bloquear lista/busca | Código preservado; não simulado no navegador. |
| Build nativo | Mapa, pitch e modal em Android/iOS | Não validado; sem development build/dispositivo. |

## Evidências do smoke

- `inline controls visible`
- `modal open`
- `3D active`
- `maplibre canvases: 2`
- `expand visible after close: 1`

O smoke confirmou o fluxo completo no export web com tiles reais do OpenFreeMap e API mockada.

## Como reproduzir

```bash
cd frontend
bun run lint
bunx tsc --noEmit
bunx jest --runInBand
bunx expo-doctor
bunx expo export --platform all
# servir dist e abrir /cavernas com sessão de teste e API mockada
```

## Fora de cobertura

- **Android/iOS:** o MapLibre React Native exige development build; não há emulador/dispositivo neste ambiente. O bundle foi exportado, mas isso não substitui o teste nativo.
- **Backend real:** o fluxo foi exercitado com respostas mockadas de `GET /api/v1/caves` e `GET /api/v1/practitioners/:id`; não houve autenticação nem banco reais.
- **Falha de tiles e estado vazio:** preservados no código, sem simulação visual nesta rodada.

**Status:** fluxo web validado por checks, testes automatizados e smoke com tiles reais; experiência nativa pendente de development build.
