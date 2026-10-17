---
name: feature-plan
description: Planeja e refina requisitos de uma feature, tela ou fluxo do app Expo (frontend Caverna) antes de qualquer código (SDD) — entende o pedido, consulta as docs de produto em `docs/`, define escopo, critérios de aceite, fora de escopo, riscos e perguntas abertas, e grava o plano em `.docs/<slug>/plan.md` para aprovação. Use quando o usuário pedir para planejar, refinar requisitos, 'plan the feature', 'quero implementar X' ou 'ticket novo', antes de implementar; também é a primeira etapa do fluxo do trello-ticket. NÃO use para implementar, testar, revisar código ou abrir PR.
metadata:
  short-description: Planejamento e refinamento de requisitos
---

# Feature Plan (planejamento e refinamento)

Antes de planejar, leia o `AGENTS.md` da raiz (convenções, comandos, estrutura do app) e as docs de produto relevantes em `docs/` — PRDs por área (`docs/api-contract/prd.md`, `docs/bottom-menu/prd.md`, ...) e o contrato de erro (`docs/backend-error-contract.md`). Quando a feature consome API, leia também os DTOs/controllers correspondentes em `../backend/src/<recurso>/` — o backend é a fonte da verdade do contrato. Elas são a fonte de verdade — o plano não pode contrariá-las sem registrar a divergência.

## Passos

1. **Identifique a demanda e o slug.** Card de Trello/Jira → slug = id do card (ex.: `44`) ou nome curto equivalente; demanda direta → nome curto da feature/branch (ex.: `home-essentials`). Se houver MCP do Trello/Jira disponível, leia o card; senão, peça o link/descrição ao usuário. Nunca invente requisito que não esteja no card, nas docs ou na conversa.
2. **Entenda o terreno.** Leia as rotas (`src/app/`), componentes, serviços (`src/api/services/`) e estilos das áreas citadas — só o suficiente para planejar (o mapeamento profundo de reuso é da skill `feature-implementation`). Não escreva código nesta etapa.
3. **Refine com o usuário o que estiver ambíguo.** Agrupe as dúvidas, apresente opções com recomendação e registre as respostas. Pontos que costumam faltar numa tela: ponto de entrada e navegação de saída, dados exibidos/enviados e origem, estados obrigatórios (loading/empty/error/success), validações, plataformas (iOS/Android/Web), permissões (ex.: localização) e acessibilidade básica. Requisito ambíguo não avança.
4. **Escreva `.docs/<slug>/plan.md`** (crie o diretório) com as seções: contexto, objetivo, requisitos funcionais, requisitos não funcionais, regras de negócio (citando `docs/`), contrato de API consumido, decisões de refinamento (tabela), fora de escopo, critérios de aceite numerados, estratégia de teste e riscos/pendências.
5. **Peça aprovação explícita** mostrando um resumo do plano. Só depois de aprovado o próximo passo é a skill `$feature-implementation`.

## Regras

- Docs em português; comentários de código em inglês; strings visíveis ao usuário em PT-BR; vocabulário do produto: "caverna" (nunca "academia").
- Valores de enum vindos do backend sempre como estão (em inglês: `SCHEDULED`, `PENDING`, ...).
- "Sem card" é um estado válido — registre "demanda direta do PO" no plano.
- Critério de aceite precisa ser verificável (dá para exercitar o fluxo no app ou conferir a request/estado resultante).
