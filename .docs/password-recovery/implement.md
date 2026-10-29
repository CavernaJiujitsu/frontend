# Implementação — solicitação de recuperação de senha

## Estado

Implementação de código concluída em 29/10/2026 conforme o plano e o blueprint aprovados. O fluxo foi exercitado no Expo web com a API local; consultar `test.md` para evidências e limites de cobertura.

## O que foi feito

| Área | Arquivos | Resultado |
| --- | --- | --- |
| Entrada e navegação | `src/app/onboarding/(login)/login.tsx`, `src/app/onboarding/(password-recovery)/forgot-password.tsx`, `check-email.tsx` | “Esqueci minha senha” abre o formulário. A resposta 200 leva à confirmação; botão e timer de 60 segundos voltam ao login. |
| Integração | `src/api/endpoints/routes.ts`, `src/api/services/password-recovery.service.ts` | Chamada `POST /api/v1/auth/password-recovery/request` com apenas `{ email }`; sucesso exige HTTP 200 e `message` não vazia. |
| Estado transitório | `src/store/usePasswordRecoveryStore.ts` | A mensagem pública passa entre telas em memória, sem URL ou persistência. Acesso direto à confirmação sem mensagem retorna à solicitação. |
| UI | `src/components/customized/password-recovery-icons.tsx`, `src/styles/onboarding/password-recovery.styles.ts`, `src/constants/theme.ts` | Cadeado laranja, check verde e layout responsivo baseados na imagem fornecida pelo PO. Reuso de `ScreenLayout`, `FormField` e `DefaultButton`. |
| Campo de e-mail | `src/components/customized/form-field/form-field.tsx` | Suporte opcional a `autoComplete` e `autoCorrect`; a nova tela usa preenchimento de e-mail e desativa correção automática. |
| Erro compartilhado | `src/constants/error-messages.ts` | Tradução global de HTTP 429 avisa bloqueio temporário por excesso de tentativas. `reportError` e o toast já existentes são reutilizados. |

## Decisões e desvios do blueprint

- O PO forneceu imagem das duas telas e autorizou a implementação por essa referência. Os ícones foram compostos com `react-native-svg`, já instalado, sem dependência nova nem necessidade do conector Figma.
- O bloqueio de novas solicitações continua sob autoridade do backend. A resposta 429 da rota não fornece duração confiável, então a UI não mostra contagem regressiva.
- O serviço falha se um sucesso não trouxer `message` válida, evitando mostrar uma confirmação inventada.
- A confirmação usa guarda de saída para que limpar a mensagem no retorno ao login não dispare redirecionamento concorrente à solicitação.
- A revisão antes do PR encontrou uma corrida ao sair do formulário durante o envio. A tela agora invalida a resposta pendente ao perder foco ou ao voltar ao login, evitando navegação e toast tardios.

## Validação executada

- `bun run lint`: passou.
- `bunx tsc --noEmit`: passou após a geração de rotas tipadas pelo Expo.
- `bunx expo export --platform web --output-dir /tmp/password-recovery-web`: passou e exportou `/onboarding/forgot-password` e `/onboarding/check-email`.
- `git diff --check`: passou.
- API local: HTTP 200 com mensagem pública para e-mail sintético inexistente; HTTP 400 para e-mail inválido; HTTP 429 após repetição. A rota via proxy configurado em `.env` (`localhost:4000`) respondeu 200.
- Expo web no Chrome: navegação desde o login, validações locais, confirmação com mensagem do backend, retorno manual, timer de 60 segundos, toast 429 e saída durante o envio passaram.

## Pendências

- A verificação em dispositivo iOS/Android e o viewport de 360 × 800 não foram concluídos; a automação de viewport no Chrome falhou. O resultado está registrado em `test.md`.
- A abertura do link e redefinição da senha pertencem à etapa posterior prevista no plano.
- `bun.lock` já estava modificado antes desta implementação e não foi alterado intencionalmente por ela.
