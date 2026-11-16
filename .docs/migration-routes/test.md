# Testes — migração das rotas mobile

## Ambiente

- Frontend Expo SDK 57 (`expo ~57.0.30`), React Native 0.86.3, Bun.
- Não há runner de testes automatizados configurado no frontend.
- Backend isolado executado a partir de `../backend` com `docker-compose.test.yaml`, para não depender do banco de desenvolvimento compartilhado:

```bash
cd ../backend
DB_PORT=5544 PORT=3001 docker compose -p caverna-routes-test \
  -f docker-compose.test.yaml --profile app up -d api
```

- API testada em `http://localhost:3001/api/v1`; banco em `localhost:5544`.
- Contas usadas:
  - Aluno descartável `routes.test.1794612885@caverna.test`, criado pelo fluxo de cadastro durante o teste.
  - Professor `mestre.semente@caverna.com` (`seed-dev`), com `roles: ["TEACHER"]` e `teacherId`.

## Checks do projeto

| Comando | Resultado |
| --- | --- |
| `bunx tsc --noEmit` | Passou, sem erros. |
| `bun run lint` (`expo lint`) | Passou, sem erros ou avisos. |
| `git diff --check` | Passou, sem problemas de whitespace. |
| `bunx expo-doctor` | Não executado nesta rodada: nenhuma dependência ou configuração nativa foi alterada. |

## Matriz de contrato

Todos os requests abaixo usaram JWT quando a rota é autenticada. Tokens não foram registrados neste documento.

| # | Operação | Request | Resultado observado |
| --- | --- | --- | --- |
| 1 | Login mobile de aluno | `POST /mobile/auth/login` `{ email, password }` | HTTP 200; `data` com `accessToken`, `tokenType`, `expiresIn`, `userId`, `roles: ["STUDENT"]` e `practitionerId`. |
| 2 | Login mobile de professor | `POST /mobile/auth/login` `{ email, password }` | HTTP 200; `roles: ["TEACHER"]` e `teacherId`, sem `practitionerId`. |
| 3 | Login com senha inválida | `POST /mobile/auth/login` | HTTP 401; erro normalizado pelo interceptor existente. |
| 4 | Solicitação de recuperação | `POST /auth/password-recovery/request` `{ email }` | HTTP 200; mensagem genérica do backend. A tela ignora o texto e exibe confirmação própria. |
| 5 | Reset com token válido | `POST /auth/password-recovery/reset` `{ token, password }` | HTTP 200; “Senha redefinida com sucesso”. Login seguinte com a nova senha retornou HTTP 200. |
| 6 | Reset com token inválido/reutilizado | `POST /auth/password-recovery/reset` | HTTP 401; “Link de recuperação inválido ou expirado”. |
| 7 | Perfil read-only | `GET /profile-readonly/me` | HTTP 200; `practitionerId`, `userId`, `name`, `email`, `photoKey`, `activeBelt`, `trainingRecord`; sem `statistics`/`photoUrl`. |
| 8 | Home read-only | `GET /profile-readonly/home?latitude=…&longitude=…&radiusKm=50&cavesLimit=2` | HTTP 200; `practitioner`, `nextClass`, `nearbyCaves.data`/`_meta`. URL sem `practitionerId`. |
| 9 | Trilha read-only | `GET /profile-readonly/trail` | HTTP 200; resposta com `belt: null`, `trail` preenchido e `noActiveBelt: false`. O cliente tolera os dois nulos. |
| 10 | Graduações agregadas | `GET /profile-readonly/graduations` | HTTP 200; `belts`, `beltValidations` e `certificates`. |
| 11 | Dashboard agregado | `GET /profile-readonly/dashboard?latitude=…&longitude=…&radiusKm=50&cavesLimit=2` | HTTP 200; composição com `profile`, `home`, `graduations` e `trail`. |
| 12 | Listagem de horários | `GET /training/schedules` | HTTP 200; lista de horários com `caveUnit`/`teacher`. |
| 13 | Detalhe de horário | `GET /training/schedules/:id` | HTTP 200; horário com `caveUnit`/`teacher`. |
| 14 | Atualização de horário | `PATCH /training/schedules/:id` `{ scope: "single", capacity: 26 }` | HTTP 200; `{ scope: "single", updated: 1, schedules: [...] }`. Contrato conferido com o backend. |
| 15 | Aulas de graduação | `GET /graduations/classes/graduation` | HTTP 200; lista de aulas de validação. |
| 16 | Validações de faixa | `GET /graduations/belt-validations?practitionerId=…` | HTTP 200; `data.data` paginado com status, faixas, professor e aula. |
| 17 | Certificados | `GET /graduations/certificates?page=1&limit=5` | HTTP 200; `data.data` paginado (vazio no fixture, sem certificado enviado). |
| 18 | Declaração de faixa | `POST /belt-validations` | Criada com sucesso; resposta com `id`, `status`, `practitionerId`, `targetBeltId` e vínculo com a aula. |
| 19 | Aprovação de faixa | `PATCH /belt-validations/:id/approve` `{ notes }` | HTTP 200; status `APPROVED`, `validatedAt` preenchido e `approvedByTeacherId`. |
| 20 | Inscrição em aula | `POST /classes/:id/enrollments` `{ practitionerId }` | Criada com sucesso; inscrição retornada com `id` e `status`. |
| 21 | Check-in do professor | `POST /classes/:id/enrollments/:enrollmentId/check-in` | Sucesso; inscrição passou a `CONFIRMED` com `confirmedAt` preenchido. |
| 22 | Participação | `PATCH /classes/:id/enrollments/:enrollmentId/participation` | HTTP 200; `{ enrollmentId, durationMinutes: 90, hoursAccuracy: "measured", participationStartedAt, participationEndedAt }`. |
| 23 | Workouts piloto | `GET /mobile/workouts` | HTTP 403 sem `workouts:read`, como esperado. O serviço existe, mas não há tela. |
| 24 | Perfil de professor | `GET /profile-readonly/me` com JWT de professor | HTTP 404 “Praticante não encontrado”; comportamento previsto no plano, pois o professor não tem `practitionerId`. |

