# Contribuindo para o Caverna Jiu-Jitsu

Este guia é compartilhado pela equipe. Configurações pessoais do Codex, tokens e notas locais de cada desenvolvedor ficam fora deste repositório.

## Referências

- [Quadro Trello](https://trello.com/b/Pezc5Kac/projeto-jiu-jitsu): escopo e critérios de aceite do card.
- [Figma](https://www.figma.com/design/cElkXHrDPF0phVvMdIyExb/Caverna-jiujitsu?node-id=0-1&p=f&t=WWOtsAyiJvxMGt8a-0): referência visual quando aplicável.
- [dbdiagram](https://dbdiagram.io/d/jiu-6aa09269ff72c756bc121237): visão do banco; conferir com a documentação canônica do backend.
- Repositórios: [backend](https://github.com/CavernaJiujitsu/backend) e [frontend](https://github.com/CavernaJiujitsu/frontend).

## Fluxo por card

1. Antes de trabalhar, leia o card completo, `AGENTS.md`, os documentos relevantes e os PRs/branches atuais. Se outra pessoa já iniciou o card, alinhe a continuação com o responsável; não sobrescreva sua branch.
2. Confirme a base atual no GitHub. Neste ciclo a equipe integra features em `dev` e concentra a publicação em `main` no fim da sprint, conforme [decisão registrada por Gabriel](https://github.com/CavernaJiujitsu/backend/pull/16#issuecomment-6590858988). Reconfirme esse acordo quando o ciclo mudar.
3. Use uma branch por card e por repositório. Siga o fluxo SDD e os artefatos `.docs/<slug>/` exigidos por `AGENTS.md`. Não declare concluído sem testes registrados.
4. Abra PR para `dev`, com link do card, decisões, evidências, riscos e dependências de PRs no outro repositório. Confira o diff contra `dev` antes de pedir revisão. Não use force push nem altere branch/PR de outra pessoa sem coordenação.
5. Revise e resolva checks antes do merge. A passagem de `dev` para `main` é uma decisão de release; confira migrations, compatibilidade backend/frontend e impacto de deploy antes de integrar.

## Chats e ambientes

Um chat novo pode começar apenas com o número do card e o repositório escolhido. O agente deve consultar Trello, GitHub e `.docs/` para reconstruir o estado; conversas antigas e checkouts locais podem estar desatualizados. Registre no PR ou nos artefatos do card o que foi feito, checks, bloqueios e próximo passo. Se uma integração privada não estiver disponível, informe o bloqueio sem inventar requisitos.

Não inclua segredos, `.env`, credenciais, dados reais de alunos ou configurações individuais do ambiente em commits ou PRs.

## Verificações e deploy deste repositório

O CI atual valida PRs para `dev` e `main`. O preview da Azure Static Web Apps é disparado por PR para `main`, e push em `main` publica a aplicação; confirme os workflows atuais antes de uma release. Confira o contrato nos DTOs e controllers do backend antes de alterar serviços de API.
