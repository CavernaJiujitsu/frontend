# Plano — migração das rotas mobile

## Contexto

Demanda direta do PO na branch `feat/migration-routes`: alinhar o cliente Expo às rotas mobile e de leitura mais recentes fornecidas, substituindo os endpoints depreciados ou de outro contexto. O backend local (`../backend`) foi consultado como fonte de verdade para controllers e DTOs.

O cliente atual ainda usa `POST /api/v1/auth/login`, `GET /api/v1/profiles/me`, `GET /api/v1/practitioners/:practitionerId/home` e `GET /api/v1/practitioners/me/trail`. Os quatro primeiros fluxos privados dependem de `practitionerId` no estado local, embora as novas rotas de perfil usem o usuário autenticado e não recebam esse identificador na URL.

## Objetivo

Migrar os serviços e consumidores mobile existentes para as rotas canônicas, persistir no estado de sessão os dados de identidade retornados no login e criar contratos tipados para os endpoints novos que já têm finalidade definida. Não será criada uma interface de professor nesta demanda.

## Requisitos funcionais

1. O login deve usar `POST /api/v1/mobile/auth/login`, enviar apenas `{ email, password }` e preservar `accessToken`, `tokenType`, `expiresIn`, `userId`, `roles`, `practitionerId?` e `teacherId?` no estado de sessão.
2. A recuperação deve manter `POST /api/v1/auth/password-recovery/request` e expor `POST /api/v1/auth/password-recovery/reset` com `{ token, password }`. A tela de solicitação continuará exibindo sucesso genérico, sem usar a mensagem do backend como sinal de existência do e-mail.
3. Perfil, home, graduações, trilha e dashboard devem usar, respectivamente, `GET /api/v1/profile-readonly/me`, `/home`, `/graduations`, `/trail` e `/dashboard`. Home e dashboard devem aceitar somente `latitude`, `longitude`, `radiusKm` e `cavesLimit` como query opcional.
4. Os consumidores atuais de perfil, home e trilha devem deixar de montar rotas com `practitionerId`; o identificador continua no estado apenas para fluxos que ainda exigem esse campo no corpo ou em rota canônica.
5. Devem existir funções de serviço tipadas, ainda sem tela, para horários recorrentes (`GET/PATCH /training/schedules`), presença do professor (`POST check-in`, `PATCH participation`), aprovação de faixa (`PATCH approve`), aulas de graduação, validações, certificados e workouts piloto.
6. As mutações de professor devem enviar o JWT já injetado pelo cliente e manter os corpos exatos do backend: `scope: 'single' | 'all'` em horário, intervalos ISO e `pauses` em participação, e `approvedBeltId?`/`notes?` na aprovação.

## Requisitos não funcionais

- TypeScript estrito, sem `any` e sem adicionar dependência.
- Reaproveitar `apiClient`, `unwrap`, normalização global de erro e React Query existentes.
- Não criar telas, rotas Expo Router ou comportamento nativo nesta demanda.
- Dados de sessão persistidos devem ser compatíveis com sessões anteriores que não possuam `roles` ou `teacherId`.

## Regras de negócio e contrato de API

| Operação | Contrato confirmado no backend |
| --- | --- |
| Login mobile | `POST mobile/auth/login`; perfis permitidos `STUDENT` e `TEACHER`; resposta inclui `userId`, `roles`, `practitionerId?`, `teacherId?` e token. |
| Reset de senha | `POST auth/password-recovery/reset`; senha tem mínimo de 8 caracteres. |
| Leitura de perfil | `profile-readonly/*` exige JWT e deriva o perfil do usuário autenticado. |
| Home/dashboard | `cavesLimit` 1–50; `radiusKm` 1–200; latitude/longitude numéricas. |
| Horários | `PATCH training/schedules/:id` aceita os campos parciais de `UpdateClassScheduleDto`; `scope` é `single` ou `all`. |
| Participação | Exige check-in confirmado; `startedAt`, `endedAt` e pausas são ISO 8601; correção usa `reason`. |
| Aprovação | Exige validação agendada e presença confirmada; o professor autenticado é autorizado pelo backend. |
| Certificados | Rota de graduação suporta `page` e `limit`; a rota antiga `/certificates` está marcada como depreciada. |
| Workouts | `GET mobile/workouts` exige JWT e permissão `workouts:read`; será exposto como serviço piloto, sem tela definitiva. |