## Evidências de resposta

### Login mobile

Aluno:

```json
{
  "accessToken": "<redacted>",
  "tokenType": "Bearer",
  "expiresIn": 7200,
  "userId": "8b7d0d89-…",
  "roles": ["STUDENT"],
  "practitionerId": "c9613242-…"
}
```

Professor:

```json
{
  "accessToken": "<redacted>",
  "tokenType": "Bearer",
  "expiresIn": 7200,
  "userId": "52649998-…",
  "roles": ["TEACHER"],
  "teacherId": "09cb5d04-…"
}
```

### Perfil read-only

```json
{
  "practitionerId": "c9613242-…",
  "userId": "8b7d0d89-…",
  "name": "Routes Test",
  "email": "routes.test.1794612885@caverna.test",
  "photoKey": null,
  "activeBelt": { "id": "7aa15d01-…", "name": "Azul", "color": "BLUE", "level": 2, "startedAt": "…" },
  "trainingRecord": {
    "id": "e3086ddd-…",
    "startsAt": "2026-11-15T10:00:00.000Z",
    "endsAt": "2026-11-15T11:30:00.000Z",
    "caveUnit": "Anália Franco",
    "class": "SCHEDULED"
  }
}
```

### Trilha com faixa nula

```json
{
  "practitionerId": "c9613242-…",
  "belt": null,
  "trail": {
    "id": "1dde5780-…",
    "name": "Trilha Azul",
    "percent": 0,
    "requiredCompleted": 0,
    "requiredTotal": 2,
    "currentStageId": "730cd8d9-…",
    "stagesCount": 1,
    "completedStagesCount": 0
  },
  "stages": [{ "id": "bbfcc8ac-…", "name": "Fundamentos", "status": "PENDING", "isCurrent": true }],
  "noActiveBelt": false
}
```

Esse formato foi o principal risco de runtime encontrado: `noActiveBelt: false` não garante `belt` preenchido. A tela usa fallback de cor/título e o tipo declara `belt`/`trail` como anuláveis.

### Atualização de horário

```json
{
  "scope": "single",
  "updated": 1,
  "schedules": [
    {
      "id": "d772635b-…",
      "capacity": 26,
      "title": "Horário de teste rotas (editado)"
    }
  ]
}
```

### Participação

```json
{
  "enrollmentId": "2b11482e-…",
  "durationMinutes": 90,
  "hoursAccuracy": "measured",
  "participationStartedAt": "2026-11-15T10:00:00.000Z",
  "participationEndedAt": "2026-11-15T11:30:00.000Z"
}
```

## Comandos representativos

Os requests da matriz foram executados com `curl` contra uma instância isolada. Exemplos (tokens e senhas omitidos):

```bash
BASE=http://localhost:3001/api/v1

# Login mobile
curl -sS -X POST "$BASE/mobile/auth/login" \
  -H 'content-type: application/json' \
  -d '{"email":"routes.test.1794612885@caverna.test","password":"<senha>"}'

# Perfil read-only
curl -sS "$BASE/profile-readonly/me" -H "Authorization: Bearer $TOKEN"

# Trilha read-only
curl -sS "$BASE/profile-readonly/trail" -H "Authorization: Bearer $TOKEN"

# Atualização de horário
curl -sS -X PATCH "$BASE/training/schedules/$SCHEDULE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"scope":"single","capacity":26}'

# Participação
curl -sS -X PATCH "$BASE/classes/$CLASS_ID/enrollments/$ENROLLMENT_ID/participation" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"startedAt":"2026-11-15T10:00:00.000Z","endedAt":"2026-11-15T11:30:00.000Z","reason":"Reexecução do teste de contrato"}'
```

## Verificações de código

Comandos de inspeção executados:

```bash
grep -rnE '/auth/login|/profiles/me|/practitioners/.*/home|/practitioners/me/trail|/certificates' src/api src/app
grep -rnE 'practitionerId' 'src/app/(private)/inicio/index.tsx' 'src/app/(private)/perfil/index.tsx' 'src/app/(private)/trilha/index.tsx' src/api/services/home.service.ts src/api/services/trail.service.ts
```

