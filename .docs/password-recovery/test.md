# Testes — solicitação de recuperação de senha

## Ambiente e execução

Data: 29/10/2026. Frontend Expo SDK 57. API e Postgres locais iniciados com `docker compose` em `../backend`; nginx em `http://localhost:4000`, URL configurada em `.env` do frontend. Foi necessário criar o banco local `caverna_local`, ausente no volume Docker, para as migrations terminarem. O Expo web iniciou em `http://localhost:8081` e foi exercitado no Chrome. A instalação opcional do React Native DevTools emitiu erro de sandbox, mas Metro e a aplicação web funcionaram.

## Checks

| Comando | Resultado |
| --- | --- |
| `bun run lint` | Passou, saída sem erros. |
| `bunx tsc --noEmit` | Passou, saída sem erros. |
| `git diff --check` | Passou. |
| `bunx expo export --platform web --output-dir /tmp/password-recovery-web` | Passou; exportou as duas rotas da feature. |
| `curl -i http://localhost:4000/api/v1/health` | HTTP 200; `data.status: "ok"`. |

## Matriz de casos

| Caso | Esperado | Obtido | Estado |
| --- | --- | --- | --- |
| Login → “Esqueci minha senha” | Abre solicitação | Clique no login abriu o formulário com cadeado, título, campo e ações. | Passou no Chrome |
| E-mail vazio, inválido, com espaço ou >160 caracteres | Bloqueio local sem request | Cada caso mostrou seu erro local; a tela permaneceu no formulário. | Passou no Chrome |
| E-mail sintético inexistente | HTTP 200 e mensagem pública | Envio no Chrome levou à confirmação com a `message` genérica; API local retornou 200 e `data: null`. | Passou no Chrome/API |
| E-mail existente | Mesmo 200 e mesma confirmação | Regra confirmada no serviço do backend; não foi enviada solicitação para conta real. | Pendente de teste integrado |
| Repetição de solicitação | HTTP 429 e aviso compartilhado | Após repetição, o Chrome exibiu “Você está temporariamente bloqueado por muitas tentativas. Aguarde antes de tentar novamente.” e permaneceu no formulário. | Passou no Chrome/API |
| E-mail inválido enviado diretamente à API | HTTP 400 | HTTP 400 com erro legado `{ message, timestamp, path }`. | Passou na API |
| 200 → tela do check com mensagem do backend | Check verde e `message` abaixo do título | Chrome mostrou check verde centralizado, título e texto exato da resposta 200. | Passou no Chrome |
| Botão de retorno | Volta ao login | Clique na confirmação voltou ao login. | Passou no Chrome |
| Saída durante o envio | Resposta tardia não redireciona | Clique no botão superior enquanto o envio estava em andamento; o login permaneceu visível após a resposta. | Passou no Chrome |
| Timer de 60 s | Volta ao login automaticamente | Após permanecer na confirmação, o Chrome voltou ao login em cerca de um minuto. | Passou no Chrome |
| Rede indisponível/503 | Toast global e permanência no formulário | Uma tentativa inicial antes da API estar acessível mostrou “Sem conexão. Verifique sua internet.” e permaneceu no formulário; 503 não foi produzido. | Parcial |

## Evidências de API

- `POST http://localhost:3000/api/v1/auth/password-recovery/request` com `{ "email": "nao-existe-20261029@example.invalid" }`: **200**, `message: "Fala, casca-grossa, Acabamos de enviar um link de recuperação para o seu email"`, `data: null`.
- Mesmo endpoint com `{ "email": "invalido" }`: **400**, `message: "email must be an email"`.
- Repetição com o e-mail sintético: **200, 200, 429**; corpo do 429: `message: "Muitas tentativas de recuperação de senha. Tente novamente mais tarde"`.
- `POST http://localhost:4000/api/v1/auth/password-recovery/request` com outro e-mail sintético inexistente: **200** e mesma mensagem pública, validando o proxy usado pelo frontend.
- `getErrorMessage({ status: 429, errorType: "RATE_LIMIT", internalCode: "RATE_LIMITED", domain: "auth" })` retornou: “Você está temporariamente bloqueado por muitas tentativas. Aguarde antes de tentar novamente.”

## Limites e reprodução pendente

O teste no Chrome cobriu o fluxo principal, o 429 e o timer. O navegador não aplicou o override de viewport de 360 × 800 e a captura após esse ajuste expirou; o layout nessa dimensão e o dispositivo iOS/Android permanecem sem comprovação. O e-mail existente não foi exercitado para evitar enviar mensagem a uma conta real. Não foi produzido um 503 controlado.

**Resultado:** checks, contrato HTTP e fluxo principal no Chrome passaram. A cobertura mobile e os casos acima permanecem registrados para validação posterior.
