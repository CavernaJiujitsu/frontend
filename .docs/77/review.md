# Review — Card #77: tela de login de aluno

## Escopo revisado

- Branch: `feat/77-tela-login-aluno`.
- Base: `dev` atualizada de `origin/dev`.
- Arquivos revisados: nova rota de login, estilos, alteração da entrada do onboarding e os artefatos SDD do card.
- Fontes confrontadas: card Trello #77, `plan.md`, `blueprint.md`, `implement.md` e `test.md`.

## Achados

Nenhum achado bloqueante ou recomendação adicional após a refatoração para `react-hook-form`.

## Conformidades verificadas

- O cartão pede interface de login sem backend; a implementação não importa serviço, endpoint, hook de request ou token/sessão.
- `react-hook-form` centraliza valores, validação, erros e o estado de submissão; o formato do e-mail usa a mesma expressão já existente na criação de conta.
- `FormField`, `DefaultButton`, `ErrorToast`, tokens de tema e `localeIcon` são reutilizados; não há duplicação de input, botão ou feedback global.
- A nova tela permanece em `src/app/` e os estilos em `src/styles/onboarding/`; não há lógica não relacionada nas rotas.
- Não há cor hexadecimal nova, dependência, alteração em `ios/`/`android/`, variável de ambiente, segredo, log de credencial, armazenamento de senha ou deep link.
- Não há montagem de URL, interpolação de query, `WebView`, HTML injetado ou `dangerouslySetInnerHTML` no escopo revisado.
- As strings visíveis estão em PT-BR, os imports usam `@/` quando aplicável e o vocabulário do produto permanece consistente.
- A navegação de retorno para onboarding usa `router.replace`; a entrada de login usa a rota pública esperada.
- Os critérios do plano têm evidência em `test.md`: abertura da rota, composição, campos vazios, e-mail inválido, alternância de senha, submissão local, recuperação pendente e retorno ao onboarding.
- `bun run lint` e `bunx tsc --noEmit` passaram, conforme registrado em `test.md`.

## Comparação escopo × entrega

| Requisito do card/plano | Evidência | Situação |
| --- | --- | --- |
| Campos de e-mail e senha | Dois `FormField`s na rota de login. | Entregue |
| Exibir/ocultar senha | `rightAction` com SVG e `secureTextEntry`. | Entregue |
| Validação obrigatória e formato do e-mail | Regras dos `Controller`s e mensagens por campo. | Entregue |
| Estado inválido/submissão | Borda/mensagem de erro e CTA “Entrando...”. | Entregue |
| Criar conta retorna ao onboarding | `router.replace("/onboarding/start")`, exercitado no Web. | Entregue |
| Feedback sem autenticação real | `useErrorStore` e ausência de API. | Entregue |
| Layout responsivo alinhado à referência | Verificação visual Web registrada em `test.md`. | Entregue |
| Nenhuma chamada ao backend | Inspeção do código e fluxo Web, registrados em `test.md`. | Entregue |

## Conclusão

Não bloqueia merge. A entrega está aderente ao ticket e ao plano aprovado.
