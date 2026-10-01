# Pending — Popup de caverna sem horários

Status: **pending** — aguardando reunião com o time para validar viabilidade e se faz sentido.

## Decisão atual (mock)

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
