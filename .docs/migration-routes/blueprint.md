# Blueprint — migração das rotas mobile

## Inventário e reuso

| Peça | Local atual | Uso na migração |
| --- | --- | --- |
| Constantes de endpoint | `src/api/endpoints/routes.ts` | Centralizar todas as novas rotas e remover os aliases de login/trilha/home somente quando sem consumidores. |
| Cliente autenticado | `src/api/bootstrap/axios-bootstrap.ts` | Reutilizar o interceptor; ele já inclui o token da sessão e limpa sessão em `401`. |
| Envelope de resposta | `src/api/types/envelope.ts` | Reutilizar `unwrap` para endpoints que respondem com `{ message, data }`. |
| Sessão | `src/store/useSessionStore.ts` | Estender o tipo `Session`; não criar outro store de autenticação. |
| Estado persistido legado | `src/store/useAppStore.ts` | Manter `practitionerId` e token por compatibilidade com onboarding/edição; sincronizar campos de login numa única ação, evitando atribuições dispersas. |
| Tela de login | `src/app/onboarding/(login)/login.tsx` | Reutilizar formulário e mensagens; adaptar persistência à resposta canônica. |
| Recuperação de senha | `src/api/services/password-recovery.service.ts`, `forgot-password.tsx` | Manter tela e sucesso genérico; adicionar operação de reset no mesmo serviço. |
| Dados privados | `inicio`, `perfil`, `trilha` | Preservar React Query, `LoadingSpinner`, `useReportQueryError` e estados existentes; substituir apenas contratos e condições de habilitação. |
| UI compartilhada | `DefaultButton`, `StudentPage`, `ProfilePhoto` | Reutilizar; não há necessidade de componente novo ou alteração de estilo. |

## Contratos confirmados e adaptações

| Recurso | Endpoint | Contrato do backend | Impacto no cliente |
| --- | --- | --- | --- |
| Login | `POST /mobile/auth/login` | `{ email, password }` → token, `userId`, `roles`, `practitionerId?`, `teacherId?` | Expandir `LoginResponse`/sessão e trocar o path. |
| Perfil | `GET /profile-readonly/me` + leitura existente de foto em `GET /profiles/me` | O read-only retorna `practitionerId`, dados pessoais, `photoKey`, faixa ativa e `trainingRecord`; a rota de perfil existente fornece a URL renderizável da foto | Atualizar `MyProfile` e perfil: exibir registro de treino quando disponível; `ProfilePhoto` consulta e mantém em cache somente a URL de foto, sem inferir URL a partir da chave interna. |
| Home | `GET /profile-readonly/home` | Mesmo formato da home existente, sem `practitionerId` em URL | Remover argumento do serviço; condição de query passa a depender somente de token. |
| Trilha | `GET /profile-readonly/trail` | `belt` e `trail` aninhados, `stages`, totais e `noActiveBelt` | Converter o tipo e ajustar a tela para usar os dados aninhados, sem inventar resposta compatível. |
| Graduações/dashboard | `GET /profile-readonly/graduations`, `/dashboard` | Agregados de leitura | Criar serviço tipado sem tela/consumidor imediato. |
| Check-in | `POST /classes/:id/enrollments/:enrollmentId/check-in` | Ator é professor responsável, JWT obrigatório | Retirar a ação de confirmação da home do aluno; manter cancelamento de inscrição. Criar função de serviço para uso futuro em interface de professor. |
| Participação/aprovação | `PATCH` nas rotas fornecidas | DTOs confirmados no backend | Criar funções e tipos no serviço, sem tela. |
| Horários | `GET/PATCH /training/schedules` | Listagem/detalhe; atualização parcial com `scope` | Novo `schedules.service.ts` com tipos de payload confirmados. |
| Graduações legadas | `/graduations/*` | Aulas de validação, validações e certificados | Novo/estendido serviço de graduações; listagem de certificados deixa de usar `/certificates` depreciado. |
| Workouts | `GET /mobile/workouts` | JWT + `workouts:read`; schema de retorno não tipado em controller | Serviço piloto retornará `unknown` explicitamente até haver DTO/resposta canônica; nenhuma tela será ligada. |

## Alternativas avaliadas

| Alternativa | Decisão | Motivo |
| --- | --- | --- |
| Manter `practitionerId` exigido para a área privada | Rejeitada | As rotas de leitura autenticada não o recebem e login de professor pode não retornar esse campo. |
| Abrir área privada para professor agora | Rejeitada | Não existe fluxo, telas ou navegação de professor aprovados; o escopo é contrato e serviços. |
| Fazer check-in pelo aluno na home | Rejeitada | O controller requer JWT e autorização do professor responsável; manter o botão produziria erro de autorização. |
| Criar um serviço por endpoint | Rejeitada | Agrupar por domínio (`profile-readonly`, `schedules`, `graduations`, `workouts`) evita duplicidade e preserva a organização atual. |
| Forçar os tipos antigos de perfil/trilha | Rejeitada | Os formatos realmente mudaram; adaptação explícita evita dados fictícios, como estatísticas ausentes. |

