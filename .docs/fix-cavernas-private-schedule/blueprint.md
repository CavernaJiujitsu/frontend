# Blueprint — cavernas privadas e agenda reutilizável

## Inventário

| Peça | Local | Reuso/alteração |
| --- | --- | --- |
| Listagem privada | src/app/(private)/cavernas/index.tsx | Corrigir filtros e navegar no card. |
| Agenda atual | src/app/onboarding/(schedule)/schedule.tsx | Extrair para componente reutilizável. |
| Componentes de agenda | src/components/customized/schedule/ | Reutilizar ClassCard, MonthSelector e WeekDayList. |
| Serviços | src/api/services/caves.service.ts, classes.service.ts | Reutilizar sem alteração de contrato. |
| Layout privado | src/app/(private)/_layout.tsx | A nova rota herda Stack, navbar e FAB. |

## Desenho final

- Criar src/components/schedule/schedule-screen.tsx com a lógica/visual da agenda e props mode (onboarding/private) e cavernaId/cavernaTitle.
- Criar src/app/(private)/cavernas/[cavernaId]/aulas.tsx, lendo cavernaId da rota e cavernaTitle dos parâmetros.
- Alterar a tela de onboarding para delegar ao componente compartilhado, preservando suas rotas de retorno e cadastro.
- Alterar o caller do CardComponent da listagem para router.push com pathname /cavernas/[cavernaId]/aulas e os parâmetros.
- Ajustar o contêiner de filtros para que a área rolável não recorte seus filhos; manter labels, estados e estilos de marca.

## Estados e navegação

- ID inválido: mensagem e ação de retorno para a origem.
- Loading/erro/vazio/sucesso: manter os estados já implementados.
- Reserva: mesma proteção contra duplo clique e mesma API existentes.
- Privado: retorno para /cavernas; onboarding: retorno para /onboarding/nearby-gym.

## Duplicidades evitadas

- Nenhuma cópia da lógica de agenda será criada na nova rota.
- Nenhum novo serviço ou alias de API será adicionado.
