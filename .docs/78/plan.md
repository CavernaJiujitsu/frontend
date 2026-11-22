# Plano — Card #78: integrar a tela de login com a API de autenticação

Card: [Trello #78 — FE: Integrar tela de login com a API de autenticação](https://trello.com/c/MFcsqzLc/78-fe-integrar-tela-de-login-com-a-api-de-autentica%C3%A7%C3%A3o)

## Contexto

O card pede conectar a tela de login à API de autenticação de usuários existentes. Conteúdo fornecido pelo solicitante:

- **Objetivo:** conectar a tela de login à API de autenticação de usuários existentes.
- **Escopo:**
  - Criar serviço de autenticação no frontend.
  - Enviar e-mail e senha à API usando o contrato definido pelo backend.
  - Gerenciar loading, sucesso e erros de autenticação.
  - Persistir/armazenar a sessão conforme a estratégia de segurança definida pelo projeto; não duplicar tokens em stores sem necessidade.
  - Após sucesso, encaminhar o usuário para a tela inicial.
- **Critérios de aceite do card:**
  - Credenciais válidas permitem entrar e acessar a tela inicial.
  - Credenciais inválidas exibem mensagem clara sem revelar detalhes sensíveis.
  - Loading impede submissões repetidas.
  - Falhas de rede podem ser tentadas novamente.
  - A integração usa um serviço reutilizável e testes para os principais estados.

Estado atual da `dev` (merge do PR #13, `347a477`):

- A rota pública `/onboarding/login` já existe (card #77) e hoje simula o envio com o feedback "A autenticação será conectada em uma tarefa separada"; o CTA "Já tenho conta" da entrada do onboarding já aponta para ela.
- O CTA "Já tem conta? Entrar" da tela de criação de conta ainda volta para `/onboarding/start` — precisa levar direto ao login (pedido do solicitante).
- O backend de login já está pronto (card #74): `POST /api/v1/auth/login`, documentado em `backend/docs/authentication.md`.
- A `/inicio` (home-essentials-api) só busca dados quando `useAppStore.user.practitionerId` está preenchido; hoje apenas o fluxo de criação de conta popula esse id.
- O projeto já tem normalizador de erro (`src/utils/normalize-api-error.ts`), dicionário pt-BR (`src/constants/error-messages.ts`) e toast global (`reportError` + `ErrorToast`), cobrindo 401, 403, 429 e falhas de rede.
- Não existe service de auth, rota em `routes.ts`, store de sessão nem header `Authorization` no axios. Não há runner de testes automatizados configurado no repositório.

## Objetivo

Integrar a tela de login ao `POST /api/v1/auth/login` por meio de um service dedicado, com estados de loading/erro/sucesso, sessão armazenada em um único lugar (Zustand) e encaminhamento para `/inicio` no sucesso.

## Requisitos funcionais

1. Criar `src/api/services/auth.service.ts` expondo `login()` reutilizável, espelhando o contrato do backend (nomes de body e resposta exatamente como nos DTOs).
2. Registrar a rota do login em `src/api/endpoints/routes.ts`.
3. Na tela de login, substituir a simulação por chamada real: enviar `email` (com `trim`) e `password` (senha sem normalização; o campo do formulário se chama `senha`, mas o body usa `password`).
4. Sucesso: gravar a sessão (`accessToken`, `tokenType`, `expiresIn`, `userId`, `practitionerId`) em store dedicada, popular `practitionerId` no `useAppStore` (exigido pela `/inicio`) e navegar com `router.replace("/inicio")`.
5. Falha de API: exibir toast global via `reportError(error)` com a mensagem do dicionário pt-BR; manter os campos preenchidos e reabilitar o botão para nova tentativa.
6. Loading: `isSubmitting` do react-hook-form mantém o botão "Entrando..." desabilitado, impedindo submissões repetidas.
7. "Já tem conta? Entrar" na criação de conta passa a navegar direto para `/onboarding/login` com `router.replace`.
8. "Esqueci minha senha" permanece com o feedback de funcionalidade pendente, sem chamada de API.
9. Com sessão ativa, anexar `Authorization: Bearer <token>` às requisições do axios via interceptor de request.

## Requisitos não funcionais

- Compatível com iOS, Android e Web (Expo SDK 57, Expo Router).
- Sessão sem duplicação: o token vive apenas na store de sessão; nada de persistir token em disco nesta entrega (limitação registrada em Riscos).
- Sem dependência nova; preferir módulos/utilitários já presentes.
- Estilos e componentes atuais mantidos (tokens de `@/constants/theme`, `FormField`, `DefaultButton`, `ErrorToast`).
- Strings visíveis em PT-BR; comentários em inglês; imports com alias `@/`.
- Nunca logar senha/token; nunca colocar token em URL.

## Regras de negócio e referências internas

- `backend/docs/authentication.md` (fonte da verdade do login): body `{ email, password }`; e-mail normalizado no servidor (trim/minúsculas); senha não normalizada, máximo 72 caracteres; a conta precisa ter practitioner; 401 genérico; 403 sem perfil de praticante; 429 com `Retry-After`; 503 se o limitador cair; JWT HS256 de 2 horas; as demais rotas ainda não exigem auth; não há refresh nem revogação — "logout" no cliente é descartar o token.
- `docs/backend-error-contract.md`: erros 4xx/5xx; hoje o backend responde o envelope `{ message, timestamp, path }` e o normalizador do front já cobre esse formato e o contrato v1 futuro; telas usam `reportError(e)` no `catch`.
- `docs/api-contract/prd.md`: backend é fonte da verdade; espelhar DTO/controller antes de criar service.
- Limites por IP (relevantes para teste): volume de 20 req/min; 5 falhas de credencial em 15 min bloqueiam; bloqueio dura 1 min em local/test e 30 min em produção.
- `ui-style`: a tela já segue o padrão visual; nenhuma mudança de estilo prevista.

## Contrato de API consumido

`POST /api/v1/auth/login` — espelhado de `backend/src/auth/dto/login.dto.ts`, `login-response.dto.ts`, `token-response.dto.ts` e `auth.controller.ts`:

```json
// request
{ "email": "aluno@exemplo.com", "password": "..." }

// 200
{
  "message": "Login realizado com sucesso",
  "data": {
    "accessToken": "<JWT>",
    "tokenType": "Bearer",
    "expiresIn": 7200,
    "userId": "<UUID>",
    "practitionerId": "<UUID>"
  },
  "timestamp": "<ISO-8601>"
}
```

Erros: `400` corpo inválido (mensagem genérica `Credenciais inválidas`), `401` `E-mail ou senha inválidos`, `403` `Usuário não possui perfil de praticante associado`, `429` com header `Retry-After`, `503` limitador indisponível.

## Decisões de refinamento

| Tema | Decisão | Justificativa |
| --- | --- | --- |
| Base da branch | Criar `feat/78-integracao-login-api` a partir da `dev` (`347a477`), que já contém o #77 | PR #13 já mergeado (confirmado pelo solicitante) |
| Destino pós-login | `router.replace("/inicio")` | "tela inicial" do card; aprovado pelo solicitante |
| Sessão | Store Zustand dedicada `useSessionStore` (em memória), sem persistência em disco | Solicitante: app roda na web e sessão via Zustand "como de costume"; evita duplicar token; estratégia de persistência/segurança fica para card futuro |
| Uso do token | Interceptor de request do axios anexa `Authorization: Bearer` quando há sessão | É o uso previsto pelo backend para futuras rotas protegidas; dá propósito à sessão sem duplicar o token |
| practitionerId | Também gravar em `useAppStore.setPractitionerId` | A `/inicio` e os fluxos privados leem esse id de lá; sem ele, a tela inicial não carrega |
| Feedback de erro | Toast global via `reportError` (401, 403, 429, 503, rede) | Padrão do contrato de erro; aprovado pelo solicitante; validação de campos continua inline |
| Retry | Reabilitar o botão após a falha; nova tentativa pelo mesmo CTA | Critério do card ("falhas de rede podem ser tentadas novamente") sem criar tela nova |
| Botão "já tenho conta" | `create-account.tsx` passa a apontar para `/onboarding/login`; `start.tsx` já aponta (sem mudança) | Pedido do solicitante: qualquer botão de "já possuo conta" leva ao login |
| 403 sem practitioner | Mensagem genérica de permissão do dicionário (`FORBIDDEN`) | Não vaza detalhes; o backend ainda não envia o contrato de erro v1 com `domain: auth` |
| Melhoria incidental | Mapear `503` para `SERVICE_UNAVAILABLE` em `normalize-api-error.ts` | Hoje 503 cai em `SERVER_ERROR`; o dicionário já tem "Serviço indisponível no momento." e o backend documenta 503 no login |

## Fora de escopo

- Persistir sessão entre reloads/aberturas do app, logout, refresh token e expiração de sessão.
- Proteger as rotas privadas (guards de navegação) — o backend também ainda não exige autenticação nas demais rotas.
- Recuperação/redefinição de senha real; login social; canais alternativos (card #94).
- Buscar o perfil completo (nome) após o login: a resposta do login não traz o nome; a tela de perfil segue placeholder.
- Alterações no backend, no contrato de erro ou em outros services.
- Infraestrutura de testes automatizados (ver Riscos).

## Critérios de aceite

1. Com backend local, credenciais válidas autenticam (200) e o app navega para `/inicio`; a store de sessão fica com `accessToken`, `tokenType`, `expiresIn`, `userId` e `practitionerId`, e `useAppStore.user.practitionerId` fica preenchido (verificável pela request de `:id/home` disparada sem erro de "não foi possível carregar").
2. A requisição para `:id/home` sai com `Authorization: Bearer <token>` no header (Network).
3. Credenciais inválidas (401) exibem o toast "Credenciais inválidas. Tente novamente." sem revelar se o e-mail existe; os campos permanecem preenchidos e o botão volta a "Entrar".
4. Durante a requisição o botão mostra "Entrando..." e fica desabilitado; dois toques rápidos geram apenas uma requisição em `POST /auth/login`.
5. Sem rede, o toast de falha (offline/timeout) aparece e, ao restabelecer a conexão, um novo toque autentica normalmente (retry).
6. Após 5 falhas de credencial, a tentativa retorna 429 e o toast "Muitas tentativas. Aguarde um pouco." aparece com o botão reabilitado (bloqueio de 1 min em local/test).
7. "Já tem conta? Entrar" na criação de conta navega direto para `/onboarding/login`; "Já tenho conta" na entrada do onboarding continua abrindo o login (sem regressão do #77).
8. E-mail vazio/inválido ou senha vazia mostram erro no campo e nenhuma requisição é disparada.
9. "Esqueci minha senha" não dispara requisição e mantém o feedback de pendência.
10. `auth.service.ts` é o único ponto que chama `/auth/login`; a tela não importa axios diretamente; o token não aparece em nenhuma outra store, log ou URL.
11. `bun run lint` e `bunx tsc --noEmit` terminam sem erros.

## Estratégia de teste

- Rodar `bun run lint` e `bunx tsc --noEmit`.
- Backend local + app em web (`bunx expo start`): criar (ou usar) um usuário praticante, limpar o estado recarregando o app web, exercitar o login e o fluxo até `/inicio`.
- Conferir no Network: uma única request por toque, body `{ email, password }`, header `Authorization` na request da home após o login.
- `curl` no backend para reproduzir 401, 429 (5 falhas) e 503 quando possível, confirmando os envelopes e mensagens que o front deve exibir.
- Matriz de casos no `test.md` cobrindo loading, sucesso, 401, 403, 429, falha de rede com retry, validação local e navegação de entrada/saída — atende ao critério "testes para os principais estados" do card dentro do fluxo SDD do repositório (não há runner de testes unitários configurado).

## Riscos e pendências

- **Sessão em memória:** recarregar a página web perde o login e volta-se à tela de login. Decisão consciente desta entrega; persistência/estratégia de segurança (e logout) ficam para um card futuro.
- **429 por IP:** o bloqueio é compartilhado por IP; testes locais podem bloquear o login por 1 min para todos os usuários da máquina.
- **403 sem practitioner:** mostra a mensagem genérica de permissão; melhora quando o backend migrar para o contrato de erro v1 com `domain: auth`.
- **Header Bearer é preparação:** como o backend ainda não exige auth nas rotas, não há prova de proteção real — só de envio correto do header.
- **Sem testes automatizados no front:** `cypress` está nas dependências mas sem configuração; a cobertura por `test.md` é manual/assistida. Infra de testes é dívida separada.
- **Nome do usuário:** login não retorna o nome; a saudação da `/inicio` usa o dado da própria API de home, então não há impacto nesta entrega.
