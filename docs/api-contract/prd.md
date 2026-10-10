# PRD — Backend é fonte da verdade para o contrato de API

Status: **done**

## 1. Contexto

O frontend (Expo/React Native) consome a API NestJS (`backend/`) via `src/api/services/*`
com `axios`. Houve divergência de nomenclatura após a renomeação `academy -> cave`
no backend (migration `1750000000022-RenameAcademyToCave.ts`): o frontend continuou
enviando `academyUnitId` em `GET /api/v1/classes`, enquanto o DTO canônico
`backend/src/classes/dto/query-classes.dto.ts` aceita apenas `caveUnitId`.

Como o backend usa `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`
(`backend/src/main.ts`), qualquer query desconhecida retorna:

```json
{
  "message": "property academyUnitId should not exist",
  "path": "/api/v1/classes?page=1&limit=100&academyUnitId=..."
}
```

A tela de schedule (`src/app/onboarding/(schedule)/schedule.tsx`) caiu no `catch`
e exibiu "Não foi possível carregar as aulas.", com lista vazia.

## 2. Problema

- Nenhuma regra escrita obrigava o agente a conferir o DTO/controller do backend
  antes de criar/alterar um service do frontend.
- Nomes antigos (`academyUnitId`) sobreviveram no frontend sem que lint/typecheck
  acusassem, porque são apenas strings de query param.
- Cada divergência vira um `400 forbidNonWhitelisted` que parece "erro na listagem",
  mas é contrato quebrado no client.

## 3. Decisão (regra permanente)

**O backend é fonte da verdade para: nomes de rotas, query params, body, enums e
códigos de erro. Em qualquer divergência, corrige-se o frontend. O backend nunca
recebe alias/compat temporário sem aprovação explícita do dono.**

Referências canônicas no backend (ler antes de codar integração):

| Conceito | Fonte |
|---|---|
| Prefixo global | `backend/src/shared/api-prefix.ts` (`api/v1`) + `backend/src/main.ts` (`setGlobalPrefix`) |
| Query/body por recurso | `backend/src/<recurso>/dto/*.dto.ts` |
| Rota, método, summary | `backend/src/<recurso>/*.controller.ts` |
| Regra de negócio | `backend/src/<recurso>/*.service.ts`, `backend/docs/business-rules.md` |
| Nomes de coluna/entidade | `backend/src/domain/entities/*`, `backend/docs/schema.dbml` |
| Formato de erro | `frontend/docs/backend-error-contract.md` (espelha o backend) |

Casos já mapeados (não reintroduzir o nome antigo):

| Recurso | Nome canônico | Nome antigo proibido no front |
|---|---|---|
| `GET /api/v1/classes` filtro por unidade | `caveUnitId` | `academyUnitId` |
| Demais filtros de aula | `teacherId`, `type` | — |

## 4. Requisitos

### 4.1 Fluxo obrigatório antes de criar/alterar `src/api/services/*`

1. Ler o DTO correspondente em `backend/src/<recurso>/dto/` (query + body).
2. Ler o controller em `backend/src/<recurso>/*.controller.ts` (path, método, params).
3. Espelhar nomes exatos no tipo `*Params`/`*Payload` e no objeto `params`/body do `axios`.
4. Conferir `frontend/docs/backend-error-contract.md` para o tratamento de erro.

### 4.2 Proibições

- Nunca inventar nome de query/body por memória (ex. `academyUnitId`, `cavernaId`
  como query de `/classes`).
- Nunca adicionar campo "extra por conveniência" ao request sem checar
  `forbidNonWhitelisted` — campo desconhecido quebra com `400`.
- Nunca propor alias no backend (`academyUnitId?` opcional, `@Transform`, etc.)
  como "compatibilidade" sem aprovação explícita. O padrão é corrigir o front.
- Nunca escrever comentários de código em PT — comentários sempre em inglês
  (textos de UI e mensagens de erro continuam em PT).

### 4.3 Correção aplicada (incidente `academyUnitId`)

Arquivos alterados:

- `src/api/services/classes.service.ts`: `ListClassesParams.academyUnitId?` →
  `caveUnitId?`; objeto `params` passa `{ caveUnitId }`.
- `src/app/onboarding/(schedule)/schedule.tsx`: `listClasses({ academyUnitId: unit.id })` →
  `listClasses({ caveUnitId: unit.id })`.

Backend intacto (nenhum DTO/controller alterado).

## 5. Critérios de aceite

- [x] `rg "academyUnit" frontend/src` retorna zero ocorrências.
- [x] `GET /api/v1/classes?page=1&limit=100&caveUnitId=<uuid>` retorna 200.
- [x] `GET` com `academyUnitId=` continua 400 (prova de que o pipe estrito está ativo).
- [x] Fluxo `nearby-gym -> schedule` lista aulas de ao menos uma unidade com dados.
- [x] `bunx tsc --noEmit` limpo em `frontend/`.
- [x] `bunx expo lint` limpo em `frontend/`.
- [x] Este PRD existe em `docs/api-contract/prd.md` e `AGENTS.md` aponta para ele.

## 6. Arquivos

- Criado: `docs/api-contract/prd.md` (este arquivo).
- Alterados (incidente): `src/api/services/classes.service.ts`,
  `src/app/onboarding/(schedule)/schedule.tsx`.
- Referência: `frontend/AGENTS.md` (seção `API Contract`), `docs/backend-error-contract.md`.
