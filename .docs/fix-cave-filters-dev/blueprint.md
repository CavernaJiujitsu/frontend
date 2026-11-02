# Blueprint — correção dos filtros da listagem de cavernas

## Inventário

| Peça | Local | Uso |
| --- | --- | --- |
| Rota da listagem | `src/app/(private)/cavernas/index.tsx` | Renderiza header, busca, filtros e lista. |
| Chips de filtro | Mesmo arquivo | `Pressable` horizontal com estado local `activeFilter`. |
| Estilos dos chips | `src/styles/private/inicio.styles.ts` | Define altura, padding, cores e tipografia. |
| Layout privado | `src/app/(private)/_layout.tsx` | Mantém fundo, FAB e navegação inferior. |
| Dados | `src/api/services/caves.service.ts` | Sem alteração; filtros continuam usando `listUnits`. |

## Reuso e análise

- Reutilizar o `ScrollView` horizontal e os estilos existentes.
- Não criar novo componente nem duplicar lógica de seleção.
- Não mexer em `ScreenLayout`, pois o clipping está restrito ao contêiner dos chips.

## Alternativas avaliadas

1. Reduzir o padding vertical dos chips: descartado porque diminui a área de toque e não corrige a origem do clipping de forma tão clara.
2. Remover alturas fixas: descartado porque o scroll horizontal precisa de uma altura estável para não colapsar o layout.
3. Ajustar a altura fixa para o tamanho real dos chips: escolhido por ser a menor mudança, preservando o desenho e o fluxo atual.

## Desenho final

- Alterar somente `filterRow.height` e `filterScroll.height` para acomodar os chips.
- Preservar `paddingHorizontal`, `paddingVertical`, cores, estados pressed/selected e callbacks.
- Sem novos estados, props, rotas, serviços ou dependências.

## Estados

- Filtros: selecionado, não selecionado e pressionado permanecem iguais.
- Lista: loading, erro, vazia e sucesso não sofrem alterações.

## Riscos e validação

- Conferir que o espaço extra não invade a lista nem a navegação inferior.
- Rodar lint/typecheck e validar visualmente em Web/dev.
