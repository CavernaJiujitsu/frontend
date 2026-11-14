# Implementação — migração das rotas mobile

## O que foi feito

### Contratos e serviços

- `src/api/endpoints/routes.ts` passou a expor as rotas canônicas de login mobile, password reset, `profile-readonly`, horários recorrentes, graduações e workouts. Foram removidos os aliases migrados e a constante `API_PREFIX_SECONDARY`, que não era usada.
- `auth.service.ts` usa `POST /api/v1/mobile/auth/login` e preserva `roles`, `userId`, `practitionerId?` e `teacherId?` no tipo de resposta. Os papéis foram tipados como `STUDENT | TEACHER | ADMIN | CAVE_ADMIN`.
- `password-recovery.service.ts` ganhou `resetPassword({ token, password })`; a solicitação não devolve nem usa mensagem do backend.
- Perfil, home e trilha agora consomem `profile-readonly/me`, `/home` e `/trail`; home não recebe mais `practitionerId` na URL.
- Foram criados serviços para horários recorrentes (`schedules.service.ts`), graduações agregadas (`graduations.service.ts`) e workouts piloto (`workouts.service.ts`). Participação e aprovação de faixa foram adicionadas aos domínios já existentes.
- A listagem de certificados passou para `/graduations/certificates`; upload permanece na rota de escrita existente, que não recebeu sucessora na demanda.
- O resultado de `PATCH /training/schedules/:id` foi tipado com o contrato real do backend: `{ scope, updated, schedules }`.
- O resultado de `PATCH .../participation` foi tipado com os campos realmente retornados: `enrollmentId`, `durationMinutes`, `hoursAccuracy`, `participationStartedAt` e `participationEndedAt` (sem `status`).
- `listGraduationBeltValidations` envia somente `practitionerId`: o DTO do backend ainda não converte `page`/`limit` de string para número, então a paginação explícita causaria erro de validação. A resposta é desembrulhada de `{ data: [...] }`.
- A trilha read-only foi tipada com `belt` e `trail` anuláveis, pois o backend pode devolver `noActiveBelt: false` com `belt: null` (e, em alguns casos, `trail: null`).

### Sessão e telas existentes

- `useSessionStore` e o estado persistido do app passaram a carregar identidade completa do login; `setAuthIdentity` atualiza token, `practitionerId`, `teacherId`, `userId` e `roles` numa só operação.
- Login e pós-cadastro usam a mesma resposta para preencher sessão e estado persistido.
- O `persist` de `useAppStore` ganhou `merge` explícito para mesclar o objeto `user` persistido com o estado atual. Sessões antigas que não tinham `roles`, `userId` ou `teacherId` continuam hidratando sem campos `undefined`.
- O layout privado agora exige token, não `practitionerId`, permitindo uma sessão válida de professor sem quebrar a navegação raiz.
- Home, perfil e trilha fazem queries autenticadas sem formar paths com `practitionerId`; as query keys deixaram de incluir o identificador.
- A home do aluno não oferece mais confirmação de check-in. A ação é exclusiva do professor no backend; cancelamento de inscrição foi preservado.
- Perfil passou a representar o registro de treino retornado pelo endpoint read-only, em vez de estatísticas que não fazem parte desse contrato. O tipo da aula é traduzido localmente (`SCHEDULED` → “Treino”, `VALIDATION` → “Avaliação”, `EXAM` → “Exame”).
- A tela de trilha tolera `belt` e `trail` nulos, usando fallback de cor, título e subtítulo sem quebrar a renderização.
- O logout do perfil agora também limpa `useSessionStore`, evitando resíduo de sessão no store em memória.

### Foto de perfil

- `GET /profile-readonly/me` não devolve `photoUrl` e `photoKey` é uma chave interna, sem conversão portável pelo app. `ProfilePhoto` consulta o `GET /profiles/me` existente exclusivamente para obter a URL renderizável, enquanto os dados do perfil continuam na rota read-only.
- A resposta de `PUT /profiles/me/photo` foi tipada como `{ photoUrl }` e é tratada como autoritativa. O cache da foto (`["profile-photo"]`) recebe a URL retornada tanto no upload quanto na remoção; um refetch do perfil read-only não apaga mais a imagem.
- As operações de upload/remoção continuam nas rotas de escrita `/profiles/me/photo`, sem rota read-only substituta.

## Decisões e desvios

- `GET /mobile/workouts` é retornado como `unknown`: o controller exige a permissão `workouts:read`, mas não publica DTO de resposta. Não foi criada tela para esse piloto.
- A leitura de URL de foto usa o endpoint já existente `/profiles/me`, pois ele delega a resolução ao storage configurado no backend. Não foi inferida uma URL a partir de `photoKey` no cliente.
- A tela de trilha usa uma mensagem local de avaliação pendente, pois a nova resposta read-only sinaliza `noActiveBelt` sem fornecer texto de mensagem.
- Não foi criada interface de professor, conforme escopo aprovado. Os serviços novos são a base tipada para uma futura demanda.
- `setPractitionerId` foi mantido no store para onboarding e edição de perfil, mas nenhum consumidor read-only o usa para montar URL.

## Validação da implementação

### Checks estáticos

- `bunx tsc --noEmit` — concluído sem erros.
- `bun run lint` — concluído sem erros ou avisos.

### Integração real

Foi executada uma stack isolada (`docker compose -p caverna-routes-test -f docker-compose.test.yaml --profile app up -d api`) com API em `http://localhost:3001`, banco próprio na porta `5544` e fixtures de aluno/professor. Os fluxos abaixo responderam com os formatos usados pelos tipos do cliente:

- Login mobile de aluno e de professor; o aluno retornou `roles: ["STUDENT"]` + `practitionerId`, e o professor retornou `roles: ["TEACHER"]` + `teacherId` sem `practitionerId`.
- `profile-readonly/me`, `/home`, `/trail`, `/graduations` e `/dashboard` com JWT.
- `training/schedules`: listagem, detalhe e PATCH com `{ scope: "single", updated: 1, schedules: [...] }`.
- `classes`: listagem, inscrição, check-in e participação com os campos tipados.
- `belt-validations`: declaração, listagem por praticante e aprovação (`APPROVED`).
- `graduations/classes/graduation`, `graduations/belt-validations` e `graduations/certificates`.
- `mobile/workouts`: HTTP 403 sem `workouts:read`, comportamento esperado.
- Password recovery: solicitação genérica, reset com token válido, login com a nova senha e reset com token inválido/reutilizado.

A matriz completa, comandos e resultados estão em `.docs/migration-routes/test.md`.

## Pendências

- Definir a experiência e rotas próprias do professor antes de expor na interface os serviços de presença, participação, horários e aprovação.
- O backend ainda devolve `belt: null` com `noActiveBelt: false` na trilha; o cliente tolera, mas o contrato precisa ser corrigido na origem.
- `home.nearbyCaves._meta.limit` e `radiusKm` chegam como string apesar do tipo numérico. A home atual só interpola esses valores; não há cálculo afetado.
- O endpoint de workouts permanece sem DTO de resposta pública; a tipagem continuará conservadora até o backend publicar o contrato.
- A correção posterior ao review adicionou uma segunda leitura autenticada, limitada à `photoUrl`, ao abrir o componente de foto. É o único endpoint fora de `profile-readonly` mantido para a apresentação de foto; os demais dados de perfil não voltaram à rota legada.
