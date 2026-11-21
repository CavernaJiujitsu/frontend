# Plano para aprovação — mapas reais em Endereço e Cavernas

## Contexto

Demanda direta do usuário (sem card): substituir o mapa ilustrativo de `/perfil/endereco` por um mapa real da cidade e mostrar as cavernas no mapa, também na aba `/cavernas`. O usuário confirmou **web, Android e iOS** e escolheu a interação **visualizar e selecionar**, sem escolher endereço tocando livremente no mapa.

Hoje `/perfil/endereco` busca geocodificações por `searchAddresses`, seleciona `{ address, latitude, longitude }`, pode obter a localização do aparelho com `expo-location` e salva pelo `updatePractitioner`. `/cavernas` já busca cavernas, escolhe como origem coordenadas do perfil ou aparelho e exibe unidades ativas com latitude/longitude; a lista usa `listCaves` (`page=1`, `limit=20`) e filtros de busca, abertura e aulas. O mapa atual do endereço é uma ilustração feita com `View`, não um mapa navegável.

## Objetivo

Exibir ruas reais, localização de origem e marcadores das **unidades ativas** das cavernas que aparecem nos resultados, com a mesma seleção e filtros da lista existente. Não substituir nem remover a lista acessível.

## Requisitos funcionais

1. Em **Endereço**, o mapa acompanha o resultado geocodificado escolhido ou a localização atual obtida com consentimento. Mostrar um marcador diferenciado para a origem e marcadores das unidades de cavernas retornadas para aquela origem. A confirmação continua exigindo seleção explícita e envia exatamente o endereço e as coordenadas já usados hoje.
2. Em **Cavernas**, o mapa abre centrado na origem disponível (endereço salvo ou aparelho). Se não houver origem, enquadra os marcadores retornados; se não houver marcadores, mantém busca/lista e mostra orientação sem inventar localização.
3. Cada marcador representa uma **unidade**, com `caveId` e `unitId` estáveis. Ao tocar no marcador, revelar nome/unidade e ação para abrir o fluxo atual de aulas da caverna; tocar em um cartão da lista destaca/centraliza o marcador quando tiver coordenadas.
4. Busca e filtros já existentes controlam **os mesmos resultados visíveis** em lista e mapa; unidades inativas, coordenadas inválidas e resultados fora da busca não geram marcador.
5. Loading, lista vazia, falta de permissão, falha da API e falha dos tiles têm saídas explícitas; mapa não bloqueia navegação, busca, lista nem confirmação de endereço.
6. Não solicitar GPS só para exibir o mapa: usar coordenadas já disponíveis; o botão de localização atual continua pedindo permissão somente quando acionado.

## Requisitos não funcionais e regras

- Manter `ScreenLayout`, `BottomNavbar` na aba Cavernas, identidade visual de `.agents/skills/ui-style/SKILL.md`, acessibilidade dos cartões e alvos de toque. A tela interna de endereço mantém sua navegação de retorno.
- O mapa deve funcionar na **web e nos apps Android/iOS**. Proposta de duas implementações por plataforma atrás de interface comum: web com MapLibre GL JS e tiles de provedor autorizado; nativo com `react-native-maps` compatível com Expo SDK 57 (Google Maps no Android, Apple Maps por padrão no iOS). Os dados, marcadores e callbacks permanecem comuns. A web não deve importar módulos nativos durante SSR/bundle web.
- Preferir `react-native-maps` a `expo-maps` agora: a documentação Expo 57 marca `expo-maps` como alpha e exige development build, enquanto `react-native-maps` está disponível para teste no Expo Go. **Produção Android requer configuração/chave de Google Maps e novo build**; web exige provedor de tiles com termos e orçamento definidos.
- Manter atribuição/licença exigida pelo provedor de tiles, restringir chaves por domínio/app e não tratar chave de mapa exposta no cliente como segredo. Não usar tiles públicos de demonstração/OSM como infraestrutura de produção sem verificar política de uso.
- Não fazer geocodificação reversa por toque no mapa nesta fase; não calcular rotas/tempo de deslocamento nem persistir coordenadas ao simplesmente navegar.

## Contrato de API consumido

