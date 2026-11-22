# Implementação — finalização E2E do mobile (Frente 2)

Plano: `docs/finalizacao-e2e/implementation-plan.md` (aprovado em 17/11/2026), detalhado em `frontend/.docs/e2e-finalization/plan.md`. Entrega por zip, sem commits (D0). Este arquivo cobre a Fase 1 (verificação/revisão) e a Fase 2 (Playwright + CI) da frente mobile.

## Contexto

A auditoria (`docs/finalizacao-e2e/audit.md` §4) apontou, entre outros: erro renderizado como lista vazia, filtros de Cavernas chamando rota admin-only, `Alert.alert` inerte no web, status da inscrição invisível e token em `AsyncStorage`. A Fase 1 já estava implementada no código quando esta sessão começou; a Fase 2 precisava de um E2E real, do job de CI e dos artefatos `.docs`.

## O que foi feito

### Fase 1 — verificação independente

- Medição do estado existente em 17/11 08:58: `tsc` exit 0, lint exit 0, 23 suítes / 190 testes verdes.
- Revisão do código e dos testes de T-M01, T-M02 (sessão e telas), T-M03, T-M04, T-M05 e do certificado (`certificateId`), confrontando com o contrato real do backend.
- Fluxo real conferido contra a API em `:3000` com usuário descartável de e-mail único: cadastro → login → declaração de faixa → inscrição em aula `VALIDATION` → home com `PENDING` em "PRÓXIMA AULA". Nenhum dado foi apagado.
- Corrigidos apenas dois resíduos de documentação/teste, sem mudança de comportamento:
  - comentários sobre o contrato C1 em `src/api/services/classes.service.ts`;
  - nome desatualizado em um caso de `__tests__/app/reservar-encontro-test.tsx`.

### Fase 2 — E2E e CI

- `@playwright/test@1.65.1` em `devDependencies`, script `test:e2e` (`playwright test`) e artefatos do Playwright no `.gitignore`.
- `playwright.config.ts`: Chrome do sistema (`channel: "chrome"`), `pt-BR`, `America/Sao_Paulo`, viewport 1280×900, 1 worker, Expo web em `:8081` via `webServer` (reaproveita servidor local; nunca em CI), API real em `:3000`.
- `e2e/support/validation-class.ts`: descobre uma aula `VALIDATION` futura e com vaga pela API pública, prefere caverna de unidade única (evita dois botões no mesmo horário) e deriva os rótulos PT-BR da UI a partir do ISO real (dia, mês, `sáb • 07:30`, professor).
- `e2e/onboarding-journey.spec.ts`: duas jornadas completas, com e-mail novo por execução e sem limpar o banco:
  - localização concedida: cadastro → pular carrossel → "Não tenho graduação" → busca da caverna → dia → inscrição → `/inicio` com status pendente;
  - localização negada: mesma jornada, passando pelo diálogo de permissão e por "Agora não, prefiro buscar manualmente".
- `.github/workflows/ci.yaml`: job `typecheck_and_tests` em PRs (abertos/sincronizados/reabertos), com `bun install --frozen-lockfile`, `bun run typecheck` e `bun run test`.
- Testes de componente novos para os estados que ainda não tinham cobertura própria: `perfil`, `professor/validacoes`, `chamada` e `trilha` (erro ≠ vazio/sucesso).
- `package.json`: `testTimeout: 15000` no bloco Jest. Uma execução da suíte completa sofreu 3 timeouts de 5 s com load average ~11 causado por testes e2e de outra frente; a reexecução passou 23/23. O limite maior evita flake em runner lento sem mascarar teste travado.

## Arquivos

