# Review — integração da tela de login com a API

## Achados

| ID | Severidade | Categoria | Achado | Onde | Recomendação |
|---|---|---|---|---|---|
| R78-01 | 🔵 informativo | Persistência | O token continua no estado persistido legado e a nova sessão fica em memória; a API usa a sessão quando disponível e faz fallback para o legado. | `src/store/useAppStore.ts`, `src/store/useSessionStore.ts`, `src/api/bootstrap/axios-bootstrap.ts` | Unificar os stores em uma tarefa futura, evitando mudança ampla durante o projeto acadêmico. |

## Conformidades verificadas

- O login usa o endpoint e o contrato de resposta do backend, sem enviar campos extras.
- A senha não é registrada em logs nem incluída na resposta do cliente.
- O token é enviado via header `Authorization` e removido dos dois stores ao receber `401`.
- Não há montagem de URL com entrada do usuário, HTML injetado ou WebView remoto nessa alteração.
- A tela reutiliza `FormField`, `DefaultButton` e os tokens existentes.
- Validação estática e testes unitários do frontend foram executados após a integração.

## Conclusão

Não há achado bloqueador para o escopo acadêmico. O item informativo de unificação de sessão pode ficar para uma refatoração posterior.
