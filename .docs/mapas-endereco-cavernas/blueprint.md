# Blueprint — mapas OpenFreeMap

## Reuso

- `listCaves` e `Cave.units` já contêm caveId, unitId, coordenadas, estado ativo e endereço; sem novos endpoints ou módulo de backend.
- `searchAddresses`, `updatePractitioner` e `AddressLocator` continuam sendo a fonte de endereço; OpenFreeMap fornece tiles, não geocodificação.
- Reutilizar `ScreenLayout`, `BottomNavbar`, resultados existentes, estado de filtros e navegação; mapa é uma visualização adicional.

## Desenho

- Adaptador compartilhado de dados em `frontend/src/features/maps/`: converte cavernas em marcadores de unidades ativas, ignora coordenadas inválidas, preserva caveId e unitId. Contrato comum `{centro?, unidades, selecionadaId?, onUnidadePress?}`.
- `CaveMap.web.tsx` carrega MapLibre GL JS no cliente; `CaveMap.native.tsx` carrega MapLibre React Native em development build; ambos recebem mesmo estilo OpenFreeMap, centralizam ao selecionar coordenadas e exibem atribuição. Falhas deixam lista/busca funcionando.
- Em `/perfil/endereco`, trocar ilustração por mapa real; seleção de endereço muda centro/pino sem salvar automaticamente.
- Em `/cavernas` e onboarding, mapa mostra unidades dos resultados efetivamente carregados; toque no pino leva à ação da caverna existente.
- `caverna-desktop`: componente de mapa web reutilizável nos formulários via `AddressLocator` como prévia das coordenadas; entrada manual e validação permanecem.
- Sem dependência entre `frontend` e `caverna-desktop`: cada app instala MapLibre, compartilha apenas o mesmo contrato de dados (não importa arquivos do outro repo).

## Riscos/testes

- Web usa carregamento cliente e CSS do MapLibre; nativo não deve entrar no bundle web. Validar lint, tsc, testes, build web, testes no navegador e, se disponível, development builds nativos.
- Instância pública sem SLA; renderizar fallback e não esconder funcionalidades se tiles falharem.
- Limite atual de 20 cavernas no `listCaves`; nada de simular cobertura global.
