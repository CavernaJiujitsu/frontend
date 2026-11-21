# Implementação — mapas OpenFreeMap

- Frontend: `src/features/maps/` contém adaptador de unidades ativas/coordenadas válidas, contrato de marcadores por unidade e renderizadores MapLibre web e nativo. Config plugin MapLibre registrado em `app.json`; não funciona no Expo Go.
- Onboarding (escolha da caverna), `/cavernas` e `/perfil/endereco` exibem o mapa sem remover lista, filtros, busca ou confirmação explícita de endereço. O pino conserva `caveId` e `unitId`; a busca do perfil só solicita cavernas após escolher endereço.
- Desktop: `MapPreview` mostra prévia das coordenadas nos formulários `AddressLocator` de criação de caverna e criação/edição de unidade; conserva entrada manual e seleção escrita.
- Backend: nenhum módulo novo. A API continua fornecendo unidades, coordenadas e busca de endereços; OpenFreeMap serve apenas tiles/estilo. A consulta atual continua limitada aos primeiros 20 resultados, sem busca por viewport.
- Fora deste incremento: 3D obrigatório, seleção de endereço por toque livre, novas consultas espaciais, paginação integral da rede.
