# Implementação — Card 88

Plano e desenho aprovados pelo usuário: “aprovo pode fazer”. Branch `feat/88-class-selection`, criada da main do frontend f52a9cc5d529ac9c1f8121a8f57716452ef7f20d. O backend é outro repositório; o contrato do #87 está integrado na sua main pelo PR #10, commit 7688652.

## Alterações

- Agenda existente usa ScreenLayout; distingue loading/error/success e oferece retry e retorno para caverna inválida. Remove popup de ausência de horários conforme aprovação.
- TanStack Query existente reutiliza getCave/listClasses com chave por caverna. Nenhum serviço/contrato mudou.
- Inscrição usa trava síncrona por ref, bloqueio visual dos cartões e erro inline. Só navega após sucesso; contexto invalidado no cleanup evita redirecionar após sair da tela/trocar caverna.
- Calendário seleciona dia 1 em outro mês, mantendo hoje no mês atual; seletor horizontal inicia no dia escolhido.
- ClassItem.enrolled opcional; ClassCard mostra capacidade total quando a ocupação não é informada. A prop disabled bloqueia os outros cartões durante envio.
- Documentação e evidência visual atualizadas.

## Decisões e desvios

A abordagem inicial de estado manual no efeito foi substituída por TanStack Query após o lint apontar atualização síncrona em efeito. A solução final reutiliza a biblioteca já usada na tela de cavernas; não houve desativação de regra ou mudança do comportamento aprovado.

Sem mudança de dependências, lockfile, configuração nativa, API, autenticação ou política de reservas. Sem nova rota privada. Integração do filtro semanal e paginação completa continuam no #89. Figma não fornecido; visual segue os componentes e tokens atuais.

## Entrega

Commit local após validação, identificado por `git log -1` nesta branch; sem push/merge. Ver test.md e review.md. Não foi configurado runner ou framework de testes novo.
