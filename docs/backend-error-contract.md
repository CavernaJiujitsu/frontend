# Contrato de erro v1 (backend é dono)

Todo `4xx/5xx` retorna esse body, sem wrapper `{ data }`. O `status` HTTP
continua valendo — o front lê `status + internalCode`.

```json
{
  "errorType": "DUPLICATE_RESOURCE",
  "errorDescription": {
    "internalCode": "CAVERNA_ALREADY_EXISTS",
    "message": "Caverna already exists for this owner",
    "domain": "gym",
    "field": null,
    "params": { "title": "Caverna Central" },
    "details": [{ "field": "email", "code": "INVALID_FORMAT" }],
    "traceId": "req_abc123"
  }
}
```

## Campos

| Campo          | Regra                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `errorType`    | Enum grosso p/ telemetria: `VALIDATION \| DUPLICATE_RESOURCE \| CONFLICT \| NOT_FOUND \| AUTH \| FORBIDDEN \| RATE_LIMIT \| SERVER_ERROR`    |
| `internalCode` | `SCREAMING_SNAKE`, estável. **Mudar = breaking change versionada pelo back.** É a chave do popup customizável e do dicionário pt-BR no front |
| `message`      | Inglês técnico, só fallback/log. Nunca exibido quando há tradução                                                                            |
| `domain`       | Contexto DDD: `auth \| profile \| gym \| schedule \| client \| server`                                                                       |
| `field`        | Campo do formulário (só 400/422), `null` quando não se aplica                                                                                |
| `params`       | Variáveis p/ interpolar a mensagem pt-BR (ex. `title`)                                                                                       |
| `details`      | Lista de erros de validação `{ field?, code, message? }`                                                                                     |
| `traceId`      | Id da requisição p/ rastrear 500 no log                                                                                                      |

## Exemplos

- `400` mal formatado → `VALIDATION / VALIDATION_FAILED`, `domain: client`
- `404` → `NOT_FOUND / RESOURCE_NOT_FOUND`
- `409` duplicidade → `DUPLICATE_RESOURCE / CAVERNA_ALREADY_EXISTS` (`params.title`)
- `409` conflito → `CONFLICT / SCHEDULE_CONFLICT`
- `422` validação → `VALIDATION / VALIDATION_FAILED` + `details[]`
- `500` → `SERVER_ERROR / SERVER_ERROR` + `traceId`

## Front

Schema em `src/api/types/api-error.ts` (zod `safeParse`, nunca lança).
Normalizador em `src/utils/normalize-api-error.ts` aceita o contrato v1,
formatos legados `{ message/error/code }` e falhas sem resposta
(`OFFLINE` / `TIMEOUT`). Dicionário pt-BR em
`src/constants/error-messages.ts`. Popup global via
`src/store/useErrorStore.ts` + `ErrorToast` montado no `_layout`
(auto-dismiss 5s). Telas usam `reportError(e)` no `catch` ou
`useReportQueryError(query.error)`.
