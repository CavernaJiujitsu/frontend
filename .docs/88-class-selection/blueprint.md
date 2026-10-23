# Blueprint — Card 88

Status: aprovado pelo usuário em 22/10/2026, junto com plan.md.

## Inventário e reuso

| Peça | Reuso |
|---|---|
| onboarding/(schedule)/schedule.tsx | Preservar rota, busca e inscrição; tornar estados explícitos e recuperar falhas. |
| MonthSelector / WeekDayList / ClassCard | Preservar componentes e estilos; acrescentar bloqueio de seleção durante envio. |
| ScreenLayout | Aplicar layout padrão e safe area sem inset duplicado. |
| DefaultButton | Usar ações de retry e retorno seguindo o padrão visual do app. |
| ClassSkeleton | Reusar carregamento da lista. |
| getCave / listClasses / enrollClass | Preservar integração existente; nenhum serviço paralelo ou mock na rota publicada. |
| api/mocks/schedule.ts | Dados fictícios continuam isolados; reutilizar helpers existentes de calendário sem duplicar lógica. |
| backendMessage / reportError | Reusar normalização de falhas; erro de carregamento permanece visível na própria tela. |

## Desenho

- schedule.tsx: consulta com TanStack Query já existente no projeto, chave por caverna e retry manual via refetch. A chave separa dados de cavernas diferentes; contexto de inscrição é invalidado no cleanup ao sair da tela ou trocar caverna. Remover popup de ausência de horários não aprovado e alertas que não funcionam como fallback na web. Ações de estado inline, sem mudar rota de sucesso existente.
- ClassCard: prop disabled opcional para bloquear outros cartões enquanto a inscrição envia; enrolled opcional no tipo ClassItem; capacidade total quando ocupação não informada. Não deduzir lotação sem dado real.
- schedule.styles.ts: somente estilos necessários para estados e responsividade com tokens existentes. ScreenLayout substitui SafeAreaView direto na tela.
- docs/schedule-no-availability-pending.md: atualizar comportamento do vazio conforme decisão aprovada, preservando registro de que o popup anterior era pendente.
- .docs/88-class-selection/: plano, blueprint, implementação, testes e revisão final.

## Alternativas

Nova rota privada: descartada por ampliar escopo e duplicar a tela antes de fechar o fluxo. Trocar o serviço de listagem e implementar paginação/filtro da API agora: descartado para preservar o limite entre #88 e #89. Mostrar erro apenas por Alert: descartado porque não oferece recuperação persistente e não funciona igualmente na web. Componentes de estado novos globais: desnecessários neste escopo; reutilizar primitives e DefaultButton.

## Contratos e limites

Sem DTO, query, body, rota do backend ou dependência nova. GET de aulas usa caveUnitId, inscrição usa practitionerId. Nenhum comportamento de presença/expiração muda. Comparação com Figma depende de referência fornecida; validação visual segue componentes existentes até lá. Testes funcionais locais não usarão conta ou dados de produção.
