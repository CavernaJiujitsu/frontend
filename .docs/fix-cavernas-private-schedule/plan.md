# Correção da listagem de cavernas e fluxo privado de aulas

## Contexto

Após a primeira correção publicada diretamente em dev, o comportamento observado não resolveu o clipping dos filtros. Também foi identificado que os cards da listagem privada de cavernas não possuem navegação: o onPress atual é vazio. A tela de horários existente está dentro do onboarding e não atende ao fluxo de um aluno já autenticado.

## Objetivo

Criar uma branch isolada para corrigir o layout dos filtros e permitir que o aluno toque em uma caverna na área privada, veja as aulas daquela caverna e selecione uma aula para reserva.

## Requisitos funcionais

1. Os filtros da listagem privada de cavernas devem aparecer inteiros, sem clipping vertical, em Web, iOS e Android.
2. Tocar em um card de caverna deve navegar para uma rota privada de aulas com o cavernaId e o nome da caverna.
3. A rota privada deve carregar as aulas das unidades da caverna selecionada.
4. O aluno deve conseguir trocar mês/dia, visualizar estados de loading/erro/vazio e selecionar uma aula.
5. A reserva deve usar o practitioner autenticado, mantendo o contrato atual de enrollClass.
6. O fluxo de onboarding existente deve continuar funcionando sem depender da rota privada.

## Requisitos não funcionais

- Toda a implementação ficará na branch fix/cavernas-filters-private-schedule.
- Reutilizar a UI e a lógica de agenda existentes, evitando uma segunda implementação divergente.
- Manter navegação Expo Router e vocabulário de produto em PT-BR.
- Não alterar backend, dependências ou bun.lock pré-existente.

## Contrato de API consumido

Sem mudança de contrato. A agenda usa GET /api/v1/caves/:id, GET /api/v1/classes?caveUnitId=... e POST /api/v1/classes/:classId/enrollments com { practitionerId }, conforme os serviços existentes.

## Decisões de refinamento

| Ponto | Decisão |
| --- | --- |
| Rota privada | /cavernas/[cavernaId]/aulas, aninhada à área privada e acessível a partir dos cards. |
| Reuso | Extrair a tela de agenda para componente fora de src/app; onboarding e área privada fornecem o modo de retorno. |
| Voltar no privado | Retornar para /cavernas; no onboarding, manter o retorno atual para /onboarding/nearby-gym. |
| Filtros | Remover o clipping causado por altura fixa do scroll e usar uma área de chips com altura/overflow compatíveis. |
| Branch | Não fazer novos pushes em dev; publicar somente a branch isolada quando validada. |

## Fora de escopo

- Alterar endpoints ou backend.
- Criar histórico de reservas ou tela de confirmação nova.
- Alterar o menu inferior ou o fluxo de autenticação.

## Critérios de aceite

1. Os três filtros são visíveis e tocáveis por inteiro.
2. Cada card navega para /cavernas/<id>/aulas.
3. A página privada exibe o nome da caverna e carrega suas aulas.
4. A seleção de aula envia a reserva com o practitioner autenticado.
5. O onboarding continua navegando e reservando como antes.
6. bun run lint e bunx tsc --noEmit passam.
7. A branch separada é publicada no remoto sem novos commits em dev.

## Estratégia de teste

- Rodar lint e typecheck.
- Exercitar o fluxo privado em Web/dev: cavernas → card → aulas → seleção de dia → aula.
- Validar estados sem ID, loading, erro e lista vazia.
- Registrar evidências e limitações em test.md.

## Riscos e pendências

- A validação visual pode depender do ambiente local/dev e da API autenticada.
- O deploy de preview da branch depende da configuração do provedor remoto.
