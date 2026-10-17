# Testes — Integração dos dados essenciais da Home

## Checks de qualidade

| Comando | Resultado |
| --- | --- |
| `bunx expo lint` | Aprovado (exit code 0). |
| `bunx tsc --noEmit` | Aprovado (exit code 0). |

## Matriz de casos

| Caso | Resultado esperado | Evidência |
| --- | --- | --- |
| Praticante presente | Uma chamada para `/practitioners/:id/home` monta a saudação, aula e cavernas. | Revisão do serviço e tela; validação manual pendente. |
| Localização completa | Latitude e longitude seguem juntas na query. | `getHomeSummary` só espalha ambas quando estão definidas. |
| Localização parcial/ausente | Nenhuma coordenada é enviada. | Mesmo guard do serviço. |
| Sem próxima aula | A mensagem de ausência aparece, sem estado de erro. | Renderização de `nextClass === null`. |
| Sem cavernas | A mensagem de vazio aparece, sem estado de erro. | Renderização de lista vazia. |
| Request pendente | Spinners informam o carregamento de aula e cavernas. | Ramo `homeQuery.isLoading`. |
| Falha de request | Feedback é reportado e botão dispara `refetch`. | Ramo `homeQuery.isError` e `useReportQueryError`. |
| Sem `practitionerId` | A query não executa e a tela não tenta montar URL inválida. | `enabled: Boolean(practitionerId)`. |

## Como reproduzir

1. Inicie o backend com um praticante, uma próxima aula e unidades próximas
   disponíveis.
2. Inicie o frontend e entre na área privada com `practitionerId` salvo na store.
3. Abra `/inicio` e confirme saudação, aula e resumo de cavernas.
4. Repita sem localização; a Home deve responder e exibir o estado vazio de
   cavernas quando o backend não conseguir localizar unidades.
5. Induza erro de rede, confirme o feedback e toque em “Tentar novamente”.
6. Execute os checks de qualidade acima.
