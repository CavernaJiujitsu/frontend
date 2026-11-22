# Plano — expandir mapa e alternar visão 3D

## Contexto

Demanda direta do usuário (sem card): no mapa, seria útil poder **expandir** e **mudar a visualização do estilo Liberty para 3D**. Hoje o `CaveMap` é exibido inline com altura fixa (180–210 px) em `/cavernas`, `/perfil/endereco` e no onboarding, sem ação de tela cheia e sem controle de inclinação. O estilo público OpenFreeMap Liberty já contém a camada `building-3d` (`fill-extrusion`), renderizada a partir do zoom 14, portanto o modo 3D não exige troca de provedor, nova chave nem dependência.

O usuário confirmou: aplicar somente no **app mobile/web** (não no preview do desktop), expandir em **modal de tela cheia** e, ao ativar 3D, **aproximar até o zoom 15** para os prédios aparecerem.

## Objetivo

Permitir que qualquer instância do `CaveMap` no app seja aberta em tela cheia e alterne entre visão 2D (topo) e 3D (inclinada com prédios extrudados), preservando centro, marcadores, seleção e navegação existentes.

## Requisitos funcionais

1. O mapa inline exibe dois controles sobrepostos: **Expandir** e **3D/2D**. O botão de expandir abre um modal de tela cheia com o mesmo centro, unidades, seleção e callback de toque.
2. No modal, o mapa ocupa a área útil da tela, mantém a atribuição OpenFreeMap/OpenMapTiles/OpenStreetMap visível e oferece botão de fechar (além do gesto/botão voltar do Android).
3. O estado 2D/3D é compartilhado entre o mapa inline e o modal: alternar em um reflete no outro e permanece ao abrir/fechar o modal.
4. Ao ativar 3D: animar `pitch` para ~55°, `bearing` para ~-20° e garantir zoom mínimo 15 (se o zoom atual for menor), mantendo o centro atual. Ao voltar para 2D: animar `pitch` e `bearing` para 0, preservando centro e zoom.
5. Seleção de marcador, destaque do item selecionado e `onUnitPress` continuam funcionando no mapa inline e no modal.
6. Estados existentes de mapa vazio, falha de tiles e carregamento continuam explícitos; falha no modal não pode bloquear a tela nem o mapa inline.
7. Controles acessíveis: rótulos em PT-BR (`Expandir mapa`, `Ativar visão 3D`, `Voltar para visão 2D`, `Fechar mapa`), `accessibilityRole="button"`, estado selecionado para 3D e alvo de toque de no mínimo 44×44.

## Requisitos não funcionais e regras

- Sem novas dependências e sem alteração de API/backend. Web e desktop continuam com MapLibre GL JS; nativo continua com `@maplibre/maplibre-react-native` via development build.
- Manter a separação de plataforma (`.web.tsx` / `.native.tsx`) e evitar duplicar a lógica de expandir/3D: extrair a moldura compartilhada e os controles para arquivos comuns em `src/features/maps/`.
- Usar tokens de `@/constants/theme` (sem hex solto), `SafeAreaView` no modal e `Modal` do React Native com `onRequestClose` para o voltar do Android.
- Comentários em inglês; strings de UI em PT-BR; vocabulário "caverna".
- Não alterar o comportamento de lista, filtros, busca, confirmação de endereço nem onboarding além do mapa.
- O modo 3D usa o mesmo estilo Liberty; não há terreno/elevação real no provedor, apenas prédios extrudados.

## Contrato de API consumido

Nenhum endpoint novo ou alterado. `CaveMap` continua recebendo `center`, `units`, `selectedId`, `onUnitPress` e `height`; a expansão e o 3D são estados locais de UI.

## Decisões de refinamento

| Tema | Decisão |
| --- | --- |
| Escopo | Confirmado pelo usuário: somente app mobile/web (`/cavernas`, `/perfil/endereco` e onboarding). Desktop fora deste incremento. |
| Expandir | Confirmado: modal de tela cheia, mantendo o mapa inline na página. |
| 3D | Confirmado: mesmo estilo Liberty com `pitch`/`bearing`; ao ativar, aproximar para zoom mínimo 15 para exibir a camada `building-3d`. |
| Estado | `expanded` e `is3D` vivem no `CaveMap`, não no store global. |
| Controles | Overlay no canto superior direito, com botão 2D/3D e botão expandir; no modal, botão fechar no cabeçalho e 3D no overlay. |
| Modal | `Modal` nativo do React Native (funciona em web via react-native-web), `animationType="slide"` e `presentationStyle="fullScreen"`; `SafeAreaView` para os insets. |
| Acessibilidade | Rótulos explícitos, estado `selected` no 3D e alvos ≥ 44×44. |

## Fora de escopo

- Terreno/elevação real (DEM), estilo 3D de outro provedor, mapa no desktop, seleção de endereço por toque livre, rotas, clusters, busca por viewport e mudanças de paginação.
- Persistir a preferência 2D/3D entre sessões ou entre telas.

## Critérios de aceite

1. `/cavernas`, `/perfil/endereco` e onboarding exibem os controles de expandir e 2D/3D sobre o mapa.
2. Tocar em expandir abre o mapa em tela cheia com os mesmos pinos e seleção; fechar retorna à tela anterior sem perder o estado da página.
3. Ativar 3D inclina o mapa, aplica zoom mínimo 15 e mostra prédios extrudados; voltar para 2D retorna ao topo preservando centro e zoom.
4. O estado 3D alternado no modal permanece ao fechar; alternar no inline reflete no modal.
5. Tocar em um pino no modal dispara o mesmo fluxo do mapa inline; a atribuição permanece visível.
6. `bun run lint`, `bunx tsc --noEmit` e os testes automatizados passam; falha de tiles continua mostrando fallback e não bloqueia lista/busca.

## Estratégia de testes

- Testes de componente com o canvas do mapa mockado: renderização dos controles, abertura/fechamento do modal, propagação de `is3D` para os canvases, preservação do estado e rótulos acessíveis.
- Manter os testes existentes de `/cavernas` e perfil passando (o mock de `CaveMap` não deve quebrar).
- Validação manual no navegador com tiles reais (expandir, 3D, seleção e atribuição). Build nativo não disponível neste ambiente: registrar a lacuna, sem declarar validação nativa.

## Riscos e pendências

1. **Segunda instância do mapa**: o modal cria outra instância MapLibre; garantir cleanup no unmount e aceitar o custo de tiles (cache do navegador).
2. **Zoom 15 ao ativar 3D**: pode tirar marcadores distantes da vista; o usuário pode afastar/arrastar normalmente. O centro atual é preservado.
3. **Prédios 3D**: dependem do esquema OpenMapTiles (`render_height`) e do zoom ≥ 14; em áreas sem dados de altura o efeito é apenas a inclinação.
4. **Modal na web**: `react-native-web` implementa `Modal`, mas o comportamento deve ser conferido no build web estático.
5. **MapLibre nativo**: `Camera` suporta `pitch`/`bearing`/`zoom`; validar em development build quando houver dispositivo.
