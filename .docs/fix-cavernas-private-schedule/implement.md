# Implementação — cavernas privadas e agenda

## Alterações

- Criado o componente compartilhado ScheduleScreen em src/components/schedule/schedule-screen.tsx.
- A rota de onboarding passou a reutilizar o componente compartilhado.
- Criada a rota privada /cavernas/[cavernaId]/aulas, com BottomNavbar e retorno para /cavernas.
- Cards de cavernas agora navegam para a agenda privada com ID e nome da caverna.
- Área dos filtros foi encapsulada e ampliada para 56 px, com padding interno para evitar clipping dos chips.

## Decisões

- A lógica de agenda e reserva não foi duplicada na rota privada.
- O contrato dos serviços de cavernas, aulas e reservas não foi alterado.
- A branch de trabalho é fix/cavernas-filters-private-schedule; dev não será atualizado nesta rodada.

## Validação

- Typecheck e lint foram executados.
- Foram encontrados erros preexistentes no baseline: import de vconsole não resolvido e rota dinâmica antiga de trilha não aceita pelos tipos gerados do Expo Router.
- Os resultados completos estão em test.md.

## Pendências

- Validar visualmente em um ambiente dev/preview autenticado.
- Publicar a branch isolada para abrir o preview/PR.
