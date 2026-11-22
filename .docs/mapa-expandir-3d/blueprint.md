# Blueprint — expandir mapa e visão 3D

## Inventário do que existe

| Peça | Onde | Uso no plano |
| --- | --- | --- |
| `CaveMap` web | `src/features/maps/cave-map.web.tsx` | Canvas MapLibre GL JS; será extraído para `WebMapCanvas` e composto pela moldura compartilhada. |
| `CaveMap` nativo | `src/features/maps/cave-map.native.tsx` | Canvas MapLibre React Native; será extraído para `NativeMapCanvas` e composto pela moldura compartilhada. |
| Contrato de dados | `src/features/maps/map-data.ts` | `CaveMapProps`, `UnitMarker`, `validCoordinate`; reutilizados sem mudança. |
| Estilo do mapa | `MAP_STYLE_URL` (Liberty/OpenFreeMap) | Mantido; o Liberty já possui a camada `building-3d` (`fill-extrusion`, zoom ≥ 14). |
| Telas consumidoras | `/cavernas`, `/perfil/endereco`, onboarding | Nenhuma mudança de chamada: continuam usando `<CaveMap />`; os controles entram no componente. |
| Modal existente | `src/components/profile-photo.tsx`, `month-selector.tsx` | Padrão de `Modal` do React Native já usado no projeto; reutilizar a abordagem. |
| Tokens | `src/constants/theme.ts` | `Colors`, `BrandColors`, `Spacing` para os controles e o cabeçalho do modal. |

## Alternativas avaliadas

| Alternativa | Por que não |
| --- | --- |
| Fullscreen API do navegador | Não funciona em Android/iOS; exigiria duas implementações e não cobriria o app nativo. |
| Aumentar a altura inline | Menos útil para explorar o mapa e não resolve o desejo de "expandir" em tela cheia. |
| Trocar Liberty por um estilo 3D de outro provedor | O Liberty já entrega prédios extrudados; trocar exigiria chave/provedor e quebraria a identidade atual. |
| Terreno/elevação real | OpenFreeMap não fornece DEM no estilo atual; ficaria fora de escopo e dependente de novo provedor. |
| Duplicar a lógica de modal/3D em `.web.tsx` e `.native.tsx` | Duplicaria estado, acessibilidade e estilos; a moldura compartilhada evita divergência. |

## Desenho final

### Arquivos novos

- `src/features/maps/cave-map-shell.tsx`: moldura compartilhada. Recebe `CaveMapProps` + `Canvas` (`ComponentType<MapCanvasProps>`), mantém `expanded` e `is3D`, renderiza o mapa inline, os controles e o `Modal` de tela cheia.
- `src/features/maps/map-controls.tsx`: overlay acessível com o toggle `3D` e o botão `Expandir`; no modal, o botão de expandir é omitido.
- `src/features/maps/cave-map-shell.test.tsx`: testes da moldura com canvas mockado.

### Arquivos alterados

- `src/features/maps/cave-map.web.tsx`: passa a exportar `WebMapCanvas` (canvas) e `CaveMap` (composição com a moldura). Adiciona `pitch`/`bearing`/`maxPitch` na criação e `easeTo` ao alternar 3D.
- `src/features/maps/cave-map.native.tsx`: idem com `NativeMapCanvas`, `initialViewState` com `pitch`/`bearing` e `Camera.setStop` ao alternar 3D.
- `src/features/maps/cave-map.tsx`: mantém o re-export do entry web para o TypeScript; o Metro continua escolhendo `.web`/`.native`.

### Contrato de componentes

```ts
type MapCanvasProps = Omit<CaveMapProps, "height"> & { is3D: boolean };
```

`CaveMap` continua com a mesma assinatura pública (`center`, `units`, `selectedId`, `onUnitPress`, `height`). Nenhuma tela precisa passar props novas.

### Estado e comportamento

- `expanded`: local à moldura; abre/fecha o `Modal` (`animationType="slide"`, `presentationStyle="fullScreen"`, `onRequestClose` para o voltar do Android).
- `is3D`: local à moldura e compartilhado entre inline e modal.
- Ao ativar 3D: `pitch = 55`, `bearing = -20`, zoom mínimo 15 (somente se o zoom atual for menor), animação de ~600–700 ms, centro preservado.
- Ao desativar: `pitch = 0`, `bearing = 0`, zoom atual preservado.
- O canvas inline e o do modal são instâncias separadas (necessário no MapLibre); o modal só é montado quando aberto para liberar a segunda instância ao fechar.
- O canvas do modal é criado já com `pitch`/`bearing`/zoom 3D quando `is3D` está ativo, evitando um primeiro frame em 2D.
- Controles só aparecem quando há centro válido ou unidades; sem conteúdo, o estado vazio existente continua cobrindo o mapa.
- A atribuição OpenFreeMap/OpenMapTiles/OpenStreetMap permanece no canvas nativo e no controle padrão do MapLibre na web.

### Acessibilidade

- Botão 3D: `accessibilityRole="button"`, `accessibilityState={{ selected: is3D }}`, rótulo `Ativar visão 3D` / `Desativar visão 3D`.
- Expandir: rótulo `Expandir mapa`; fechar: `Fechar mapa`.
- Alvos de toque de 44×44; texto visível em PT-BR.

### Testes

- `cave-map-shell.test.tsx` com canvas mockado: renderização dos controles, abertura/fechamento do modal, propagação de `is3D`, encaminhamento de `onUnitPress` nos dois canvases e ausência de controles sem conteúdo.
- Testes existentes de `/cavernas` e perfil continuam mockando `CaveMap`; nenhuma mudança necessária.

## Duplicidades evitadas

- Estado, modal, controles, estilos e acessibilidade ficam em um único arquivo compartilhado.
- Os canvases de plataforma só cuidam do mapa imperativo e da câmera; não repetem a lógica de expandir/3D.
- Nenhum novo serviço, endpoint, store global ou dependência.

## Riscos e limites

- Duas instâncias MapLibre enquanto o modal está aberto; mitigado pelo unmount ao fechar.
- Zoom 15 ao ativar 3D pode tirar marcadores distantes da vista; o usuário pode afastar/arrastar.
- Prédios 3D dependem de `render_height` nos tiles e do zoom ≥ 14; em áreas sem altura o efeito é a inclinação.
- Validação nativa depende de development build; neste ambiente será registrada como lacuna.
