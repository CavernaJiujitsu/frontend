# Testes — solicitação de recuperação de senha

## Ambiente e execução

Data: 29/10/2026. Frontend Expo SDK 57. API e Postgres locais iniciados com `docker compose` em `../backend`; nginx em `http://localhost:4000`, URL configurada em `.env` do frontend. Foi necessário criar o banco local `caverna_local`, ausente no volume Docker, para as migrations terminarem. O Expo web iniciou em `http://localhost:8081`. A instalação opcional do React Native DevTools emitiu erro de sandbox, mas Metro permaneceu ativo e o export web funcionou.

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
| Login → “Esqueci minha senha” | Abre solicitação | Código de navegação e rota exportada conferidos; interação não exercitada. | Pendente de teste UI |
| E-mail vazio, inválido, com espaço ou >160 caracteres | Bloqueio local sem request | Regras conferidas no código; interação não exercitada. | Pendente de teste UI |
| E-mail sintético inexistente | HTTP 200 e mensagem pública | HTTP 200 com `message` genérica e `data: null` pela API local. | Passou na API |
| E-mail existente | Mesmo 200 e mesma confirmação | Regra confirmada no serviço do backend; não foi enviada solicitação para conta real. | Pendente de teste integrado |
| Repetição de solicitação | HTTP 429 e aviso compartilhado | HTTP 429 observado após repetição; função compartilhada gerou aviso PT-BR de bloqueio temporário. Exibição do toast não exercitada. | Parcial |
| E-mail inválido enviado diretamente à API | HTTP 400 | HTTP 400 com erro legado `{ message, timestamp, path }`. | Passou na API |
| 200 → tela do check com mensagem do backend | Check verde e `message` abaixo do título | Rota e componentes exportados; navegação e renderização dinâmica não exercitadas. | Pendente de teste UI |
| Botão e timer de 60 s | Volta ao login | Código e limpeza do timer conferidos; tempo real não exercitado. | Pendente de teste UI |
| Rede indisponível/503 | Toast global e permanência no formulário | Caminho `catch`/`reportError` conferido; não exercitado. | Pendente de teste UI |

## Evidências de API

- `POST http://localhost:3000/api/v1/auth/password-recovery/request` com `{ "email": "nao-existe-20261029@example.invalid" }`: **200**, `message: "Fala, casca-grossa, Acabamos de enviar um link de recuperação para o seu email"`, `data: null`.
- Mesmo endpoint com `{ "email": "invalido" }`: **400**, `message: "email must be an email"`.
- Repetição com o e-mail sintético: **200, 200, 429**; corpo do 429: `message: "Muitas tentativas de recuperação de senha. Tente novamente mais tarde"`.
- `POST http://localhost:4000/api/v1/auth/password-recovery/request` com outro e-mail sintético inexistente: **200** e mesma mensagem pública, validando o proxy usado pelo frontend.
- `getErrorMessage({ status: 429, errorType: "RATE_LIMIT", internalCode: "RATE_LIMITED", domain: "auth" })` retornou: “Você está temporariamente bloqueado por muitas tentativas. Aguarde antes de tentar novamente.”

## Limites e reprodução pendente

O navegador de automação ficou sem conexão e a sessão não tinha emulador. O fluxo visual/interativo **não foi validado**; lint, typecheck e export não substituem esse teste. Para concluir:

1. Iniciar `bunx expo start --web` e abrir `/onboarding/login` no navegador.
2. Exercitar validações locais e o envio com e-mail sintético; conferir a request `{ email }`, a tela com check verde e a mensagem da resposta 200.
3. Exercitar 429 em ambiente local e verificar o toast compartilhado sem navegação para confirmação.
4. Conferir botão de retorno, redirecionamento após um minuto e layout de 360 × 800, além de um dispositivo mobile quando disponível.

**Resultado:** checks e contrato HTTP passaram; validação funcional da interface permanece pendente. A demanda ainda não deve ser marcada como pronta.
