# Blueprint — solicitação de recuperação de senha

## Inventário e reuso

| Peça | Onde existe | Uso nesta entrega |
| --- | --- | --- |
| Login e entrada do fluxo | `src/app/onboarding/(login)/login.tsx` | Trocar o aviso “em breve” pela navegação à solicitação. |
| Rotas públicas | `src/app/` e `src/app/_layout.tsx` | Criar uma rota para solicitar o link e outra para a confirmação; o `Stack` raiz já recebe novas rotas. |
| Layout e insets | `src/components/screen-layout/screen-layout.tsx` | Envolver ambas as telas, sem repetir padding de página. |
| Campo e botão | `src/components/customized/form-field/form-field.tsx` e `src/components/customized/default-button.tsx` | Reusar no formulário e no retorno ao login. |
| Formulário | `react-hook-form` no login | Reusar o padrão `Controller`/`useForm`, com regras específicas do DTO. |
| Tema e estilos | `src/constants/theme.ts`, `src/styles/onboarding/login.styles.ts` | Reusar fundo, laranja, turquesa e tipografia; adicionar verde de sucesso ao tema se não houver token. Estilos novos em `src/styles/onboarding/`. |
| Cliente e endpoints | `src/api/bootstrap/axios-bootstrap.ts`, `src/api/endpoints/routes.ts` | Adicionar rota de recuperação e service fino usando o cliente compartilhado. |
| Envelope de sucesso | `src/api/types/envelope.ts` | Ler `message` com validação de texto não vazio, sem usar `data` como confirmação. |
| Erros compartilhados | `src/utils/normalize-api-error.ts`, `src/constants/error-messages.ts`, `src/store/useErrorStore.ts`, `ErrorToast` no layout raiz | Manter a classificação por HTTP 429 e melhorar a mensagem PT-BR usada por `reportError` em qualquer tela. |
| Ícones | `react-native-svg` já instalado; imagem de referência enviada pelo PO | Compor cadeado e check vetoriais a partir da imagem aprovada, sem nova biblioteca. |

## Contrato confirmado

- Backend: `AuthController.requestPasswordReset` em `POST /api/v1/auth/password-recovery/request`.
- DTO: apenas `email`, sem espaços, formato de e-mail, máximo de 160 caracteres.
- Sucesso: HTTP 200 com envelope `{ message, data: null, timestamp }`; a mensagem pública é a mesma para conta existente e inexistente.
- Volume: HTTP 429, decidido pelo backend por IP e por e-mail. A rota não envia `Retry-After` atualmente; a UI não exibirá duração ou contagem regressiva.
- O backend usa hoje erro legado `{ message, timestamp, path }`; `normalizeApiError` já suporta esse formato e classifica o 429 pelo status.

## Alternativas avaliadas

| Tema | Alternativas | Escolha e motivo |
| --- | --- | --- |
| Mensagem de sucesso | Texto fixo no app ou `message` do backend | Usar `message` validada: é o contrato e o pedido do PO. |
| Mostrar 429 | Estado local exclusivo ou toast compartilhado | Reusar `reportError` e dicionário global: atende outros fluxos sem copiar lógica. |
| Transporte da mensagem à confirmação | Parâmetro de rota ou estado transitório | Estado transitório fora da URL: evita expor texto no link/histórico e mantém uma confirmação idêntica para contas existentes e inexistentes. Se a rota for aberta sem estado válido, voltar à solicitação. |
| Layout | Duplicar `SafeAreaView` do login ou `ScreenLayout` | Usar `ScreenLayout`, que concentra os insets e tokens da aplicação. |

## Desenho final

| Arquivo | Papel |
| --- | --- |
| `src/app/onboarding/(login)/login.tsx` | Navegar para a tela de solicitação. |
| `src/app/onboarding/(password-recovery)/forgot-password.tsx` | Formulário, validação local, loading, chamada do service, `reportError` em falhas. |
| `src/app/onboarding/(password-recovery)/check-email.tsx` | Check verde, título, mensagem pública, botão de retorno e temporizador de um minuto com limpeza no unmount. |
| `src/api/endpoints/routes.ts` | Rota exata do backend. |
| `src/api/services/password-recovery.service.ts` | Enviar `{ email }` e validar `message` do envelope 200. |
| `src/store/usePasswordRecoveryStore.ts` | Estado transitório da mensagem de sucesso, sem persistência. |
| `src/constants/error-messages.ts` | Mensagem compartilhada de bloqueio temporário para HTTP 429. |
| `src/constants/theme.ts` | Token verde de sucesso usado pelo check, caso o vetor exija cor dinâmica. |
| `src/styles/onboarding/password-recovery.styles.ts` | Layout responsivo das duas telas, centralização, hierarquia e ações. |
| `src/components/customized/password-recovery-icons.tsx` | Ícones vetoriais de cadeado e check, baseados na imagem fornecida pelo PO. |

## Estados e navegação

`/onboarding/login` → `/onboarding/forgot-password` → `/onboarding/check-email` → `/onboarding/login`.

- Solicitação: inicial, validação local, envio bloqueado durante request, erro 400/429/503/rede via aviso global, sucesso 200.
- Confirmação: mensagem do backend, botão de retorno e timer de 60 segundos; acesso direto sem mensagem retorna à solicitação.
- A navegação da confirmação será feita com `replace` para evitar retornar a um formulário preenchido. O botão e o timer também usarão `replace` para o login.

## Duplicidades evitadas e limites

- Sem novo componente de input, botão ou toast; sem novo normalizador de erros.
- Sem mock de API: o service real já pode consumir o backend. Testes de estados poderão usar interceptação local de rede.
- O PO enviou a imagem com as duas telas e autorizou a implementação a partir dela. O conector Figma não é dependência da entrega.
- Esta entrega não cobre a abertura do link e a redefinição da senha.

**Status:** aprovado pelo PO em 29/10/2026 para implementação.
