# Teste — cavernas privadas e agenda

## Ambiente

- Branch: fix/cavernas-filters-private-schedule
- Expo SDK: 57
- bun.lock: alteração pré-existente preservada fora do commit.

## Checks

| Comando | Resultado |
| --- | --- |
| bun run lint | Falhou por erro preexistente em src/components/debug-console.web.tsx: módulo vconsole não resolvido. |
| bunx tsc --noEmit | Falhou pelos mesmos tipos do baseline: vconsole não resolvido e rota dinâmica preexistente /trilha/[stageId]. |
| bunx expo-doctor | Não executado; não houve dependência ou configuração nova. |

## Matriz funcional

| Caso | Esperado | Situação |
| --- | --- | --- |
| Filtros | Chips aparecem completos e são tocáveis | Implementado; runtime autenticado pendente. |
| Card de caverna | Navega para a agenda privada com o ID da caverna | Implementado na rota /cavernas/[cavernaId]/aulas. |
| Agenda privada | Carrega aulas das unidades da caverna | Implementado reutilizando os serviços existentes. |
| Seleção de dia/mês | Atualiza o recorte das aulas | Reutilizado do onboarding. |
| Reserva | Envia practitionerId e retorna para início | Reutilizado do onboarding. |
| ID inválido/erro/vazio | Exibe feedback e ação de retorno | Implementado no componente compartilhado. |

## Limitação

A validação visual e funcional em runtime não foi concluída porque o Expo Web local está em modo offline e o sandbox bloqueia o socket local. A branch deve ser publicada em preview/dev para validar o fluxo autenticado.
