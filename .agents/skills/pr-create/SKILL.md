---
name: pr-create
description: Prepara a abertura do PR no repo do app — roda ou atualiza o review, compara tudo que está em `.docs/<slug>/` com o combinado (`plan.md` e card do Trello/Jira), levanta uma sequência de perguntas quando algo não bate e monta o corpo do PR (o que foi feito, por quê, arquivos tocados e como testar) antes de criar. Use quando o usuário disser 'abrir PR', 'criar PR', 'pr create' ou 'subir pro review', depois de uma feature já testada. NÃO use para implementar, testar ou revisar do zero.
metadata:
  short-description: Comparação com o ticket + PR
---

# PR Create (confronto escopo × entrega + PR)

## Passos

1. **Contexto**: identifique o slug (`.docs/<slug>/`) e a branch (`git branch --show-current`). Confirme que `plan.md` e `test.md` existem. Se o `review.md` não existir ou estiver desatualizado (o código mudou depois dele), rode antes a skill `$feature-review`.
2. **Confronte o que foi entregue com o que foi combinado** — é o coração desta skill:
   - Liste os requisitos e critérios de aceite do `plan.md` e confirme no código/evidências de teste o que foi entregue.
   - Se houver card (Trello/Jira via MCP, ou link/conteúdo colado pelo usuário), compare também com o card.
   - Divergências possíveis: prometido e não entregue; extra feito fora do plano; decisão não registrada; critério de aceite sem comprovação de teste.
3. **Divergiu? Pare e pergunte.** Monte a lista de perguntas com contexto (o que o card/plano diz, o que a branch tem, o que precisa decidir) e aguarde as respostas. Não abra o PR com a comparação em aberto.
4. **Monte o corpo do PR**:
   - **Contexto/objetivo** — problema que resolve, link do card se houver;
   - **O que mudou** — agrupado por área (tela/rota, componentes, serviços, estilos);
   - **Por quê** — decisões e trade-offs vindos do blueprint/implement;
   - **Arquivos tocados** — tabela por área (use `git diff --stat`);
   - **Como testar** — passos exatos: `bun install`, subir o backend local se necessário, `bunx expo start` (+ rota/aba até a tela) e o que observar em cada caso;
   - **Evidências de teste** — checks do `test.md` (lint/tsc) e validações feitas;
   - **Riscos/limitações e pendências** — do `review.md`/`implement.md`;
   - **Checklist**: lint, tsc, expo-doctor (se aplicável), contrato do backend conferido, PRD atualizado (se o padrão mudou), nenhum segredo em env pública.
5. **Crie o PR**: `gh pr create --base main` (padrão atual do repo — as branches nascem de `main` e é o que dispara o preview da Azure SWA; se a branch vier de outra linha, confirme a base com o usuário). Título/commits no padrão do repo (`feat:`, `fix:`, `chore:`...). Mostre o corpo antes para aprovação se o usuário preferir. Nunca force-push; se a branch não estiver pushada, avise e peça para subir.
6. Retorne o link do PR e, se ficaram perguntas pendentes, repita-as de forma objetiva.
