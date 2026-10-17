# Testes — Card #77: tela de login de aluno

## Ambiente

- Projeto: `frontend/` com Bun e Expo SDK 57.
- Aplicação executada localmente em Web com `bunx expo start --web --offline --port 8084`.
- Navegador: Chrome, em viewport desktop; a composição centralizada responsiva foi observada visualmente.
- Backend: não iniciado e nenhum `curl` executado, pois o escopo aprovado determina explicitamente que a tela não consome API.
- Runner automatizado: não configurado. Embora `cypress` conste nas dependências, não há arquivo de configuração ou specs no repositório.

## Checks do projeto

| Comando | Resultado |
| --- | --- |
| `bun run lint` | Aprovado (exit code 0). |
| `bunx tsc --noEmit` | Aprovado (exit code 0). |
| `bunx expo-doctor` | Não executado: não houve alteração de dependências ou de configuração nativa/app. |

Após a refatoração para `react-hook-form`, `bun run lint` e `bunx tsc --noEmit` foram executados novamente e permaneceram aprovados.

## Matriz de validação funcional

| Caso | Esperado | Obtido | Resultado |
| --- | --- | --- | --- |
| Entrada pelo onboarding | “Já tenho conta” abre login. | A ação abriu `/onboarding/login` e mostrou o layout de login. | Aprovado |
| Composição visual | Ícone, cabeçalho, campos, recuperação, CTA, divisor e criação de conta visíveis. | Todos os elementos ficaram visíveis, centralizados e alinhados ao design de referência. | Aprovado |
| Campos vazios | Ao tocar em “Entrar”, erros aparecem junto a e-mail e senha. | Bordas de erro e as mensagens “Informe seu e-mail.” e “Informe sua senha.” foram exibidas. | Aprovado |
| E-mail inválido | Formato inválido é rejeitado junto ao campo. | “email-invalido” gerou “E-mail inválido.”; a senha preenchida não recebeu erro. | Aprovado |
| Visibilidade da senha | Controle altera máscara sem perder valor. | O ícone exibiu o valor de teste `senha-teste`; o estado foi preservado. | Aprovado |
| Envio válido | Estado temporário e feedback de integração pendente, sem API. | Botão exibiu “Entrando...” desabilitado e depois o toast “A autenticação será conectada em uma tarefa separada.” | Aprovado |
| Recuperação de senha | Link informa indisponibilidade e não navega. | Toast “A recuperação de senha será disponibilizada em breve.” foi exibido na mesma tela. | Aprovado |
| Retorno ao onboarding | “Criar conta” retorna à entrada por `replace`. | A tela inicial com CTAs “Criar conta” e “Já tenho conta” foi exibida. | Aprovado |
| Rede/API | Nenhuma chamada de autenticação é feita. | A implementação não importa serviços/endpoints/hooks de API; o fluxo web não apresentou request de autenticação nem erro de rede. | Aprovado |

## Logs do app

O bundle Web foi concluído sem erro. Foram observados somente avisos não introduzidos pela tela:

- `shadow* style props are deprecated. Use boxShadow.`
- `useNativeDriver is not supported` no ambiente Web.
- `pointerEvents is deprecated. Use style.pointerEvents.`

Eles não bloquearam o carregamento ou o fluxo testado e não são originados dos arquivos do login.

## Como reproduzir

1. Em `frontend/`, executar `bunx expo start --web`.
2. Na tela inicial, tocar em “Já tenho conta”.
3. Testar “Entrar” com ambos os campos vazios e com e-mail sem `@`/domínio.
4. Preencher `aluno@exemplo.com` e uma senha qualquer, alternar a visibilidade e tocar em “Entrar”.
5. Conferir o feedback de autenticação pendente, acionar “Esqueci minha senha” e conferir seu feedback.
6. Tocar em “Criar conta” e verificar o retorno à tela inicial do onboarding.

## Conclusão

Todos os casos aplicáveis ao card passaram. A integração HTTP e os cenários de erro de backend ficaram fora de cobertura por serem explicitamente fora de escopo desta tarefa.
