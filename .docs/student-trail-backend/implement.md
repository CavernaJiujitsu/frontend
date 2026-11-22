# Implementação — integração da trilha com o backend

## Status

Implementação concluída nesta etapa. A validação funcional completa depende da
execução da aplicação com backend e usuário autenticado, registrada pela skill
`feature-teste`.

## Alterações realizadas

- Adicionadas as rotas `practitionerTrail` e `profileMe` em
  `src/api/endpoints/routes.ts`.
- Criado `src/api/services/trail.service.ts` com os tipos do DTO real,
  incluindo a união entre trilha ativa e `noActiveBelt`.
- Criado `src/api/services/profile.service.ts` para o contrato de
  `/profiles/me`.
- `/trilha` agora usa `GET /api/v1/practitioners/me/trail`, exibe progresso e
  etapas reais, respeita `position`/`isCurrent` e trata loading, erro/retry e
  avaliação pendente.
- `/trilha/[stageId]` agora usa a mesma query autenticada, localiza a etapa por
  ID real e exibe movimentos, obrigatoriedade, status e `validatedAt`.
- `/inicio` passou a obter faixa e estatísticas de `/profiles/me`; o resumo de
  aulas e cavernas continua vindo do service de home existente.
- `/perfil` passou a consumir nome, e-mail, faixa e estatísticas reais de
  `/profiles/me`.
- Adicionados estilos para o estado de avaliação pendente, mantendo os tokens e
  componentes visuais existentes.
- Corrigida a autenticação necessária para as chamadas privadas: login real em
  `auth.service.ts`, `accessToken` persistido na store, interceptor Bearer no
  `apiClient` e autenticação automática após criação de conta.
- Removidos os dados de `student-preview` do fluxo publicado; os arquivos de
  preview foram preservados até a etapa de teste confirmar que não há outros
  consumidores necessários.

## Desvios e decisões

- A referência de avaliação pendente contém dados de reserva que não existem nos
  endpoints fornecidos. A implementação mostra a jornada e o estado de
  avaliação sem fabricar reserva, professor ou unidade.
- Evidências detalhadas continuam limitadas a `status` e `validatedAt`, conforme
  o contrato atual.
- As alterações locais preexistentes no worktree foram preservadas.

## Validação executada

- `bun run lint`: passou; após a correção de um import não utilizado, terminou
  sem erros ou warnings.
- `bunx tsc --noEmit`: passou.
- `git diff --check`: passou.
- `bun run lint && bunx tsc --noEmit` após a correção de autenticação: passou.

## Próxima etapa

Executar a skill `feature-teste` para validar o fluxo real com backend, incluindo
as duas rotas autenticadas, estado ativo, estado sem faixa e retry.
