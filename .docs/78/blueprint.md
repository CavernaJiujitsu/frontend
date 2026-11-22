# Blueprint — Card #78: integrar a tela de login com a API de autenticação

Pré-requisito: `.docs/78/plan.md` aprovado. Base: `dev` @ `347a477` (já com a tela do #77 e a home-essentials-api).

## Inventário e reuso

| Peça | Onde vive hoje | Uso nesta entrega |
| --- | --- | --- |
| Tela de login | `src/app/onboarding/(login)/login.tsx` (#77) | Trocar a simulação (`setTimeout` + toast "será conectada em tarefa separada") pela chamada real ao service; manter layout, validação e acessibilidade. |
| Estilos da tela | `src/styles/onboarding/login.styles.ts` | Reusar sem alteração. |
| Entrada "Já tenho conta" | `src/app/onboarding/(start)/start.tsx` | Já navega para `/onboarding/login` (#77); nenhuma mudança. |
| Entrada "Já tem conta? Entrar" | `src/app/onboarding/(create-account)/create-account.tsx` | Alterar `handleGoToLogin` de `/onboarding/start` para `/onboarding/login`. |
| Cliente HTTP | `src/api/bootstrap/axios-bootstrap.ts` | Adicionar interceptor de request que anexa `Authorization` quando há sessão; nenhum interceptor existe hoje. |
| Rotas de API | `src/api/endpoints/routes.ts` | Adicionar a chave do login; hoje não há nenhuma rota de auth. |
| Padrão de service | `src/api/services/practitioners.service.ts`, `home.service.ts`, `classes.service.ts` | Espelhar o formato: tipos exportados, `apiClient.post<ApiEnvelope<T>>`, `unwrap(data)`. |
| Envelope de sucesso | `src/api/types/envelope.ts` (`{ message, data }`) | Reusar. |
| Dicionário de erros | `src/constants/error-messages.ts` | Reusar `INVALID_CREDENTIALS`, `FORBIDDEN`, `RATE_LIMITED`, `OFFLINE`, `TIMEOUT`, `SERVICE_UNAVAILABLE`; nenhuma mensagem nova. |
| Normalizador de erro | `src/utils/normalize-api-error.ts` | Reusar; incluir mapeamento de `503 → SERVICE_UNAVAILABLE` (hoje cai em `SERVER_ERROR`). |
| Toast global | `src/store/useErrorStore.ts` (`reportError`) + `ErrorToast` no root layout | Reusar para erros de API; a tela já importa `useErrorStore` para o feedback de "Esqueci minha senha". |
| Campos e CTA | `src/components/customized/form-field/form-field.tsx` (props `error`, `rightAction`, `editable`) e `default-button.tsx` (props `disabled`) | Reusar; `editable={!isSubmitting}` nos campos durante o envio. |
| Identidade do praticante | `src/store/useAppStore.ts` (`user.practitionerId`, `setPractitionerId`) | Popular no login; é a fonte lida pela `/inicio` (`getHomeSummary`) e pelos fluxos privados. |
| Serviço de home | `src/api/services/home.service.ts` | Não muda; passa a funcionar após o login popular `practitionerId`. |
| Mock de UI | `src/api/mocks/` | Nenhum mock: o endpoint real existe e está documentado. |

## Alternativas avaliadas

| Decisão | Alternativas | Escolha e justificativa |
| --- | --- | --- |
| Onde guardar a sessão | Estender `useAppStore.user`; criar `useSessionStore`; persistir (localStorage/SecureStore/AsyncStorage) | **`useSessionStore` dedicada, em memória.** Separa identidade de onboarding (já em `useAppStore`) do material de auth; token passa a ter um único dono; persistência foi descartada no plano (exigiria decisão de segurança própria e o app é web). |
| O que a sessão guarda | Resposta completa do login; só o material de auth | **Só `accessToken`, `tokenType`, `expiresIn`.** `practitionerId` continua só no `useAppStore` (evita duas fontes de verdade); `userId` não tem consumidor hoje. |
| Chamada do login | Hook `useLogin` novo; `useMutation` do react-query; service direto no handler | **Service direto no handler.** Padrão real do projeto (não há nenhum `useMutation`; telas chamam services no handler). Hook só se houver reuso futuro. |
| Service | Um `auth.service.ts` com `login()`; função solta em outro service | **`src/api/services/auth.service.ts`**, espelhando o módulo `auth` do backend (`backend/src/auth/`) e o padrão dos demais services. |
| Rota | `authLogin: "/api/v1/auth/login"`; `auth: "/api/v1/auth"` + sufixo na tela | **`authLogin` explícito no `routes.ts`.** O front não consome `POST /auth/token` (ferramenta de dev do Swagger); nome explícito evita string solta. |
| Header de autorização | Header por request em cada service; interceptor único lendo a store | **Interceptor de request.** Um só lugar, cobre automaticamente as futuras rotas protegidas; os services ficam sem ruído. |
| Feedback de erro | Toast global (`reportError`); texto inline tipo `create-account` | **Toast global** (aprovado no plano): é o padrão do contrato de erro (`docs/backend-error-contract.md`) e o dicionário já cobre 401/403/429/rede. Validação de formato continua inline no `FormField`. |
| 503 do login | Deixar cair em "Erro no servidor"; mapear para `SERVICE_UNAVAILABLE` | **Mapear no normalizador.** O dicionário já tem "Serviço indisponível no momento." e o backend documenta 503 específico do login; mudança de uma linha, registrada no plano. |

## Desenho final

### Arquivos a criar

| Arquivo | Papel |
| --- | --- |
| `src/api/services/auth.service.ts` | Único ponto que chama `POST /auth/login`. Tipos `LoginPayload` (`email`, `password`) e `LoginResponse` (`accessToken`, `tokenType`, `expiresIn`, `userId`, `practitionerId`) espelhando os DTOs do backend. |
| `src/store/useSessionStore.ts` | Store Zustand da sessão: `session` (ou `null`) com `accessToken`, `tokenType`, `expiresIn`; ações `setSession` e `clearSession` (esta preparada para o futuro logout, como o `resetUser` do `useAppStore`). |

Esboço do service (mesmo formato de `practitioners.service.ts`):

```ts
export type LoginPayload = { email: string; password: string };

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  practitionerId: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>(
    routes.authLogin,
    payload,
  );
  return unwrap(data);
}
```

### Arquivos a alterar

| Arquivo | Alteração |
| --- | --- |
| `src/api/endpoints/routes.ts` | Adicionar `authLogin: \`${API_PREFIX}/auth/login\``. |
| `src/api/bootstrap/axios-bootstrap.ts` | Interceptor de request: lê `useSessionStore.getState().session` e, se existir, define `Authorization: <tokenType> <accessToken>` via `config.headers.set(...)`. Sem sessão, não mexe no header. |
| `src/app/onboarding/(login)/login.tsx` | `handleLogin` passa a: `login({ email: email.trim(), password: senha })` → `setSession({ accessToken, tokenType, expiresIn })` → `useAppStore.setPractitionerId(practitionerId)` → `router.replace("/inicio")`; no `catch`, `reportError(error)`. Remove o delay simulado. Campos com `editable={!isSubmitting}`; "Esqueci minha senha" e "Criar conta" inalterados. |
| `src/app/onboarding/(create-account)/create-account.tsx` | `handleGoToLogin` passa a `router.replace("/onboarding/login")`. |
| `src/utils/normalize-api-error.ts` | Em `internalCodeForStatus`, mapear `503` para `SERVICE_UNAVAILABLE` antes do fallback `>= 500` (o `errorType` continua `SERVER_ERROR`, que é o enum do contrato v1). |

Nenhum arquivo de estilo, componente, mock ou backend é alterado.

### Rota e navegação

```text
/onboarding/start ──"Já tenho conta"──▶ /onboarding/login        (existente, #77)
/onboarding/welcome ─▶ … ─▶ /onboarding/create-account
                              └─"Já tem conta? Entrar"─▶ /onboarding/login   (novo)

/onboarding/login
  ├─ "Entrar" (200) ─▶ replace("/inicio")          (novo; privada já existente)
  ├─ "Criar conta"  ─▶ replace("/onboarding/start") (existente)
  └─ "Esqueci minha senha" ─▶ toast de pendência    (existente, sem request)
```

### Componentes e props

- `FormField` (existente): e-mail com `keyboardType="email-address"`, `autoCapitalize="none"`; senha com `secureTextEntry` e `rightAction` de mostrar/ocultar; ambos ganham `editable={!isSubmitting}` e continuam com erro inline.
- `DefaultButton` (existente): `label` alterna "Entrar"/"Entrando...", `disabled={isSubmitting}`, `color={BrandColors.secondary}`.
- `ErrorToast` (existente no root layout): acionado por `reportError`; mensagens vêm do dicionário. Nenhum componente novo.

### Estados da tela

| Estado | Disparo | Comportamento |
| --- | --- | --- |
| Inicial | abertura | Campos vazios, senha mascarada, botão "Entrar" ativo. |
| Validação local | toque em "Entrar" com campo vazio/e-mail inválido | Erro no próprio `FormField`; nenhuma requisição. |
| Enviando | submit válido | Botão "Entrando..." desabilitado, campos não editáveis, links desabilitados; uma única requisição (`react-hook-form` controla `isSubmitting`). |
| Sucesso | `200` do login | Sessão salva, `practitionerId` no `useAppStore`, `replace` para `/inicio`; a navegação é o feedback (não há toast de sucesso no projeto). |
| Erro de API | `401`/`403`/`429`/`503`/rede | `reportError` → toast global com mensagem PT-BR; campos preservados; botão volta a "Entrar" e nova tentativa é possível (retry). |

### Contrato de API consumido

`POST /api/v1/auth/login` (espelho de `backend/src/auth/dto/login.dto.ts`, `login-response.dto.ts`, `token-response.dto.ts`, `auth.controller.ts` e `backend/docs/authentication.md`):

- Body: `{ "email": string, "password": string }` — e-mail vai com `trim`; senha nunca é normalizada no front.
- `200`: envelope `{ message: "Login realizado com sucesso", data: { accessToken, tokenType: "Bearer", expiresIn: 7200, userId, practitionerId }, timestamp }` — o front consome `accessToken`, `tokenType`, `expiresIn` (sessão) e `practitionerId` (identidade).
- Erros: `400` genérico de credenciais, `401`, `403`, `429` (com `Retry-After`, ignorado nesta entrega — o dicionário exibe mensagem própria), `503`.
- Uso do token: header `Authorization` nas requisições do axios a partir do login (o backend ainda não exige auth nas demais rotas; é preparação prevista em `backend/docs/authentication.md`).

### Mocks de UI

Nenhum. O endpoint real está no ar/local e não há estado de tela que dependa de dado remoto além do próprio login.

## Duplicidades evitadas

- Nenhum componente, toast, dicionário de mensagens ou normalizador novo — tudo reusado.
- Token em exatamente uma store (`useSessionStore`); `practitionerId` em exatamente uma (`useAppStore`).
- Nenhum hook ou `useMutation` novo: o handler da tela chama o service, como nas demais telas.
- Nenhuma dependência nova e nenhuma alteração em `docs/` de produto (o padrão de service já vigora em `docs/api-contract/prd.md`).
- `start.tsx` e os estilos do login não são tocados (já corretos).

## Riscos e limites

- **Interceptor e tipos do axios:** usar `config.headers.set(...)` (AxiosHeaders v1); se o typecheck reclamar, cair para atribuição direta do campo, sem mudar o comportamento.
- **Sem expiração:** `expiresIn` é guardado, mas nada verifica validade do token ainda; após 2h o backend (quando protege rotas) ou o próximo login resolve — fora de escopo.
- **Import circular:** `axios-bootstrap` passa a importar `useSessionStore`; a store só importa `zustand`, sem ciclo.
- **Múltiplas abas na web:** sessão em memória é por aba; sem sincronização (aceito nesta entrega).
- **`clearSession` sem consumidor nesta entrega:** exposto para logout futuro, mesmo padrão do `resetUser` existente.
