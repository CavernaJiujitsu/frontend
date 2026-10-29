# Revisão — solicitação de recuperação de senha

## Escopo

Revisão da branch `feat/password-recovery` contra `origin/main` em 29/10/2026, após correção da navegação assíncrona e teste do fluxo no Expo web com API local.

## Achados

| ID | Severidade | Categoria | Achado | Onde | Recomendação |
| --- | --- | --- | --- | --- | --- |
| R1 | 🔵 informativo | Cobertura de plataformas | O fluxo principal, validações, confirmação, retorno manual, 429 e saída durante envio passaram no Chrome. O viewport de 360 × 800 não pôde ser aplicado pela automação, e não havia dispositivo iOS/Android nesta sessão. | `.docs/password-recovery/test.md` | Conferir o layout e a navegação em dispositivo na homologação do PR. |
| R2 | ✅ resolvido | Navegação assíncrona | Ao sair do formulário, a geração da requisição é invalidada. Uma resposta tardia não grava a mensagem, não abre a confirmação nem mostra erro na tela abandonada; o caso passou no Chrome. | `src/app/onboarding/(password-recovery)/forgot-password.tsx` | Nenhuma ação restante. |
| R3 | ✅ resolvido | Artefato SDD | `plan.md` agora registra a imagem fornecida pelo PO e a dispensa do conector Figma para esta entrega. | `.docs/password-recovery/plan.md` | Nenhuma ação restante. |

## Conformidades verificadas

- Serviço usa a rota, o método e o corpo `{ email }` do DTO/controller do backend. O envelope 200 exige `message` não vazia antes de confirmar.
- Solicitação existente e inexistente dependem da mesma mensagem pública do backend; a UI não recebe indicador de existência da conta.
- Erro 429 é classificado pelo normalizador compartilhado e apresentado via `reportError`/toast global; 400/503/rede permanecem no formulário.
- E-mail é validado localmente quanto a obrigatoriedade, espaços, formato e 160 caracteres. O botão bloqueia toques repetidos durante o envio.
- Mensagem de sucesso permanece em memória e fora da URL. Não foram encontrados logs de e-mail, token, senha ou dados sensíveis nos arquivos da feature; nenhuma alteração em `.env`, `ios/` ou `android/`.
- Nenhuma montagem insegura de URL/HTML, WebView ou `dangerouslySetInnerHTML` encontrada no diff.
- Rotas em `src/app/`, estilos em `src/styles/onboarding/`, uso de `ScreenLayout`, `FormField`, `DefaultButton`, tokens de tema, imports `@/` e textos de UI em PT-BR. Nenhuma dependência nova.
- Não há listas ou enums nesta entrega; verificações de `key` estável e enum não se aplicam.

## Conclusão

O desvio de navegação foi corrigido e o fluxo principal recebeu evidência funcional. A cobertura em dispositivo e no viewport mobile específico permanece como limite de homologação registrado em R1.
