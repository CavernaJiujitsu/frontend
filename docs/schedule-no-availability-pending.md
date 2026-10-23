# Agenda sem aulas e recuperação de falhas

Status: **decisão aprovada no card #88 em 22/10/2026**. A proposta de popup abaixo é histórica e foi substituída por estados inline.

## Comportamento atual aprovado

- ClassSkeleton durante carregamento, sem anunciar ausência de horários antes da resposta.
- Falha de consulta mostra erro e Tentar novamente; nunca vira lista vazia.
- Consulta concluída sem aulas mostra Nenhuma aula encontrada para o dia selecionado, sem bloquear calendário ou abrir popup.
- Caverna sem unidades usa o mesmo vazio após a consulta. Identificador ausente/inválido mostra orientação e Escolher outra caverna, sem request inválido.
- Inscrição bloqueia todos os cartões durante envio; navega a /inicio após sucesso e preserva lista após falha. Sem conta, orientar Criar conta. Resposta após sair da tela/trocar caverna não redireciona.
- Outro mês começa no dia 1; o seletor inicia no dia selecionado.
- Sem ocupação na API, mostrar Capacidade: N pessoas, sem inventar zero inscritos ou vagas livres. Mocks continuam isolados em api/mocks.
- Reutilizar ScreenLayout e TanStack Query existentes. Filtro semanal/paginação completa ficam no #89.

Evidências em `.docs/88-class-selection/test.md`. Figma não fornecido no card; visual segue componentes/tokens existentes, conforme aprovação.

## Histórico — proposta anterior (mock, substituída)

Quando o aluno escolhe, na tela anterior (escolha de caverna), uma caverna que
não possui nenhum horário no mês selecionado, a tela de schedule exibe um popup:

> "Essa caverna não possui horários disponíveis"

Implementação atual em `src/app/onboarding/(schedule)/schedule.tsx`:

- `hasAnyClassesInMonth(cavernaId, days)` verifica o mês inteiro.
- `Alert.alert(cavernaTitle, "Essa caverna não possui horários disponíveis")`
  dispara uma única vez por `cavernaId` (via `useRef`).
- A lista do dia mostra o empty state padrão ("Nenhuma aula encontrada").

Caverna de teste sem horários: `cavernaId = "caverna-sem-horarios"`
(ver `EMPTY_SCHEDULE_CAVERNA_ID` em `src/api/mocks/schedule.ts`).

## Pontos a validar com o time

1. O popup deve aparecer ao entrar na tela ou ao voltar da lista vazia?
2. Devemos bloquear a entrada na tela (redirect) em vez de mostrar popup?
3. Copy final do título/mensagem e necessidade de CTA ("Escolher outra caverna")?
4. Comportamento com dados reais (`GET /classes?cavernaId=&date=`): popup só após
   loading/erro resolvidos, ou também em erro de rede?
5. Acessibilidade: o `Alert` nativo é suficiente ou precisamos de modal próprio?
