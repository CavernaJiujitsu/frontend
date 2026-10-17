# Plano — Integração dos dados essenciais da Home

## Contexto

A tela privada `/(private)/inicio` era composta integralmente por `inicioMock`.
O backend já disponibiliza a agregação canônica da Home em `GET
/api/v1/practitioners/:id/home`, documentada em `backend/docs/student-home.md`.
Esta demanda conecta os dados que esse endpoint já oferece, preservando o card de
progresso de faixa que ainda não faz parte do contrato da rota.

## Objetivo

Exibir na Home o primeiro nome do praticante, a próxima aula e as cavernas
próximas a partir de uma única consulta ao backend, usando a localização que já
está na sessão quando ela estiver disponível.

## Requisitos funcionais

1. Criar a rota de endpoint do praticante e um serviço tipado para a Home.
2. Consultar `GET /api/v1/practitioners/:id/home` apenas quando houver
   `practitionerId` na store.
3. Enviar `latitude` e `longitude` somente em conjunto; encaminhar também
   `radiusKm` e `cavesLimit` quando recebidos pelo serviço.
4. Mostrar loading enquanto a consulta está pendente e feedback com nova tentativa
   quando ela falhar.
5. Renderizar próximo compromisso quando `nextClass` existir; caso contrário,
   explicar que não há aula agendada.
6. Renderizar o resumo de cavernas quando a API retornar dados; quando não houver
   resultado, mostrar estado vazio sem tratar isso como erro.
7. Manter a faixa/progresso com o mock atual até existir contrato de backend para
   esses dados.

## Contrato de API

Fonte da verdade: `backend/src/home/home.controller.ts`,
`backend/src/home/dto/query-home.dto.ts` e
`backend/src/home/dto/home-response.dto.ts`.

| Item | Contrato |
| --- | --- |
| Método e rota | `GET /api/v1/practitioners/:id/home` |
| Path | `id` UUID do praticante |
| Query opcional | `latitude`, `longitude`, `radiusKm`, `cavesLimit` |
| Resposta | envelope padrão cujo `data` contém `practitioner`, `nextClass` e `nearbyCaves` |
| Sem aula | `nextClass: null` (sucesso) |
| Sem localização | `nearbyCaves.data: []` e `locationSource: "none"` (sucesso) |

## Decisões

- Usar React Query, já disponível no aplicativo, com chave que inclui praticante e
  coordenadas para atualizar o resumo quando a localização mudar.
- Usar `unwrap` para respeitar o envelope compartilhado da API.
- Formatar data e hora no cliente com `Intl.DateTimeFormat("pt-BR")`.
- Reportar falhas por `useReportQueryError` e oferecer `refetch` explícito no card.
- Não enviar meia localização: latitude sem longitude, ou o inverso, fica fora da
  query para manter o DTO válido.

## Fora de escopo

- API, confirmação real de presença, trilha/progresso de faixa e alteração do
  contrato do backend.
- Alterar a tela de cavernas ou implementar paginação na Home.
- Substituir os avatares decorativos por imagens de unidades.

## Critérios de aceite

- [x] A Home usa a rota agregadora, sem fazer requisições separadas para aula e
  cavernas.
- [x] A request inclui coordenadas apenas quando ambas existem.
- [x] Há loading, vazio e erro com tentativa novamente para os dados remotos.
- [x] A ausência de próxima aula e de cavernas é um estado válido de sucesso.
- [x] O contrato do frontend espelha os nomes e a estrutura definidos no backend.
- [x] `bunx expo lint` e `bunx tsc --noEmit` finalizam sem erros.
