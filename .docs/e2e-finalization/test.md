# Testes — finalização E2E do mobile (Frente 2)

Data das medições: 17/11/2026. Ambiente: Linux, Bun 1.4.0, Node 24.18.0, Chrome do sistema, API real em `http://localhost:3000` (`caverna_local`) e Expo web em `http://localhost:8081`. Sem Docker, migrations ou testes de backend executados por esta frente. Nenhum dado do banco foi apagado.

## Checks executados

| Check | Comando | Resultado |
| --- | --- | --- |
| Lockfile | `bun install --frozen-lockfile` | sem mudanças (1186 installs / 1083 pacotes) |
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0; 1 warning pré-existente (`require()` em `src/components/__tests__/schedule-screen-test.tsx:12`) |
| Jest completo | `bun run test` | **27/27 suítes, 205/205 testes**, 8,2 s |
| Jest sem `.env` (simulação CI) | `EXPO_PUBLIC_API_URL= bun run test` | **27/27 suítes, 205/205 testes**, 10,1 s |
| E2E (1ª execução final) | `bunx playwright test` | **2/2**, 18,7 s |
| E2E (2ª execução final) | `bunx playwright test` | **2/2**, 21,2 s |
| Regressão dos testes novos | remoção temporária dos ramos de erro | 6 falhas esperadas; restore com `diff` idêntico |

> O CI usa `bun install --frozen-lockfile`, `bun run typecheck` e `bun run test`. O teste com `EXPO_PUBLIC_API_URL=` vazio prova que a suíte não depende do `.env` local; os testes que importam `@/constants/api` o mockam.

## Matriz — testes de componente novos

Antes desta frente, as telas abaixo não tinham teste próprio de erro ≠ vazio. Os 4 arquivos somam **15 casos** (190 → 205 testes).

### `__tests__/app/perfil-test.tsx` (3)

| Caso | O que prova |
| --- | --- |
| erro 500 | mostra "Não foi possível carregar seu perfil", botão "Tentar novamente" e "Sair da conta"; não renderiza o shell de sucesso nem o aviso de registro ausente |
| retry | depois do erro, "Tentar novamente" refaz a query e mostra nome e faixa |
| sucesso | nome, "Faixa Azul" e "Seu registro de treino ainda não está disponível."; sem título de erro |

### `__tests__/app/professor-validacoes-test.tsx` (4)

| Caso | O que prova |
| --- | --- |
| erro na lista de pendentes | mostra "Não foi possível carregar as validações." em vez de "Nenhuma validação pendente nas suas cavernas." |
| vazio real | pendentes vazias e, na aba "Agendadas (0)", "Nenhuma validação agendada nas suas aulas." |
| erro no seletor de aula | mostra "Não foi possível carregar suas aulas." e "Tentar novamente", não o texto de "sem aulas" |
| vazio do seletor | mostra "Você não tem aulas futuras de treino ou validação…" apenas quando a query responde vazia com sucesso |

### `__tests__/app/chamada-test.tsx` (5)

| Caso | O que prova |
| --- | --- |
| erro ao carregar a aula | mostra "Aula não encontrada." e não renderiza "ALUNOS INSCRITOS" |
| erro nas inscrições | mostra "Não foi possível carregar as inscrições." em vez de "Nenhum aluno inscrito nesta aula." |
| inscrições vazias | mostra o vazio apenas no sucesso |
| erro na busca de aluno | mostra "Não foi possível buscar alunos." e "Tentar novamente", em vez de "Nenhum aluno encontrado." |
| busca vazia | mostra "Nenhum aluno encontrado." apenas no sucesso vazio |

### `__tests__/app/trilha-test.tsx` (3)

| Caso | O que prova |
| --- | --- |
| erro 500 | mostra "Não foi possível carregar sua trilha" em vez da página de avaliação pendente |
| sem faixa ativa | mostra "Avaliação pendente"/"Sua jornada começou" somente quando a API responde `noActiveBelt: true` |
| trilha ativa | mostra "Faixa Azul", "Trilha Azul", "2 / 5 movimentos obrigatórios · 40%" e "Etapas da trilha" |

## Prova de regressão (vermelho → restore)

Para garantir que os testes de erro não passam por acidente, os ramos de erro foram removidos temporariamente com backup em `/tmp/opencode/mutation-backup`:

- `(private)/perfil/index.tsx`: `query.isError` → `false`;
- `(private)/trilha/index.tsx`: `query.isError` → `false`;
- `professor/validacoes/index.tsx`: `if (classesQuery.isError)` → `if (false)`;
- `professor/aulas/[classId]/chamada.tsx`: erro das inscrições e erro da busca → `false`.

Resultado: **6 falhas / 9 passes**. Falharam exatamente os casos de erro (e o retry do perfil, que depende do ramo); os casos de vazio/sucesso continuaram verdes:

- Perfil: "shows the profile error state…" e "recovers when the retry succeeds";
- Validações: "shows the class-picker error state instead of 'no classes'";
- Chamada: "shows the enrollment error state…" e "shows the student-search error state…";
- Trilha: "shows the trail error state…".

Depois do restore, `diff -q` nos quatro arquivos contra o backup retornou `RESTORE_IDENTICAL=yes`.

## Matriz — E2E (Playwright)

Configuração: `playwright.config.ts`; 1 worker; `locale: pt-BR`; `timezoneId: America/Sao_Paulo`; Chrome do sistema; Expo web iniciado/reaproveitado em `:8081`; API real em `:3000`. E-mails únicos por execução (`e2e-<cenário>-<timestamp>-<rand>@teste.caverna`); nenhuma limpeza de banco.

| Cenário | Passos | Asserções principais |
| --- | --- | --- |
| localização concedida | cadastro → pular carrossel → "Não tenho graduação" → busca da caverna descoberta → mês/dia da aula real → "Inscrever" | distância `x,y km` nos cards (localização salva); URL `/inicio`; saudação `Olá, Aluno 👋`; card "PRÓXIMA AULA" com `sáb • 07:30`, "Inscrição pendente", `Prof. …` e nome da caverna; "Avaliação pendente" |
| localização negada | cadastro → diálogo "Não foi possível acessar sua localização" → "Agora não, prefiro buscar manualmente" → mesma jornada | URL `/onboarding/location-permission` antes de pular; mesma home com inscrição pendente |

A aula é descoberta pela API pública (`GET /classes?type=VALIDATION&from=…&to=…`), com vaga e preferência por caverna de unidade única; os rótulos de dia/horário são derivados do ISO real em `America/Sao_Paulo`. Assim o teste não depende de UUID fixo nem da data do seed.

### Corrida encontrada e corrigida

Na primeira execução após os testes de componente, o cenário concedido falhou: o helper esperava `location-permission`, mas a tela **solicita a permissão automaticamente ao abrir** e, já concedida, salvou a localização e navegou para `nearby-gym` antes da asserção. Correção no teste (não no app):

- `createAccount` aceita `/onboarding/(location-permission|nearby-gym)` como destino pós-login;
- o cenário concedido espera `nearby-gym` e afirma que há distância `x,y km` nos cards;
- o cenário negado espera explicitamente `location-permission` antes do diálogo e do "Agora não".

Depois da correção: 2/2 em duas execuções consecutivas (18,7 s e 21,2 s).

## Como reproduzir

Pré-requisitos: API real em `http://localhost:3000` com o seed aplicado; Chrome instalado; portas 8081 e 3000 livres (ou Expo web já rodando em 8081).

```bash
cd frontend
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bunx playwright test        # sobe/reaproveita o Expo web em :8081
```

- `bunx playwright test` exige a API de pé; sem ela os cenários falham no cadastro.
- Cada execução cria 2 alunos e 2 inscrições `PENDING` (um por cenário). Isso é intencional: o E2E nunca limpa o banco.
- Em caso de falha, o Playwright grava screenshot e trace em `frontend/test-results/`, já ignorado pelo git.
- Para rodar apenas um cenário: `bunx playwright test -g "location granted"`.

## Observações

- O warning de lint em `schedule-screen-test.tsx` é pré-existente e não foi introduzido por esta frente.
- Uma execução intermediária da suíte Jest teve 3 timeouts de 5 s sob load average ~11 (testes e2e do backend de outra frente em paralelo em `caverna_test`); a reexecução passou 23/23. O `testTimeout: 15000` no `package.json` reduz esse flake em runners lentos.
- O E2E não roda no CI: depende de API e Expo web locais. O job `typecheck_and_tests` cobre typecheck, lint e Jest em PRs; o build web continua no `quality_assurance_job`.
- `DEC-mobile-1` segue aberta e bloqueia apenas o preview de PR do Azure SWA; não afeta os checks acima.