## Desenho final

### Arquivos alterados

| Arquivo | Alteração |
| --- | --- |
| `src/api/endpoints/routes.ts` | Adicionar paths canônicos de mobile auth, password reset, profile-readonly, schedules, graduações e workouts; manter a leitura existente de perfil exclusivamente para resolver a URL de foto. A constante local `API_PREFIX_SECONDARY` não é usada e será removida. |
| `src/api/services/auth.service.ts` | Usar login mobile e tipar papéis/IDs opcionais. |
| `src/api/services/password-recovery.service.ts` | Adicionar `resetPassword`; preservar request de recuperação sem expor texto de enumeração de conta. |
| `src/api/services/profile.service.ts` | Consumir `profile-readonly/me`, atualizar o tipo de leitura; manter foto como operações de escrita e leitura de URL na rota existente. |
| `src/api/services/home.service.ts` | Remover `practitionerId` da assinatura e usar a rota read-only. |
| `src/api/services/trail.service.ts` | Consumir formato read-only e adaptar os tipos exportados para tela. |
| `src/api/services/classes.service.ts` | Manter inscrição/cancelamento, mover check-in para função de professor e adicionar participação. |
| `src/api/services/belt-validations.service.ts` | Manter declaração legada; adicionar listagem/aprovação conforme os endpoints informados. |
| `src/api/services/certificates.service.ts` | Direcionar listagem à rota de graduações, com `page` e `limit`. |
| `src/api/services/schedules.service.ts` | Novo serviço de horários recorrentes. |
| `src/api/services/graduations.service.ts` | Novo serviço para aulas de graduação, agregados read-only e certificados/validações da área. |
| `src/api/services/workouts.service.ts` | Novo serviço piloto isolado. |
| `src/store/useSessionStore.ts`, `src/store/useAppStore.ts` | Persistir sessão canônica, preservar dados legados necessários e limpar tudo no logout/401. |
| `src/app/onboarding/(login)/login.tsx` e `src/app/onboarding/(create-account)/create-account.tsx` | Centralizar a gravação da identidade retornada pelo login. |
| `src/app/(private)/_layout.tsx` | Proteger por token, não por `practitionerId`; as telas de aluno exibem estado próprio quando o perfil não for de aluno. |
| `src/app/(private)/inicio/index.tsx` | Query sem ID na URL; remover check-in de aluno e manter cancelamento. |
| `src/app/(private)/perfil/index.tsx` | Usar formato read-only e renderizar registro de treino no lugar das estatísticas não retornadas. |
| `src/components/profile-photo.tsx` | Reutilizar o componente e o cache do React Query para ler e atualizar a URL renderizável de foto. |
| `src/app/(private)/trilha/index.tsx`, `[stageId].tsx` | Ler a trilha read-only sem requisito de ID no estado. |

### Estados de UI

- Login: submissão, sucesso (persistência e navegação), erro global existente.
- Home/perfil/trilha: loading e erro existentes são mantidos; as queries exigem token e mostram estado adequado quando não houver dados de aluno.
- Home: inscrição `PENDING` deixa de oferecer confirmação; cancelamento permanece para a inscrição cuja regra já pertence ao aluno.
- Nenhuma tela é criada para horários, participação, aprovação, graduações agregadas ou workouts; portanto não há estados de UI novos.

### Duplicidades evitadas

- Um único tipo de sessão e uma única rotina para aplicar a resposta de login, usada tanto pelo login quanto pelo pós-cadastro.
- Query de localização reaproveita `HomeSummaryParams`; dashboard reutiliza o mesmo tipo.
- Tipos compartilhados de paginação e envelope existentes, sem recriá-los por serviço.

## Riscos e limites

- `profile-readonly/me` não retorna a URL de foto nem as estatísticas que a tela atual mostra; a interface precisará refletir o contrato e não preencher valores fictícios.
- A chave da foto não pode ser convertida em URL pelo app de forma portátil entre storage local, Azure e Neon. A leitura de URL fica isolada em `ProfilePhoto`, via `GET /profiles/me`; os dados de perfil e graduação seguem na rota read-only.
- A proteção por token permitirá que um professor acesse o contêiner privado atual, mas as telas de aluno podem reportar ausência de praticante; não haverá UX de professor até nova demanda.
- `GET /mobile/workouts` não tem DTO de resposta no controller; tipagem será deliberadamente conservadora até o backend expor contrato.
- A mudança de check-in pode retirar uma ação já visível ao aluno. É necessária para obedecer à autorização recém-imposta pelo backend.
