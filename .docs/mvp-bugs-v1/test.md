# Verificação — bugs v1 do MVP (frontend)

## Execuções

- `bun run typecheck`: passou.
- `bun run lint`: passou com zero erros e um aviso de `require()` no teste `schedule-screen-test.tsx`.
- `bunx jest --runInBand --silent`: 28 suítes, 219 testes passaram. O Jest reportou handle aberto após os testes; execução com `--detectOpenHandles` no teste da chamada terminou normalmente.
- `bunx expo export --platform web`: passou.

## Casos

- Mensagem de cavernas próximas distingue ausência de localização de ausência de unidades no raio; 5 km preservados.
- Reserva e tela de agenda enviam `requestInitialValidation: true`; inscrição pela chamada do professor continua sem esse parâmetro.
- Fila do professor inclui validação `SCHEDULED` na aba “Em aberto” e permite abrir chamada.
- Inscrição pela chamada mostra diálogo de sucesso em vez do alerta do navegador; teste verifica abertura e fechamento.

## Limites

- Não foi feita verificação visual no dispositivo/navegador final nem E2E de interface contra a API implantada.
- Os registros em `docs/bugs/v1/` representam a especificação disponível para esta correção; não houve `plan.md` formal aprovado antes da implementação. Este relatório não pretende suprir aprovação retroativa.
