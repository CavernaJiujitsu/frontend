# Telas do aluno (imagens 13–17) + professor no mobile

Status: demandado pelo usuário, aguardando aprovação. Sem card Trello — demanda direta do PO.

## Contexto e objetivo

O frontend mobile (Expo SDK 57 + Expo Router + React Native) já tem login aluno/professor, área privada com Início/Trilha/Cavernas/Perfil, e serviços de API para home, aulas, validações de faixa, cavernas e trilha. Faltam as telas dedicadas das imagens 13–17 (aluno) e as telas do professor (criar aula, chamada, validar faixa). O login de professor já funciona no mobile via `POST /api/v1/mobile/auth/login` (aceita TEACHER + STUDENT) e o store já guarda `teacherId` e `roles[]`.

## Requisitos funcionais

### Aluno — telas das imagens

1. **Tela 13 — Avaliação pendente** (`/private/avaliacao-pendente`): mostra "Sua jornada começou", faixa pendente, primeira aula (professor, horário, caverna), botões "Ver minha reserva" (check-in na inscrição) e "Buscar outra aula" (lista de cavernas/aulas).
2. **Tela 14 — Reservar encontro** (`/private/reservar-encontro/[classId]`): mostra "Reserve seu encontro", validação inicial, data/hora/professor da aula, vagas disponíveis, botão "Reservar aula" (POST enroll).
3. **Tela 15 — Aula lotada** (`/private/aula-lotada/[classId]`): mostra "Esta aula está lotada", 12/12 vagas, sem vagas, botão "Ver outras aulas" (lista de cavernas/aulas alternativas).
4. **Tela 16 — Faixa aprovada** (`/private/faixa-aprovada/[validationId]`): mostra "Faixa confirmada!", faixa aprovada, triagem concluída, botões "Ver minha faixa" (trilha) e "Encontrar aulas" (cavernas).
5. **Tela 17 — Movimento validado** (`/private/movimento-validado/[movementId]`): mostra "Queda de base", movimento validado, trilha branca + fundamentos, botão "Voltar à trilha".

### Professor — novas telas

6. **Dashboard do professor** (`/teacher/dashboard`): minhas aulas próximas, chamadas abertas, validações de faixa pendentes.
7. **Criar aula** (`/teacher/aulas/criar`): formulário com unidade (`caveUnitId`), professor (`teacherId`), tipo, início/término, capacidade, faixas elegíveis (`beltIds`).
8. **Minhas aulas** (`/teacher/aulas`): lista de aulas do professor (`GET /classes?teacherId=`).
9. **Abrir chamada** (`/teacher/aulas/[classId]/chamada`): lista inscritos da aula (`GET /classes/:id/enrollments`), check-in por aluno (`POST /classes/:id/enrollments/:enrollmentId/check-in`).
10. **Validar faixa** (`/teacher/belt-validations/[id]/aprovar`): aprova validação (`PATCH /belt-validations/:id/approve`) após presença confirmada.

### Login professor (já funciona, confirmar)

11. `POST /api/v1/mobile/auth/login` aceita `TEACHER` e `STUDENT`; resposta traz `teacherId` e `roles[]`. O frontend já consome essa rota em `auth.service.ts`.

## Requisitos não funcionais

- Usar `ScreenLayout` com `BottomNavbar` (aluno) e navegador próprio para professor.
- Comentários de código em inglês; strings de UI e mensagens de erro em PT-BR.
- Nenhuma dependência nova; reusar `DefaultButton`, `LoadingSpinner`, `StudentPage`, `ScreenLayout`, `BrandColors`.
- Contrato de API: espelhar nomes exatos do backend (`caveUnitId`, `teacherId`, `classId`, `enrollmentId`, `beltIds`, `practitionerId`, `approvedBeltId`, `notes`).
- `bunx tsc --noEmit` limpo e `bunx expo lint` limpo.

## Regras de negócio (citando docs/)

- `backend/docs/business-rules.md` — check-in só em inscrições `PENDING` dentro do prazo; aula `EXAM` exige faixa elegível e trilha completa; capacidade protege overbooking.
- `backend/docs/schema.dbml` — `class_enrollment.status` = `PENDING` → `CONFIRMED` → `EXPIRED`/`CANCELLED`; `belt_validation.status` = `PENDING` → `SCHEDULED` → `APPROVED`/`REJECTED`/`CANCELLED`.
- `frontend/docs/api-contract/prd.md` — backend é fonte de verdade; nunca usar alias (`academyUnitId` → `caveUnitId`).
- `frontend/docs/bottom-menu/prd.md` — trocas de aba com `router.replace`, nunca `push`.

## Decisões propostas

| Tema | Proposta |
|---|---|
| Navegação professor | Stack separado em `src/app/(teacher)/` com layout próprio (sem BottomNavbar de aluno); login redireciona por role: se só `TEACHER` → `/teacher/dashboard`; se `STUDENT` → `/inicio`; se ambos → `/inicio` com opção de alternar. |
| Serviços faltantes | Adicionar `createClass` e `listEnrollments` em `classes.service.ts`; `checkInClass` e `approveBeltValidation` já existem. |
| Telas aluno | Rotas diretas em `(private)/` (não entram no BottomNavbar; acessadas por fluxo/link). |
| Dados da aula lotada | Reusar `listClasses` com filtro por `caveUnitId`/`type` para "ver outras aulas". |

## Fora de escopo

- Mudanças no backend.
- Perfil do professor (foto, dados pessoais) além do dashboard.
- Paginação completa além do contrato atual dos serviços.
- Publicação, EAS build, merge em `main`.

## Critérios de aceite

1. `bunx tsc --noEmit` limpo no frontend.
2. `bunx expo lint` limpo no frontend.
3. Telas 13–17 navegáveis entre si e a partir do fluxo existente (ex.: início → trilha → avaliação pendente).
4. Professor consegue criar aula, listar suas aulas, abrir chamada com inscritos, fazer check-in e aprovar faixa.
5. Login professor via `/api/v1/mobile/auth/login` redireciona corretamente (confirmado por contrato já existente).
6. Nenhum nome de query/body inventado: todos espelhados do backend.

## Estratégia de teste e pendências

- Validar endpoints reais quando a API estiver disponível (não há emulador; exercitar no navegador/web).
- `useAppStore` já guarda `teacherId` e `roles[]` — usar para decidir redirecionamento pós-login.
- Serviços `createClass` e `listEnrollments` precisam ser criados antes das telas do professor.

Plano aguardando aprovação. Após aprovação, prossigo com a skill `feature-implementation`.