- `GET /api/v1/caves`: `page`, `limit` (máximo 100), `search`, `latitude` e `longitude` **sempre em par** (até 8 casas). Retorna cavernas com unidades e coordenadas; o service atual usa apenas os **primeiros 20** resultados. Fonte: `backend/src/modules/caves/cave-management/caves-management.controller.ts`, `dto/query-caves.dto.ts` e `backend/src/modules/shared/pagination/page-params.dto.ts`.
- Endereço: manter `searchAddresses` e `updatePractitioner` atuais; nenhuma mudança de contrato proposta. Conferir DTO/controller do praticante na etapa de implementação se algum service precisar ser modificado.
- O mapa do primeiro incremento deve mostrar **somente os resultados efetivamente carregados**, sem alegar que representa todas as cavernas da rede. Paginação/consulta por viewport exige decisão própria e possivelmente backend; não implantar silenciosamente.

## Decisões de refinamento

| Tema | Decisão/proposta |
| --- | --- |
| Plataformas | Confirmado pelo usuário: web, Android e iOS; validar web primeiro, depois dispositivos. |
| Interação | Confirmado: visualizar e selecionar, sem selecionar endereço tocando em qualquer ponto. |
| Marcadores | Proposta: pino por unidade ativa; unidade pertence à caverna e o toque leva às aulas já existentes. |
| Fonte dos resultados | Proposta: a mesma consulta/filtros da lista, inicialmente os 20 resultados atuais; nenhuma busca automática ao arrastar mapa. |
| Tiles web | **Pendente**: escolher provedor (ex.: MapTiler), plano/cota e credencial restrita ao domínio antes de publicar. MapLibre é o renderizador, não fornece tiles de produção. |
| Chave Android | **Pendente**: credencial Google Cloud Maps SDK for Android restrita por pacote + SHA-1 e orçamento/alertas de cobrança. |

## Fora de escopo

Novos endpoints, listagem integral da rede, busca por área visível do mapa, clusters e rotas de viagem, seleção por toque livre no mapa, alteração do algoritmo de proximidade e redesign do restante das telas.

## Critérios de aceite

1. Busca ou GPS autorizado centraliza o mapa de Endereço e destaca a origem; selecionar outro resultado muda o destaque sem salvar até tocar em Confirmar endereço.
2. A aba Cavernas mostra apenas unidades ativas e válidas dos resultados carregados; seleção do marcador permite abrir a página existente de aulas da caverna correta.
3. Busca e filtros da lista atualizam os pinos sem divergência; sem GPS, a lista e mapa continuam utilizáveis quando houver unidades com coordenadas.
4. Web, Android e iOS renderizam mapa real (não ilustração), e falha de tiles/permissão não impede as ações principais.
5. Coordenadas inválidas não travam o mapa, nenhuma unidade inativa aparece, o menu inferior continua operante e nenhuma navegação ou salvamento ocorre sem ação do usuário.
6. Testes automatizados de transformação dos marcadores, seleção/filtros, fallback e fluxo de confirmação; lint e typecheck passam; validação manual de pelo menos web e builds nativos.

## Estratégia de testes

Teste de lógica de marcadores e coordenação lista↔mapa com doubles; tela com mapa mockado para estados e ações; teste real no navegador com tiles válidos; teste em Android/iOS (Expo Go para protótipo, build configurado para Android produção). Registrar custos e indisponibilidade do provedor de tiles. Sem credenciais/ambiente nativo, registrar a lacuna — não declarar integração validada.

## Riscos e pendências

1. **Chaves, custos e termos de tiles**: definir antes de implementar a publicação web/Android. O uso de mapas nativos e web não elimina custo do provedor nem requisitos de atribuição.
2. **Escala dos resultados**: a API atual retorna a primeira página com 20 cavernas; mapa não cobre automaticamente todas as cavernas. Se o objetivo for mapa nacional/por viewport, precisa outro plano para paginação, limites e talvez consulta espacial.
3. **Compatibilidade Expo web**: separar módulos `.web.tsx` e `.native.tsx` ou equivalente; provar que build/SSR não importa `react-native-maps` na web e que web não carrega MapLibre no nativo.
4. **Coordenadas/privacidade**: mostrar a origem somente com coordenadas já fornecidas; não persistir GPS sem confirmação explícita.

## Referências técnicas

- Expo 57 `react-native-maps`: https://docs.expo.dev/versions/v57.0.0/sdk/map-view/
- Expo 57 `expo-maps` (alpha): https://docs.expo.dev/versions/v57.0.0/sdk/maps/
- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
- `frontend/docs/bottom-menu/prd.md`, `frontend/docs/api-contract/prd.md` e `frontend/docs/backend-error-contract.md`.
