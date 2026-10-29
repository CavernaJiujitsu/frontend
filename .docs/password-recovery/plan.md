# Plano — solicitação de recuperação de senha

## Contexto

Demanda direta do PO, refinada em 25/10/2026. O login ainda informa que a recuperação de senha estará disponível em breve. O backend já oferece `POST /api/v1/auth/password-recovery/request` e devolve a mesma resposta pública para e-mails existentes e inexistentes. Esta etapa cobre a solicitação do link e sua confirmação; a abertura do link e a redefinição da senha ficam para uma etapa posterior.

Referências visuais: [solicitação](https://www.figma.com/design/cElkXHrDPF0phVvMdIyExb/Caverna-jiujitsu?node-id=408-223) e [confirmação](https://www.figma.com/design/cElkXHrDPF0phVvMdIyExb/Caverna-jiujitsu?node-id=408-244).

## Objetivo

Permitir que a pessoa peça um link de recuperação pelo app e veja a mensagem genérica retornada pelo backend em uma tela de confirmação com check verde centralizado. Quando o backend limitar as tentativas, apresentar um aviso compartilhado de bloqueio temporário.

## Requisitos funcionais

1. O botão “Esqueci minha senha” no login navega para uma tela pública de solicitação.
2. A tela mostra o título “Esqueceu sua senha?”, orientação breve, ícone de cadeado laranja, campo de e-mail e botão “Enviar link de recuperação”, conforme o Figma. Oferece volta ao login pelo topo e pelo link abaixo do formulário.
3. O e-mail é obrigatório e validado localmente quanto a formato, ausência de espaços e limite de 160 caracteres. Durante o envio, o botão impede chamadas repetidas.
4. O app faz `POST /api/v1/auth/password-recovery/request` com o corpo exato `{ email: string }`, sem colocar o e-mail na URL. O serviço lê a mensagem do envelope de sucesso do backend.
5. Para qualquer resposta 200 válida, o app navega para uma tela de confirmação. O check verde fica centralizado acima do título “Confira seu e-mail”; a mensagem retornada pelo backend aparece abaixo do título. A mesma experiência vale para e-mail existente e inexistente.
6. A confirmação oferece botão “Voltar para o login” e retorna automaticamente ao login após um minuto, conforme a referência visual. A navegação automática é cancelada se a pessoa sair da tela antes.
7. Respostas não 200 não levam à confirmação. Falhas de rede, validação e indisponibilidade recebem feedback em PT-BR e permitem nova tentativa quando cabível.
8. O tratamento compartilhado de erros reconhece HTTP 429 e mostra que a pessoa está temporariamente bloqueada pelo excesso de requisições e deve aguardar antes de tentar novamente. A tela de solicitação usa esse tratamento, sem duplicar lógica de 429.

## Requisitos não funcionais

- iOS, Android e web: layout responsivo, área segura, teclado apropriado para e-mail e rótulos de acessibilidade.
- Seguir a linguagem visual de `ui-style`: tokens de `@/constants/theme`, `FormField`, `DefaultButton` e elementos do Figma. O check usa verde; os botões principais, laranja.
- Textos de UI em PT-BR. Não persistir nem registrar o e-mail ou a resposta em logs; não enviá-los em parâmetros de rota ou deep link.
- A confirmação não pode revelar se o e-mail existe. Mostrar apenas a mensagem pública do sucesso, nunca dados da conta.

## Regras de negócio e contrato de API

Fontes: `../backend/src/auth/auth.controller.ts`, `dto/request-password-reset.dto.ts`, `password-reset/password-reset.service.ts`, `rate-limit/login-rate-limit.service.ts`, `../backend/src/shared/interceptors/response.interceptor.ts`, `docs/api-contract/prd.md` e `docs/backend-error-contract.md`.

| Operação | Requisição | Resposta/erro observado |
| --- | --- | --- |
| Solicitar link | `POST /api/v1/auth/password-recovery/request`, JSON `{ "email": "aluno@exemplo.com" }` | 200 `{ "message": string, "data": null, "timestamp": string }`. A mensagem é igual para contas existentes e inexistentes. |
| Limite de volume | Mesmo endpoint | HTTP 429. Há limites por IP e por e-mail; o backend decide a janela e a duração do bloqueio. |
| Outras falhas | Mesmo endpoint | 400 para DTO inválido e 503 quando o serviço de limite está indisponível; falha de transporte não tem resposta HTTP. |

O filtro de exceções atual do backend retorna erros como `{ message, timestamp, path }`, embora `docs/backend-error-contract.md` descreva o contrato v1. O normalizador do frontend já aceita esse formato legado e usa o status HTTP para classificar 429. A rota de recuperação **não envia hoje `Retry-After`**; não haverá contagem regressiva nem promessa de uma duração exata no app.

## Decisões de refinamento

| Ponto | Decisão | Origem |
| --- | --- | --- |
| Escopo desta entrega | Solicitação e confirmação do link; redefinição pelo link em outra etapa. | Os passos descritos pelo PO nesta conversa. |
| Texto da confirmação | Mostrar `message` da resposta 200 se for texto não vazio; envelope malformado é falha, não sucesso presumido. | Pedido do PO e envelope do backend. |
| E-mail existente/inexistente | Mesma navegação, ícone e texto em ambos os casos. | Pedido do PO e regra do backend contra enumeração. |
| Rate limit | Reusar `reportError` e o toast global, melhorando a tradução compartilhada para HTTP 429. Sem tempo exato até haver `Retry-After` na rota. | Arquitetura atual do frontend e contrato observado. |
| Retorno ao login | Ação imediata e retorno automático após um minuto. | Referência visual do Figma. |

## Fora de escopo

- Rota `/reset-password`, consumo do token e formulário de nova senha, ainda previstos no plano anterior para uma etapa posterior.
- Personalização com o nome do usuário, autenticação automática e integração do botão “Entrar”.
- Alterações no rate limiter ou no formato das respostas do backend.

## Critérios de aceite

1. Tocar em “Esqueci minha senha” abre a tela de solicitação com o conteúdo e as ações da referência visual.
2. Campo vazio, e-mail inválido, com espaços ou com mais de 160 caracteres não geram request e mostram erro local.
3. E-mail válido gera uma única chamada com o corpo exato `{ email }`; toques repetidos durante o envio não duplicam a chamada.
4. Com HTTP 200 e envelope válido, a confirmação mostra check verde centralizado, título “Confira seu e-mail” e o `message` recebido logo abaixo.
5. O mesmo corpo público 200 para conta existente ou inexistente produz exatamente a mesma confirmação, sem indicadores de existência da conta.
6. O botão volta ao login; após um minuto na tela, o retorno automático também funciona sem disparar após desmontagem.
7. HTTP 429 mantém a pessoa na tela de solicitação e usa o aviso compartilhado de bloqueio temporário; outras falhas têm feedback adequado.
8. O aviso compartilhado de 429 também funciona para outro fluxo que use `reportError`, sem lógica copiada na tela de recuperação.
9. `bun run lint` e `bunx tsc --noEmit` passam; os resultados e a verificação do fluxo ficam em `test.md`.

## Estratégia de teste

Conferir lint e typecheck. Exercitar no app web navegação, validação, loading, confirmação, retorno automático e falhas; verificar layout e navegação em ambiente mobile disponível. Inspecionar requests e respostas contra o backend, incluindo mensagem 200 e 429. Registrar matriz de casos, comandos, evidências e limites em `test.md`.

## Riscos e pendências

- Sem `Retry-After` na resposta 429 da rota de recuperação, o app só pode informar que o bloqueio é temporário. O servidor continua sendo a autoridade para liberar novas tentativas.
- O envio de e-mail pode falhar após o backend aceitar o pedido; por segurança, o backend ainda devolve 200. A UI deve manter a mensagem pública recebida.
- A recuperação completa da senha dependerá da etapa posterior que implementa a rota do link e o formulário de redefinição.
- O conector Figma exigiu reautenticação. O PO forneceu uma imagem das duas telas e aprovou a implementação por essa referência; o conector deixou de ser dependência desta entrega.

**Status:** aprovado pelo PO em 25/10/2026; blueprint e código autorizados após aprovação do blueprint.
