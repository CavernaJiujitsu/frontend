# Implementação — correção dos filtros da listagem de cavernas

## Alterações

- Ajustada a altura do `ScrollView` e da linha dos filtros de 36 para 48 px em `src/styles/private/inicio.styles.ts`.
- Mantidos os chips, estados, labels, acessibilidade, filtragem e contrato de API existentes.

## Decisão/desvio

O plano previa apenas acomodar a altura dos chips; a implementação escolheu 48 px para fornecer folga vertical além do padding atual e evitar novo clipping em plataformas com métricas de fonte diferentes.

## Validação

- `bun run lint`: passou.
- `bunx tsc --noEmit`: passou.
- Validação visual local: bloqueada pelo modo offline/socket restrito do ambiente; registrada em `test.md`.

## Pendências

- Publicar na dev conforme remoto configurado.
