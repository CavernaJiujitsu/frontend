# Review — cavernas privadas e agenda

## Achados

| ID | Severidade | Categoria | Achado | Onde | Recomendação |
| --- | --- | --- | --- | --- | --- |
| R-01 | 🟡 médio | Validação | O fluxo visual autenticado não foi exercitado no ambiente local porque o sandbox bloqueou o socket do Expo Web. | test.md | Validar a branch em preview/dev com uma conta autenticada antes do merge. |
| R-02 | 🔵 informativo | Baseline | Lint/typecheck apontam problemas preexistentes: import dinâmico de vconsole sem resolução e rota dinâmica antiga de trilha fora dos tipos gerados. | src/components/debug-console.web.tsx; src/app/(private)/trilha/index.tsx | Tratar em ticket separado; não são introduzidos por esta branch. |

## Conformidades verificadas

- A nova rota está em src/app e o componente compartilhado está fora de src/app.
- A agenda foi reutilizada entre onboarding e área privada, sem duplicação de lógica.
- A rota valida o formato UUID antes de consultar a API.
- Os serviços mantêm os nomes do contrato, incluindo caveUnitId e practitionerId.
- Estados de loading, erro, lista vazia e reserva estão tratados.
- Não foram encontrados segredos, logs sensíveis, HTML injetado ou WebView.
- Não foram adicionadas dependências, alterações em ios/android ou mudanças de backend.
- Strings visíveis permanecem em PT-BR e o vocabulário usa caverna/cavernas.

## Conclusão

Não há achado de segurança ou divergência funcional que bloqueie a abertura do PR. O merge deve aguardar a validação visual do fluxo autenticado em preview/dev e considerar os erros de baseline já documentados.
