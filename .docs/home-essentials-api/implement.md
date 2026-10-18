# Implementação — Integração dos dados essenciais da Home

## Entregue

- Adicionada `routes.practitionerHome(practitionerId)` para a rota canônica da
  Home.
- Criado `getHomeSummary`, com tipos para query e resposta e desembrulhamento do
  envelope da API.
- A tela `/(private)/inicio` passou a ler o praticante e a localização da store e
  buscar o resumo por React Query.
- Nome, próxima aula e cavernas próximas agora são derivados da resposta da API.
- Foram incluídos estados de carregamento, vazio e falha com botão “Tentar
  novamente”.
- O progresso de faixa continua usando o mock, única parte da tela ainda sem
  contrato no endpoint.

## Cuidados de contrato aplicados

- A rota, os nomes de query e a forma de resposta foram espelhados do controller e
  DTOs do backend.
- `latitude` e `longitude` só são enviadas juntas.
- `radiusKm` e `cavesLimit` só entram na query quando definidos.
- `nextClass: null` e `nearbyCaves.data: []` não são classificados como erro.

## Arquivos envolvidos

| Tipo | Arquivos |
| --- | --- |
| Criado | `src/api/services/home.service.ts` |
| Alterados | `src/api/endpoints/routes.ts`, `src/app/(private)/inicio/index.tsx`, `src/api/mocks/inicio.ts`, `src/types/inicio.ts`, `src/styles/private/inicio.styles.ts` |
| Sem alteração | Backend e contrato de API |

## Desvios e pendências

- Não foi criado endpoint nem alterado DTO no backend; o backend já era a fonte da
  verdade para esta integração.
- A ação “Confirmar” permanece demonstrativa e não foi conectada a uma API de
  presença.
- Não há testes de componente automatizados configurados para a tela; a validação
  está registrada em `test.md`.
