# Correção dos filtros da listagem de cavernas

## Contexto

Demanda direta do PO: no ambiente de desenvolvimento, os botões de filtro da listagem de cavernas ficam parcialmente escondidos na área acessada pelo usuário autenticado.

## Objetivo

Deixar os três filtros (`Mais próximas`, `Abertas agora` e `Aulas hoje`) totalmente visíveis e tocáveis em iOS, Android e Web, preservando o scroll horizontal e o comportamento atual.

## Requisitos funcionais

1. Os três chips de filtro devem aparecer completos, incluindo texto e área de toque.
2. O chip selecionado deve continuar destacado.
3. O usuário deve continuar podendo deslizar horizontalmente quando necessário.
4. A seleção deve continuar disparando a filtragem existente, sem mudança no contrato da API.

## Requisitos não funcionais

- Respeitar os tokens e estilos existentes da linguagem visual Caverna.
- Não adicionar dependências nem alterar rotas, serviços ou backend.
- Manter acessibilidade dos controles como botões selecionáveis.

## Contrato de API consumido

Nenhuma alteração de API. A correção atua somente no layout do `ScrollView` dos filtros em `src/app/(private)/cavernas/index.tsx`, usando os estilos compartilhados de `src/styles/private/inicio.styles.ts`.

## Decisões de refinamento

| Ponto | Decisão |
| --- | --- |
| Causa | Altura fixa de 36 px recorta chips que usam padding vertical. |
| Solução | Aumentar a altura do `ScrollView` e da linha para acomodar o chip, mantendo o espaçamento atual. |
| Escopo | Apenas layout visual; filtros e chamadas existentes permanecem iguais. |
| Plataformas | Validar por lint, typecheck e execução Web; registrar limitações de dispositivo físico se houver. |

## Fora de escopo

- Alterar labels, regras de ordenação ou filtros.
- Refatorar a tela de cavernas.
- Alterar backend, autenticação ou publicação em lojas.

## Critérios de aceite

1. Os três botões aparecem completamente na listagem de cavernas, sem clipping vertical.
2. O texto dos botões permanece legível e a área de toque permanece acessível.
3. A seleção de cada filtro continua atualizando o estado e a listagem.
4. `bun run lint` e `bunx tsc --noEmit` passam.
5. A alteração é publicada no alvo de desenvolvimento solicitado, caso o fluxo de deploy da branch esteja disponível.

## Estratégia de teste

- Inspeção do layout e dos estilos alterados.
- Lint e typecheck.
- Exercício da rota `/cavernas` em Web/dev, conferindo visibilidade e seleção dos três chips.
- Registrar resultado em `test.md`.

## Riscos e pendências

- A validação visual em iOS/Android pode depender de um device ou development build disponíveis.
- O deploy direto em dev depende do remoto/fluxo configurado para este repositório.
