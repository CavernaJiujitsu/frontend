# Plano — integração da trilha com o backend

## Contexto

A área privada de Trilha (`/trilha` e `/trilha/[stageId]`) ainda usa fixtures em
`src/api/mocks/student-preview.ts` e controles de demonstração. O backend já
oferece os dados reais do aluno autenticado em `GET /api/v1/practitioners/me/trail`
e o resumo de faixa e progresso em `GET /api/v1/profiles/me`.

Esta é uma demanda direta do PO, sem card Trello. O slug técnico dos artefatos é
`student-trail-backend`.

## Objetivo

Substituir os dados fictícios de trilha, faixa e estatísticas por dados do aluno
autenticado, preservando o fluxo visual existente e tratando explicitamente o
estado em que o aluno ainda não possui faixa ativa.

## Requisitos funcionais

1. Criar um serviço tipado para `GET /api/v1/practitioners/me/trail`, usando o
   `apiClient` e o token de autenticação já configurado.
2. Criar um serviço tipado para `GET /api/v1/profiles/me` ou reutilizar uma
   implementação equivalente caso ela já exista.
3. A tela `/trilha` deve exibir o nome/cor da faixa, a trilha, o percentual e
   as etapas retornadas pelo backend, respeitando `position`, `status` e
   `isCurrent`.
4. O progresso deve usar `percent`, `requiredCompleted` e `requiredTotal` do
   backend. O frontend não deve recalcular regras de graduação.
5. A tela `/trilha/[stageId]` deve localizar a etapa pelos IDs reais retornados
   pelo backend e exibir seus movimentos ordenados, nome, obrigatoriedade,
   status, percentual e data de validação quando disponível.
6. O detalhe deve considerar `status` exatamente como fornecido pelo backend:
   `PENDING`, `IN_PROGRESS`, `COMPLETED` e `VALIDATED`.
7. Quando `noActiveBelt: true`, `/trilha` deve exibir uma tela de avaliação
   pendente baseada na referência enviada pelo PO, sem renderizar etapas ou
   progresso fictícios.
8. Descrições nulas de trilha, etapa ou movimento devem ser ocultadas.
9. Remover os controles de cenário, banners de demonstração e dependência dos
   fixtures na experiência integrada.
10. O resumo de faixa e estatísticas de `/inicio` e `/perfil` deve passar a usar
    `activeBelt` e `trailStats` de `/profiles/me`, mantendo os demais dados que
    não fazem parte desse contrato somente onde ainda não houver endpoint
    correspondente.
11. Estados de carregamento, erro com retry e ausência de dados devem ser reais,
    usando o padrão de query e tratamento de erro já adotado no app.

## Requisitos não funcionais

- Compatibilidade com iOS, Android e Web.
- Usar Expo Router e `router.replace` nas trocas de aba existentes.
- Manter componentes, tokens, `ScreenLayout` e `BottomNavbar` existentes.
- Não adicionar dependências.
- Não persistir progresso nem criar escrita no backend.
- Não criar aliases de contrato nem fazer fallback silencioso para mock.
- Textos visíveis em PT-BR e comentários de código em inglês.
- Segregar as queries pela identidade autenticada quando necessário e limpar
  dados ao trocar de conta.

## Regras de negócio e contrato de API

O contrato é definido pelo backend:

- `GET /api/v1/practitioners/me/trail` exige JWT e retorna a trilha do usuário
  autenticado. O retorno ativo contém `practitionerId`, `beltId`, `beltName`,
  `beltColor`, `beltLevel`, `trailId`, `trailName`, `trailDescription`,
  `stages`, `percent`, `requiredCompleted`, `requiredTotal`, `currentStageId`
  e `noActiveBelt: false`.
- Cada etapa contém `id`, `trailStageId`, `name`, `description`, `position`,
  `status`, `percent`, `requiredCompleted`, `requiredTotal`, `isCurrent` e
  `movements`.
