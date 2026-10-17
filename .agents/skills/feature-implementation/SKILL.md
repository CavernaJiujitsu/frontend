---
name: feature-implementation
description: Prepara e executa a implementação de uma feature/tela já planejada no app Expo — mapeia o que já existe no código (rotas, componentes, serviços, estilos, tokens), o que reutilizar e como evitar duplicidade, monta o blueprint (arquivos, componentes, contrato de API consumido, estados), coleta aprovação e então implementa seguindo as convenções, registrando decisões e desvios em `.docs/<slug>/implement.md`. Use quando existir `plan.md` aprovado e o usuário disser 'implementar', 'codar', 'fazer o blueprint' ou 'implement the feature'; é a segunda etapa do fluxo do trello-ticket. NÃO use para planejar requisitos, testar ou revisar.
metadata:
  short-description: Blueprint de reuso + implementação
---

# Feature Implementation (blueprint + código)

Pré-requisito: `.docs/<slug>/plan.md` aprovado. Sem plano, rode antes a skill `$feature-plan`.

## Etapa 1 — Blueprint (antes de qualquer código)

1. **Inventário do que existe**: percorra o que a feature toca — rotas (`src/app/`), componentes (`src/components/customized/` app-owned, `complex/`, `screen-layout/`, `bottom-navbar/`), hooks (`src/hooks/`, `src/api/hooks/`), serviços/endpoints (`src/api/services/`, `src/api/endpoints/routes.ts`), tipos (`src/types/`, `src/api/types/`), mocks (`src/api/mocks/`), estilos (`src/styles/<grupo>/`) e tokens (`src/constants/theme.ts`). Liste o que já resolve parte do problema.
2. **Reuso e análise crítica**: para cada peça (tela/rota, componente, estado, fetch, validação, estilo), procure onde algo equivalente vive hoje. Regra dura — **nada de lógica duplicada**: se já existe, reuse (ex.: `DefaultButton`, `ScreenLayout`, `SearchInput`, hooks de fetch/paginação); se quase existe, avalie extrair para `customized/`/`hooks/`. Avalie alternativas de desenho e registre por que a escolhida venceu.
3. **Confirme o contrato com o backend**: antes de mexer em `src/api/services/`, leia o DTO + controller em `../backend/src/<recurso>/` e espelhe os nomes exatos (query, body, enums, erros — ex.: `caveUnitId`, nunca `academyUnitId`). Divergência se corrige no front (padrão em `docs/api-contract/prd.md`).
4. **Escreva `.docs/<slug>/blueprint.md`**: tabela de inventário (peça → onde → uso no plano), alternativas avaliadas (com porquês), desenho final (arquivos novos/alterados com o papel de cada um, rota e navegação, componentes e props, estados loading/empty/error/success, contrato de API consumido, mocks de UI em `src/api/mocks/<contexto>.ts` quando o real ainda não existir), duplicidades evitadas e riscos/limites.
5. **Mostre o blueprint e aguarde aprovação.** Não implemente antes do ok.

## Etapa 2 — Implementação

Siga o `AGENTS.md` ao pé da letra. Pontos que mais erram:

- Expo muda a cada SDK: antes de usar API de Expo/EAS/React Native, busque a doc da versão do `package.json` (`https://docs.expo.dev/versions/v57.0.0/`) — nunca responda de memória.
- Rotas: cada arquivo em `src/app/` é uma tela; `_layout.tsx` define navegador; código que não é rota fica fora de `src/app/`. Troca de aba no menu privado: `router.replace`, nunca `push`.
- UI: siga a skill `$ui-style` — tokens de `@/constants/theme` (nada de hex solto), `DefaultButton`, `ScreenLayout` (o layout externo cuida do inset; a tela não reaplica padding de página), vocabulário "caverna".
- Dependência nova? **Sempre** `bunx expo install <pacote>` (resolve a versão compatível com o SDK). Prefira módulos Expo. Lib com código nativo ⇒ precisa de development build (avise o usuário).
- Nunca edite `ios/`/`android/` à mão (são gerados — CNG); configure nativo via `app.json`/config plugins.
- Comentários em inglês; strings de UI/erro em PT-BR; imports com o alias `@/`.
- Erros da API: siga o contrato de erro (`docs/backend-error-contract.md`).
- Mudou um padrão do projeto? Atualize o PRD correspondente em `docs/<área>/prd.md`.

Rode `bun run lint && bunx tsc --noEmit` ao fim de cada bloco relevante e conserte antes de seguir (`bunx expo-doctor` se mexeu em dependências/app config).

## Encerramento

Grave `.docs/<slug>/implement.md`: commits da branch, o que foi feito por área (com arquivos), decisões/desvios do blueprint (e por quê), mudanças incidentais, validação executada e pendências. Depois aponte para a skill `$feature-teste` — "pronto" só existe com `test.md`.
