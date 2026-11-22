# Implementação — expandir mapa e visão 3D

## O que foi feito

- **Moldura compartilhada** em `src/features/maps/cave-map-shell.tsx`: mantém `expanded` e `is3D`, renderiza o mapa inline, os controles e o `Modal` de tela cheia. O modal só é montado quando aberto, liberando a segunda instância MapLibre ao fechar.
- **Controles** em `src/features/maps/map-controls.tsx`: toggle `3D` (com estado selecionado) e botão `Expandir`, com rótulos acessíveis em PT-BR e alvos de 44×44.
- **Canvas web** (`src/features/maps/cave-map.web.tsx`): extraído para `WebMapCanvas`; cria o mapa com `pitch`/`bearing`/`maxPitch` quando o 3D já está ativo, anima `easeTo` ao alternar e garante zoom mínimo 15 no 3D. O fallback de erro passou a ser um overlay absoluto visível (antes o texto ficava fora da área recortada).
- **Canvas nativo** (`src/features/maps/cave-map.native.tsx`): extraído para `NativeMapCanvas`; usa `initialViewState` com `pitch`/`bearing`, acompanha o zoom por `onRegionDidChange` e aplica `Camera.setStop` ao alternar 2D/3D.
- **Testes** em `src/features/maps/cave-map-shell.test.tsx`: controles, abertura/fechamento do modal, estado 3D compartilhado, encaminhamento de `onUnitPress` nos dois canvases e ausência de controles sem conteúdo.
- **Docs**: `plan.md` e `blueprint.md` desta demanda.

## Decisões e desvios

- Mantido o estilo público Liberty; o 3D usa a camada `building-3d` já existente, com `pitch = 55`, `bearing = -20` e zoom mínimo 15.
- `expanded` e `is3D` são locais ao `CaveMap`; não foram para store global nem persistidos, conforme o plano.
- Controles não aparecem quando não há centro válido nem unidades, para não abrir um modal vazio.
- Nenhuma dependência, endpoint, store ou alteração de backend.
- Não foi alterado o preview de mapa do `caverna-desktop` (fora do escopo aprovado).

## Validação executada

- `bun run lint`: passou (1 aviso antigo de `require()` em `schedule-screen-test.tsx`).
- `bunx tsc --noEmit`: passou.
- `bunx jest --runInBand`: 35 suítes, 244 testes passando.
- `bunx expo-doctor`: 21/21 checks.
- `bunx expo export --platform all`: export web/Android/iOS concluído.
- Smoke test Playwright no export web estático com API mockada: controles inline visíveis, modal aberto, 3D ativado, 2 canvases MapLibre e modal fechado com o botão Expandir disponível novamente. Evidências visuais em `/tmp/opencode/cavernas-inline.png` e `/tmp/opencode/cavernas-3d.png` (fora do repositório).

## Pendências

- Validar em **development build** Android/iOS (o ambiente não tem dispositivo/emulador nem build nativo instalada).
- Repetir o fluxo com backend/autenticação reais; o smoke usou API mockada para isolar o mapa.
- Conferir visualmente falha de tiles, estado vazio e o botão voltar do Android em dispositivo.