Referências: `docs/api-contract/prd.md`, `docs/backend-error-contract.md`, `../backend/src/modules/iam/auth/auth.controller.ts`, `../backend/src/modules/profile-readonly/profile-readonly.controller.ts`, `../backend/src/modules/training/*` e `../backend/src/modules/graduations/*`.

## Decisões de refinamento

| Tema | Decisão |
| --- | --- |
| Escopo de interface | Migrar somente os consumidores já existentes; disponibilizar os demais endpoints por serviço tipado, sem criar UI de professor. |
| Sessão | Estender `useSessionStore` para a resposta de login; manter campos novos opcionais para reidratação de sessões antigas. |
| Estado da aplicação | `useAppStore.practitionerId` continua temporariamente para onboarding e recursos que ainda exigem esse ID, mas não é usado para formar chamadas `profile-readonly`. |
| Perfil editável/foto | Permanecem em `/profiles/me` pois não há rota substituta fornecida e são operações de escrita; não serão migrados para `profile-readonly`. |
| Contratos de resposta | Antes de alterar os tipos usados pelas telas, conferir a forma retornada pelos serviços do backend ou por testes/Swagger; a lista de rotas não especifica todos os schemas de resposta. |

## Fora de escopo

- Criar telas e navegação de professor.
- Consumir definitivamente o piloto de workouts em tela.
- Migrar endpoints de cadastro, edição de perfil, upload de foto/certificado, inscrições e cancelamento que não possuem substituto listado.
- Alterar backend ou adicionar aliases de compatibilidade.

## Critérios de aceite

1. Nenhum serviço de login utiliza `/api/v1/auth/login`; ele usa exatamente `/api/v1/mobile/auth/login`.
2. Login preserva token, papéis, `practitionerId` e `teacherId` quando retornados, sem bloquear login de professor sem `practitionerId`.
3. Home, perfil e trilha existentes usam as rotas `profile-readonly` e não incluem `practitionerId` na URL.
4. A solicitação de recuperação sempre apresenta confirmação genérica após resposta 200, e existe serviço para reset com `{ token, password }`.
5. Os métodos novos têm paths, métodos HTTP, parâmetros e corpos correspondentes aos DTOs/controllers consultados.
6. Não há uso da rota de certificados depreciada para listagem de graduação.
7. `bunx tsc --noEmit` e `bunx expo lint` finalizam sem erro.
8. O artefato `.docs/migration-routes/test.md` registra os checks, requests de contrato e resultados antes da entrega.

## Estratégia de teste

- Testes de tipo e lint do projeto.
- Testes unitários de serviços ou mocks de `apiClient` para verificar método, path, body e query de cada rota migrada.
- Exercício manual do login aluno e professor para validar persistência de identidade e redirecionamento sem `practitionerId` obrigatório.
- Exercício de perfil, home e trilha autenticados; testar erro 401/403 pelo normalizador existente.
- Validar request de recuperação e reset com token válido/inválido em ambiente adequado, sem registrar token em logs ou artefatos.

## Riscos e pendências

- Os schemas completos de resposta dos agregados `profile-readonly`, schedules e workouts não foram especificados na lista de rotas; os tipos precisam ser confirmados no backend antes da implementação de cada serviço.
- O controller de `profile-readonly` declara os query params de home/dashboard inline em vez de usar `QueryHomeReadonlyDto`; a implementação seguirá o DTO existente e o contrato fornecido.
- O app privado hoje exige `practitionerId` para acesso. Para professor-only, será necessário decidir a experiência e a navegação antes de liberar uma área privada de professor; esta demanda não cria essa área.
