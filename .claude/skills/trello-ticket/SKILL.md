---
name: trello-ticket
description: Executa o fluxo SDD ponta a ponta de um ticket (Trello/Jira) no app Expo — concepção, planejamento (feature-plan), blueprint e implementação (feature-implementation) e testes (feature-teste), gravando os artefatos em `.docs/<slug>/`. Use quando o usuário disser 'pega esse ticket', 'trello ticket', 'implementa essa tarefa do board', 'fluxo completo' ou colar um link de card com intenção de implementar. NÃO crie PR nem faça review neste fluxo — depois use as skills feature-review e pr-create.
metadata:
  short-description: Fluxo completo de um card
---

# Trello Ticket (fluxo ponta a ponta)

Conduza a demanda do card até os testes, invocando as skills na ordem. Você é o maestro: cada etapa tem seu artefato e sua pausa de aprovação.

## 1. Concepção

- Obtenha o card: se houver MCP do Trello/Jira, busque pelo link/id/board; senão, peça o link ou o conteúdo.
- Defina o slug (id do card, ex.: `44` — as branches do repo seguem `feat/<id>-<descrição>`, ex.: `feat/44-estado-vazio-academias`).
- Confirme o entendimento com o usuário em poucas linhas (o que o card pede, o que está fora, o que está ambíguo) — antes de criar qualquer arquivo.

## 2. Planejamento — skill `$feature-plan`

Execute o fluxo da skill `$feature-plan` para o slug (ela lê o card + `docs/`, refina dúvidas com o usuário e gera `.docs/<slug>/plan.md`). **Pare para a aprovação do plano.**

## 3. Blueprint + implementação — skill `$feature-implementation`

Execute o fluxo da skill `$feature-implementation` (inventário/reuso → `.docs/<slug>/blueprint.md` → aprovação → código → `.docs/<slug>/implement.md`). **Pare para a aprovação do blueprint.**

## 4. Testes — skill `$feature-teste`

Execute o fluxo da skill `$feature-teste` (checks do projeto + fluxo real no app + curl na API consumida; `.docs/<slug>/test.md`). A demanda só está concluída quando o `test.md` registrar tudo verde.

## Encerramento

Resuma: artefatos gerados, comandos/resultados, pendências e o que ficou fora. Os próximos passos **não** fazem parte deste fluxo — `$feature-review` quando o usuário pedir, e depois `$pr-create`.

## Regras de condução

- Nunca pule as pausas de aprovação (plano e blueprint) — aprovar uma etapa não autoriza pular as seguintes.
- Bloqueio no meio do caminho → pare e pergunte; não invente requisito nem "siga reto".
- Não expanda o escopo do card por conta própria; ideias extras viram observação para o usuário.
