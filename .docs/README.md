# `.docs` — artefatos do fluxo SDD

Um diretório por demanda: `.docs/<slug>/`, onde o slug é o id do card no Trello/Jira (ex.: `44`) ou um nome curto da feature quando a demanda é direta (ex.: `home-essentials`).

| Arquivo | Quem gera | Conteúdo |
| --- | --- | --- |
| `plan.md` | skill `feature-plan` | contexto, requisitos refinados, decisões, critérios de aceite, fora de escopo |
| `blueprint.md` | skill `feature-implementation` (etapa 1) | inventário do que já existe, reuso, alternativas avaliadas, desenho (arquivos/componentes/contrato), duplicidades evitadas |
| `implement.md` | skill `feature-implementation` (etapa 2) | o que foi feito, arquivos, decisões/desvios, validação, pendências |
| `test.md` | skill `feature-teste` | checks + resultados, matriz de casos, evidências do fluxo/curl, como reproduzir |
| `review.md` | skill `feature-review` | achados em tabela (segurança, URLs/injeção, padrão, duplicidades, tipos/formulários) + conformidades |

Regras:

- Docs em português; comentários de código em inglês; strings de UI em PT-BR.
- Não comece a codar sem `plan.md` aprovado; não declare pronto sem `test.md`.
- `review.md` é read-only — revisão não corrige código.