Resultados relevantes:

- Login aponta apenas para `/api/v1/mobile/auth/login`.
- Home/perfil/trilha não montam URL com `practitionerId`.
- `/profiles/me/photo` e `/certificates/upload` continuam presentes por serem operações de escrita sem substituta; não são usados para leitura read-only.
- A listagem de certificados usa `/graduations/certificates`, não `/certificates`.
- A tela de recuperação sempre define uma mensagem genérica local após HTTP 200.
- O `persist` do `useAppStore` mescla o objeto `user` para hidratar sessões antigas sem `roles`, `userId` ou `teacherId`.
- A foto usa a resposta do upload como fonte da URL e não invalida `["profile-me"]`, pois a leitura read-only removeria o overlay.

## Achados e inconsistências do backend

| Achado | Impacto no cliente |
| --- | --- |
| `profile-readonly/trail` retorna `belt: null` com `noActiveBelt: false` (e pode retornar `trail: null`). | Tipos e tela tratam ambos como anuláveis; o backend deve corrigir o contrato. |
| `home.nearbyCaves._meta.limit` e `radiusKm` chegam como string apesar do tipo numérico. | A home atual apenas interpola os valores; não há cálculo afetado. |
| Professor recebe 404 em `profile-readonly/me`. | Esperado: não há `practitionerId`. A área privada é liberada por token, mas telas de aluno mostram estado de ausência. |
| `GET /mobile/workouts` exige `workouts:read` e não publica DTO de resposta. | Serviço retorna `unknown`; sem tela nesta demanda. |
| A paginação de `graduations/certificates` emite `_links.self` apontando para `/api/v1/certificates`. | O cliente consome `data.data` e ignora `_links`, então não usa a rota depreciada. |
| O DTO de `GET /belt-validations` não converte `page`/`limit` de string. | `listMyBeltValidations` envia apenas `practitionerId` e usa a paginação padrão. |

## Cobertura não exercitada

- Telas do app não foram abertas manualmente em Expo Web/development build nesta rodada; a validação foi de contrato HTTP + typecheck + lint.
- Upload/remoção de foto não foi executado (exige arquivo e fluxo nativo); o contrato de escrita foi preservado e o tipo da resposta foi conferido no backend.
- Upload de certificado não foi exercitado; a listagem vazia confirmou apenas a rota paginada.
- Caminho autorizado de workouts não foi testado porque a conta de professor do fixture não possui `workouts:read`.
- Nenhuma tela de professor foi criada, conforme escopo.

## Correção do review MR-01 — foto de perfil

### Checks executados após a correção

| Comando | Resultado |
| --- | --- |
| `bunx tsc --noEmit` | Passou, sem erros. |
| `bun run lint` | Passou, sem erros ou avisos. |
| `git diff --check` | Passou, sem problemas de whitespace. |

### Matriz complementar

| Caso | Esperado | Obtido |
| --- | --- | --- |
| Perfil sem foto | O perfil permanece renderizável enquanto a consulta específica de foto responde `photoUrl: null`. | Exercitado no Expo Web em `http://localhost:8081/perfil`; a tela exibiu o avatar padrão e todos os controles do perfil, sem erro de renderização. |
| Foto existente após refetch | A URL vem de `GET /profiles/me`, não de `photoKey`; portanto um novo fetch do read-only não a apaga. | Verificado por inspeção de contrato/código: `ProfilePhoto` tem query própria (`["profile-photo"]`) e não lê/escreve `photoUrl` no cache de `profile-readonly/me`. |
| Upload ou remoção | A resposta autoritativa atualiza a imagem imediatamente. | Verificado por inspeção: as duas ações gravam `{ photoUrl }` em `["profile-photo"]`. Não foi feito upload em uma conta compartilhada apenas para o teste. |

### Contrato adicional conferido

`GET /api/v1/profiles/me` foi conferido em `../backend/src/modules/profiles/profiles.controller.ts` e retorna `ProfileResponse`, cujo serviço resolve `photoUrl` pelo adaptador de storage configurado. Isso evita ao cliente assumir formato de URL para `photoKey` entre storage local, Azure ou Neon.

## Como reproduzir

1. Subir a stack isolada:

```bash
cd ../backend
DB_PORT=5544 PORT=3001 docker compose -p caverna-routes-test \
  -f docker-compose.test.yaml --profile app up -d api
```

2. Fazer login mobile de aluno/professor e exportar os tokens em variáveis locais (não commitar tokens).
3. Executar os requests da matriz com `curl -H "Authorization: Bearer $TOKEN"`.
4. Para o reset com token válido, a stack de teste usa `EMAIL_PROVIDER=resend` sem chave e não registra o link. Foi inserido um token de teste diretamente no banco isolado, com hash SHA-256 e expiração curta, e o reset foi chamado em seguida. O token foi consumido no primeiro uso e a reutilização retornou 401.
5. Encerrar e remover a stack:

```bash
cd ../backend
docker compose -p caverna-routes-test -f docker-compose.test.yaml down
```

A stack `caverna-routes-test` foi removida após a validação.
