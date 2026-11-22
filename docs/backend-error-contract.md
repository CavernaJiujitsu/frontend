# Contrato de erro (o backend é o dono)

Fonte: filtro global `backend/src/modules/shared/filters/http-exception.filter.ts`
(registrado como `APP_FILTER` em `backend/src/modules/shared/shared.module.ts`).
Todo `4xx/5xx` responde este corpo, sem o envelope `{ data }`:

```json
{
  "message": "Aula lotada",
  "timestamp": "2026-11-17T09:59:17.396Z",
  "path": "/api/v1/classes/<id>/enrollments"
}
```

Não existem `errorType`, `errorDescription` nem `internalCode`. O front decide
pelo **status HTTP** e pelo texto do **`message`**.

## Como o `message` é montado no backend

| Origem | `message` | Idioma |
| --- | --- | --- |
| `throw new XxxException('texto')` nos services e guards | o texto | PT-BR (mensagem de negócio) |
| `ValidationPipe` (class-validator) | todas as violações juntadas com `"; "` (o filtro já transforma o array em string) | inglês, exceto as que têm `message` custom no DTO |
| `Parse*Pipe` (por exemplo `ParseUUIDPipe`) | `Validation failed (uuid is expected)` | inglês |
| Rota inexistente | `Cannot GET /api/v1/...` | inglês |
| JSON mal formado | `JSON Parse error: ...` | inglês |
| Erro não tratado (500) | `Internal server error` | inglês |
| Violação de unique (corrida) | `Registro já existente` (409) | PT-BR |

Alguns DTOs têm mensagem custom em PT (`E-mail não pode conter espaços`,
`latitude e longitude devem ser enviadas juntas`, `Credenciais inválidas` no
login). Elas costumam vir **misturadas** com as mensagens padrão em inglês na
mesma resposta, e as de DTO aninhado vêm com prefixo (`user.E-mail não pode...`).

## Exemplos reais (conferidos com `curl` em 17/11/2026)

| Requisição | Status | `message` |
| --- | --- | --- |
| `POST /mobile/auth/login` senha errada | 401 | `E-mail ou senha inválidos` |
| Rota protegida com token inválido ou sem token | 401 | `Token de acesso inválido` |
| `POST /mobile/auth/login` com `{}` | 400 | `email must be shorter than or equal to 160 characters; email must be an email; E-mail não pode conter espaços; Credenciais inválidas; Credenciais inválidas; Credenciais inválidas` |
| `POST /practitioners` com e-mail com espaço | 400 | `user.email must be an email; user.E-mail não pode conter espaços` |
| `GET /caves?academyUnitId=1` | 400 | `property academyUnitId should not exist` |
| `GET /classes/not-a-uuid` | 400 | `Validation failed (uuid is expected)` |
| `POST /mobile/auth/login` com JSON quebrado | 400 | `JSON Parse error: Expected '}'` |
| `POST /certificates/upload` com tipo inválido | 400 | `Apenas arquivos JPG, PNG ou PDF são permitidos!` |
| `DELETE /classes/:id` como aluno | 403 | `Você não tem permissão para gerenciar esta aula` |
| `GET /classes/<uuid inexistente>` | 404 | `Aula não encontrada` |
| `GET /does-not-exist` | 404 | `Cannot GET /api/v1/does-not-exist` |
| `POST /practitioners` com e-mail repetido | 409 | `Email já cadastrado` |
| `POST /classes/:id/enrollments` de novo | 409 | `Aluno já inscrito nesta aula` |
| Outros 409 de inscrição (no código) | 409 | `Aula lotada`, `Faixa atual do aluno não é elegível para esta aula` |
| Login bloqueado por tentativas (no código) | 429 | `Muitas tentativas de login. Tente novamente mais tarde` (+ header `Retry-After`) |

## Política de exibição no app

Implementada em `src/constants/error-messages.ts` (`getErrorMessage`), nesta ordem:

1. **Sessão expirada**: 401 de uma requisição que levou `Authorization: Bearer`
   → `Sessão expirada. Entre novamente.` (o texto do backend é ignorado).
2. **Sem resposta**: `Sem conexão. Verifique sua internet.` ou, em timeout,
   `A requisição demorou demais. Tente novamente.`
3. **Mensagem de negócio do backend**: o `message` é exibido como veio, sem
   segmentos repetidos.
4. Se o `message` é **técnico** (qualquer segmento bate com um padrão em inglês
   de framework: `must`/`should` do class-validator, `Validation failed`,
   `Cannot GET`, `JSON`, `ThrottlerException`, textos padrão como
   `Internal server error`), ele **inteiro** é escondido. Mostrar só a parte em
   PT de uma lista mista confunde (por exemplo `E-mail não pode conter espaços`
   para um e-mail vazio). Nesse caso:
   - usa o `fallback` da tela, se ela passou um (`getErrorMessage(e, "Não foi possível salvar a aula.")`);
   - senão, um texto genérico em PT pelo status (400/422: dados inválidos;
     403: sem permissão; 404: não encontrado; 409: conflito; 429: muitas
     tentativas; 5xx: erro no servidor).

O 401 do login **não** é sessão expirada: as rotas públicas de auth
(`mobile/auth/login`, `auth/password-recovery/*`) nunca levam o bearer, então
o app mostra `E-mail ou senha inválidos`.

## Sessão expirada

`src/api/bootstrap/axios-bootstrap.ts`: num 401 de requisição que levou o
token **atual** do store, chama `expireSession()` (`src/utils/session.ts`):
limpa token e identidade (mantém a localização do aparelho), limpa o
`queryClient`, faz `router.replace("/onboarding/login")` e mostra o toast
global. Requisições concorrentes com 401 disparam isso uma vez só: depois do
primeiro reset o token do store já não é o que elas enviaram. As telas não
tratam 401.

## Front

- Schema: `src/api/types/api-error.ts` (`BackendErrorBodySchema`, zod
  `safeParse`, nunca lança). `AppError = { kind, status?, message?, path? }`,
  com `kind` = `http | session-expired | offline | timeout | unknown`.
- Normalizador: `src/utils/normalize-api-error.ts` (`normalizeApiError(e)`).
  Ele só lê o que o backend mandou; não deduz motivo de negócio pelo status.
- Texto exibível: `getErrorMessage(normalizeApiError(e), fallback?)`. Nunca
  mostre `appError.message` direto: ele pode estar em inglês.
- Para ramificar: `normalizeApiError(e).status` (por exemplo, 409 na inscrição).
- Toast global: `reportError(e)` no `catch`, ou `useReportQueryError(query.error)`
  (`src/store/useErrorStore.ts` + `ErrorToast` no `_layout`, some em 5 s).
