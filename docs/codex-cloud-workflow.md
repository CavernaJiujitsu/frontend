# Desenvolvimento do Caverna Jiu-Jitsu no Codex em nuvem

Este documento é o ponto de entrada para chats novos. Serve ao frontend e ao backend; o backend mantém uma cópia equivalente para que cada repositório funcione de forma independente. Não substitui `AGENTS.md`, os documentos de domínio nem o conteúdo atualizado dos cards.

## Referências

| Fonte | Link | Uso |
| --- | --- | --- |
| Trello | [Projeto Jiu-Jitsu](https://trello.com/b/Pezc5Kac/projeto-jiu-jitsu) | Escopo, critérios de aceite, dependências e status de cada card. Abrir o card específico antes de planejar. |
| Figma | [Caverna Jiu-Jitsu](https://www.figma.com/design/cElkXHrDPF0phVvMdIyExb/Caverna-jiujitsu?node-id=0-1&p=f&t=WWOtsAyiJvxMGt8a-0) | Referência visual, sobretudo para o frontend. Confirmar a tela e a versão aplicáveis ao card. |
| dbdiagram | [Modelo do banco](https://dbdiagram.io/d/jiu-6aa09269ff72c756bc121237) | Visão compartilhada do modelo. Conferir contra `backend/docs/schema.dbml` e `backend/docs/domain-model.md` antes de mudar o schema. |
| GitHub | [Backend](https://github.com/CavernaJiujitsu/backend) · [Frontend](https://github.com/CavernaJiujitsu/frontend) | Estado atual do código, branches, PRs e verificações. |

Links não concedem acesso a conteúdo privado: usar a integração conectada ao chat ou pedir o conteúdo do card/tela quando o acesso falhar. Não deduzir requisitos apenas pelo título do card. Em divergência entre card, Figma, diagrama, docs e código, registrar a diferença no plano e obter decisão de produto antes de alterar contrato ou regra. No backend, `docs/business-rules.md` e `docs/schema.dbml` continuam sendo as referências canônicas do domínio até uma mudança aprovada.

## Um card, um chat, uma branch

1. Abrir um chat por card e vinculá-lo ao repositório correspondente. Para trabalho em ambos os repositórios, relacionar os dois PRs e registrar a dependência; não misturar histórico Git de backend e frontend.
2. No início, ler `AGENTS.md`, este documento e os documentos de produto relevantes. Consultar o card completo, comentários e anexos; conferir PRs e branches abertos por outras pessoas. Verificar se o card já está em desenvolvimento ou entregue antes de criar trabalho duplicado.
3. Conferir no GitHub o commit atual da branch base e suas regras. Usar o fluxo de integração vigente do repositório: o backend tem CI em PRs para `dev` e deploy ao enviar para `main`; o frontend tem CI em `dev` e `main`, mas o preview Azure do PR usa `main`. Se a base não estiver clara, definir isso no plano antes de abrir o PR. Não assumir que a cópia local da nuvem está atualizada.
4. Criar uma branch exclusiva do card a partir da base confirmada (`feat/<numero>-<resumo>` ou `fix/<numero>-<resumo>`). Não reaproveitar branch de outro card, não fazer force push e não escrever diretamente em `main` ou `dev`.
5. Seguir as skills e `.docs/<slug>/`: plano com critérios de aceite e fora de escopo; aprovação do plano; blueprint e aprovação; implementação; testes registrados em `test.md`; revisão; PR. Aprovações de cards anteriores não aprovam o card atual.
6. Antes do PR, comparar a branch com a base atual, atualizar a branch sem sobrescrever trabalho alheio, executar os checks aplicáveis e confirmar contrato entre backend e frontend. No PR, incluir link do card, decisões, evidências, limitações e dependência de outro PR. Pedir revisão humana para contrato, migration, autenticação, dados pessoais ou publicação.
7. Só integrar após revisão e checks exigidos. Confirmar o SHA/base imediatamente antes do merge. Como `main` pode disparar publicação, tratar o merge como etapa distinta da criação do PR. Atualizar status do card apenas depois de verificar o resultado.

## Segurança e ambientes

- Nunca colocar token, senha, `.env`, dados reais de alunos ou credencial de banco no chat, no Git ou em artefatos `.docs/`. Usar `.env.example` para nomes de variáveis e o gerenciador de segredos do ambiente para valores.
- Testes de integração e e2e do backend exigem `NODE_ENV=test` e banco de teste isolado. Nunca rodar comandos de limpeza, migração ou seed contra produção. Não usar `docker compose down -v` em ambiente compartilhado.
- Conferir a autorização efetiva do GitHub antes de prometer push ou PR. A integração do chat e a autenticação do terminal são acessos separados; se o Git do terminal falhar, usar a integração autorizada ou informar o bloqueio sem expor credenciais.
- Evitar mudanças em CI, infraestrutura, secrets e deploy junto com um card funcional. Quando necessárias, criar PR separado e explicar o efeito de publicação.

## Como iniciar pelo celular

Abra um chat novo no projeto/repositório certo e envie, por exemplo:

> Trabalhe no card #80 do Caverna Jiu-Jitsu. Leia `AGENTS.md` e `docs/codex-cloud-workflow.md`, consulte o card completo no Trello e confira o GitHub atual e trabalhos paralelos. Prepare o plano em `.docs/<slug>/plan.md`, com dependências, critérios de aceite e riscos. Siga as aprovações exigidas pelo repositório. Não faça merge sem minha instrução.

O chat é a interface de comando; GitHub e os documentos versionados guardam o estado compartilhado. Ao encerrar uma etapa, deixar no PR ou em `.docs/<slug>/` o que foi feito, checks executados, pendências e o próximo passo. Assim outro chat ou colaborador pode continuar sem depender da memória da conversa.