| Arquivo | Mudança |
| --- | --- |
| `frontend/playwright.config.ts` | novo — configuração do E2E |
| `frontend/e2e/onboarding-journey.spec.ts` | novo — jornadas concedida e negada |
| `frontend/e2e/support/validation-class.ts` | novo — descoberta da aula e rótulos PT-BR |
| `frontend/.github/workflows/ci.yaml` | job `typecheck_and_tests` |
| `frontend/package.json` | Playwright, `test:e2e`, `testTimeout` do Jest |
| `frontend/bun.lock` | lockfile do Playwright |
| `frontend/.gitignore` | `test-results/`, `playwright-report/`, `blob-report/` |
| `frontend/src/api/services/classes.service.ts` | comentários do C1 atualizados |
| `frontend/__tests__/app/reservar-encontro-test.tsx` | nome de caso atualizado |
| `frontend/__tests__/app/perfil-test.tsx` | novo — erro, retry e sucesso |
| `frontend/__tests__/app/professor-validacoes-test.tsx` | novo — erro/vazio da lista e do seletor de aula |
| `frontend/__tests__/app/chamada-test.tsx` | novo — erro/vazio de inscrições e da busca |
| `frontend/__tests__/app/trilha-test.tsx` | novo — erro ≠ avaliação pendente ≠ trilha ativa |
| `frontend/.docs/e2e-finalization/implement.md` | este arquivo |
| `frontend/.docs/e2e-finalization/test.md` | checks e evidências |

## Decisões

- **E2E contra a UI real e a API real**, sem mock e sem limpeza do banco. Cada cenário cria um aluno com e-mail único; inscrições e declarações ficam no banco de propósito.
- **Aula descoberta dinamicamente** em vez de UUID fixo: o seed roda em janelas móveis e ids mudam. A escolha prefere caverna de unidade única para o botão de inscrição ser inequívoco.
- **Chrome do sistema** (`channel: "chrome"`): o runner não baixa binário do Playwright e usa o Chrome já disponível no ambiente medido.
- **Geolocalização**: o headless nega por padrão, o que torna o cenário negado determinístico; o concedido usa `geolocation` + `permissions: ["geolocation"]` do Playwright.
- **Corrida do onboarding**: a tela de localização solicita permissão automaticamente ao abrir. Com permissão concedida, ela pode chegar a `nearby-gym` antes do helper conferir `location-permission`; o helper agora aceita os dois destinos e cada cenário valida o seu. No concedido, a presença de `"0,3 km"` nos cards prova que a localização foi salva.
- **CI sem E2E**: o job novo roda apenas `typecheck`, `lint` e `test`. Playwright exige API e Expo web de pé; não é confiável em PR sem ambiente dedicado. O build do Expo web continua no job `quality_assurance_job`.
- **Preview do Azure SWA**: inalterado por DEC-mobile-1 (mesma API de produção no preview). O `ci.yaml` cobre o que é seguro fechar agora.

## Validação

Resultados completos em `frontend/.docs/e2e-finalization/test.md`:

- `bun install --frozen-lockfile`: sem mudanças.
- `bun run typecheck`: exit 0.
- `bun run lint`: exit 0 (1 warning pré-existente em `schedule-screen-test.tsx`).
- `bun run test`: 27 suítes / 205 testes verdes; também verde sem `EXPO_PUBLIC_API_URL` (simulação do CI).
- `bunx playwright test`: 2/2 verde em duas execuções consecutivas após o ajuste da corrida (18,7 s e 21,2 s).
- Regressão dos testes novos provada vermelha removendo os ramos de erro (6 falhas) e restaurada com `diff` idêntico.

## Pendências e limites

- **DEC-mobile-1** segue aberta: bloqueia só a parte de "preview de PR" do T-O01. Recomendação registrada: opção (b), restringir o deploy de preview. Exige decisão fora do repo.
- O E2E não roda no CI por depender de API e Expo web locais; quando houver ambiente de staging, pode virar job separado.
- A suíte completa pode ficar lenta sob carga de outras frentes; `testTimeout: 15000` mitiga, mas não elimina contenção de CPU.
- Nenhum commit, branch, stash ou push foi feito. Nenhum comando Docker, migration ou teste de backend foi executado por esta frente.