- Cada movimento contém `id`, `trailStageMovementId`, `movementId`,
  `movementName`, `videoUrl`, `required`, `position`, `status`, `validatedAt`
  e `evidenceId`.
- Sem faixa ativa, o endpoint retorna `noActiveBelt: true`, `practitionerId` e
  `message`; esse estado não é erro de transporte.
- `GET /api/v1/profiles/me` retorna `activeBelt` e `trailStats` quando houver
  faixa ativa; ambos são `null` quando não houver.
- Erros devem seguir `docs/backend-error-contract.md`, usando o normalizador e
  o reporte de erro já existentes.

## Decisões de refinamento

| Ponto | Decisão |
|---|---|
| Origem da demanda | Demanda direta do PO, sem ticket Trello |
| Slug | `student-trail-backend`, usado somente para `.docs/` e eventual branch |
| Estado sem faixa | Tela explícita de avaliação pendente |
| Evidências | Exibir apenas dados disponíveis: status, `validatedAt` e, se necessário, presença de `evidenceId`; não inventar professor, aula ou caverna |
| Descrições nulas | Ocultar o campo |
| Dados de faixa em Início/Perfil | Consumir `activeBelt`/`trailStats` de `/profiles/me` |
| Reserva da primeira aula | Não fabricar dados de reserva a partir da tela de referência; só integrar uma ação se houver endpoint/dado já existente e compatível |
| Regras de progresso | Permanecem no backend; o frontend apenas apresenta os valores recebidos |

## Fora de escopo

- Criar ou alterar endpoints, DTOs, migrations ou regras no backend.
- Implementar validação de movimento, presença, evidência ou promoção de faixa.
- Exibir autor da validação, aula, unidade ou histórico, pois esses campos não
  estão disponíveis no contrato informado.
- Criar uma reserva ou alterar o fluxo de aulas.
- Abrir PR, fazer review ou publicar a aplicação.

## Critérios de aceite

1. Com resposta ativa do endpoint, `/trilha` faz uma requisição autenticada e
   exibe a faixa, a trilha, as etapas e o progresso retornados pelo backend.
2. A ordem visual das etapas e movimentos corresponde a `position`.
3. A etapa com `isCurrent: true` é destacada e abre `/trilha/[stageId]` com o
   ID real retornado pelo backend.
4. O detalhe mostra os movimentos reais e seus status sem usar nomes ou IDs do
   fixture local.
5. `description: null` não gera texto vazio, placeholder ou descrição inventada.
6. Para `noActiveBelt: true`, a tela de avaliação pendente aparece sem faixas,
   etapas ou percentuais mockados.
7. `/inicio` e `/perfil` refletem `activeBelt` e `trailStats` do perfil quando
   esses dados existirem e mostram estado indisponível quando forem nulos.
8. Loading, erro/retry, resposta vazia e troca de conta não exibem dados da
   conta anterior nem retornam silenciosamente aos fixtures.
9. Requests e enums respeitam exatamente os controllers e DTOs do backend.
10. Lint e typecheck passam após a implementação.

## Estratégia de teste

- Verificar tipos e mapeamentos com `bunx tsc --noEmit`.
- Executar `bunx expo lint`.
- Exercitar no Web/dev a trilha ativa, etapa atual, detalhe, erro com retry e
  ausência de faixa.
- Confirmar no proxy/log ou com `curl` que a aplicação usa
  `GET /api/v1/practitioners/me/trail` e `GET /api/v1/profiles/me` com
  autenticação e sem parâmetros inventados.
- Exercitar retorno à tela e troca de conta para confirmar invalidação/segregação
  das queries.

## Riscos e pendências

- A referência visual de avaliação pendente contém informações de reserva que
  não aparecem nos dois contratos fornecidos; elas não podem ser preenchidas
  com dados fictícios nesta integração.
- `evidenceId` ainda pode ser nulo mesmo em movimentos validados; a UI deve
  tratar a data/status como fonte disponível sem afirmar detalhes da evidência.
- As alterações locais já existentes no repositório precisam ser preservadas e
  separadas da implementação desta demanda.
