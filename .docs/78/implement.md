# Implementação — Card #78: integrar a tela de login com a API de autenticação

## Commits da branch

| Commit | Conteúdo |
| --- | --- |
| `8b1282c` | `feat: integra tela de login com a API de autenticação` — código (service, store, interceptor, tela, ajustes) |
| `732ef3f` | `fix: corrige validação de senha que impedia o submit do login` — achado do `$feature-teste` (ver `test.md`) |

Branch: `feat/78-integracao-login-api`, criada a partir da `dev` (`347a477`). Ainda não pushada.

## O que foi feito por área

### API

- `src/api/services/auth.service.ts` (novo): `login(payload: LoginPayload): Promise<LoginResponse>` chamando `POST /auth/login` via `apiClient` e `unwrap`; tipos `LoginPayload` (`email`, `password`) e `LoginResponse` (`accessToken`, `tokenType`, `expiresIn`, `userId`, `practitionerId`) espelhando `backend/src/auth/dto/*.dto.ts`.
- `src/api/endpoints/routes.ts`: chave `authLogin: "/api/v1/auth/login"`.
- `src/api/bootstrap/axios-bootstrap.ts`: interceptor de request que lê `useSessionStore` e anexa `Authorization: <tokenType> <accessToken>` quando há sessão (`config.headers.set(...)` funcionou no typecheck — não foi preciso o fallback previsto no blueprint).

### Estado

- `src/store/useSessionStore.ts` (novo): store Zustand com `session: { accessToken, tokenType, expiresIn } | null`, `setSession` e `clearSession`. Token não é duplicado em nenhuma outra store; `practitionerId` continua apenas no `useAppStore`.

### Telas

- `src/app/onboarding/(login)/login.tsx`: `handleLogin` agora chama o service com `email.trim()` e `senha` sem normalização; no sucesso salva a sessão, grava `practitionerId` no `useAppStore` e faz `router.replace("/inicio")`; no `catch`, `reportError` (toast global). Delay simulado e o toast "será conectada em tarefa separada" foram removidos. Campos ganharam `editable={!isSubmitting}` (além do botão desabilitado com "Entrando..."). "Esqueci minha senha" e "Criar conta" seguem como antes.
- `src/app/onboarding/(create-account)/create-account.tsx`: `handleGoToLogin` passa a `router.replace("/onboarding/login")` — qualquer botão de "já tenho conta" leva direto ao login.

### Erros (mudança incidental planejada)

- `src/utils/normalize-api-error.ts`: `internalCodeForStatus` mapeia `503 → SERVICE_UNAVAILABLE`, usando a mensagem já existente no dicionário ("Serviço indisponível no momento.") em vez do fallback genérico de servidor. Justificativa registrada no plano/blueprint (503 documentado do login em `backend/docs/authentication.md`).

## Decisões e desvios do blueprint

- **Nenhum desvio de desenho.** Service, store enxuta, interceptor, fluxo de sucesso/erro e ajustes de entrada foram implementados como no `blueprint.md`.
- Decisão registrada: não guardar `userId`/`practitionerId` na store de sessão (evita duas fontes de verdade); a tela consome esses campos direto da resposta do service.
- Decisão registrada: `clearSession` existe sem consumidor nesta entrega (padrão do `resetUser` do `useAppStore`), preparada para o futuro logout.

## Mudanças incidentais

- Ajuste de formatação na destructure do `handleLogin` (quebra de linha) para legibilidade — sem impacto funcional.
- Nenhuma outra alteração fora do escopo aprovado; `start.tsx`, estilos, componentes e backend não foram tocados.

## Validação executada

| Comando | Resultado |
| --- | --- |
| `bun run lint` | exit 0, sem avisos |
| `bunx tsc --noEmit` | exit 0, sem erros |
| `bunx expo-doctor` | 20/21 ok — falha pré-existente de duplicata de `expo-constants` no `node_modules` (não relacionada) |

Validação de fluxo completa em `test.md` (curl + automação CDP no Chrome): cenários 1–4 do harness 20/20, 429 4/4, navegações 6/6.

## Correção pós-teste (`$feature-teste`)

- `src/app/onboarding/(login)/login.tsx`: regra de validação da senha era `validate: (value) => value || "Informe sua senha."` — o react-hook-form lê qualquer string retornada como **mensagem de erro**, então a senha preenchida marcava o campo como inválido (e exibia a própria senha como erro), impedindo o submit válido. Corrigido para `validate: (value) => (value ? true : "Informe sua senha.")`. Bug **pré-existente do #77**, exposto ao conectar o backend; evidências no `test.md`.

## Pendências

- Validação manual final do solicitante (combinada na tarefa) — servidores local deixados rodando.
- Push da branch e PR ficam para o fluxo `pr-create` (após review/teste); `$feature-review` ainda não rodou.
