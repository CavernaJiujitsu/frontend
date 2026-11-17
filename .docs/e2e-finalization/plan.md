# Plano — finalização E2E do mobile (Frente 2)

**Status: aprovado.** O plano aprovado é `docs/finalizacao-e2e/implementation-plan.md` (Gabriel, 17/11/2026), tarefas T-M01 a T-M06, T-Q02 (parte mobile), T-Q03 e T-O01 (parte mobile). Decisões em `docs/finalizacao-e2e/architecture-decisions.md`. Este arquivo só detalha a execução neste repositório.

## Contexto

Achados da auditoria (`docs/finalizacao-e2e/audit.md` §4, Mobile):

- O normalizador de erro segue um contrato (`{errorType, errorDescription}`) que o backend não envia.
- Um 401 só zera o token: o cache e a identidade continuam, e o próximo login pode ver dados do anterior.
- Telas mostram erro como se fosse lista vazia.
- Os filtros de Cavernas chamam uma rota admin-only, e o resultado é 403 para o aluno.
- `Alert.alert` não faz nada no web.
- O aluno não vê o status da inscrição.
- O token fica em `AsyncStorage`.

## Contrato real do backend (conferido com `curl` em 17/11)

| Caso | Corpo |
| --- | --- |
| Erro | `{ "message": "...", "timestamp": "...", "path": "..." }` |
| Sucesso | `{ "message", "data", "timestamp" }` |
| Lista | dentro de `data`: `{ data, _meta, _links }` |

Exemplos de erro:

- `POST /mobile/auth/login` com credenciais erradas → 401 `E-mail ou senha inválidos`.
- Token inválido em rota protegida → 401 `Token de acesso inválido`.
- Query desconhecida → 400 `property academyUnitId should not exist` (inglês, técnico).

## Requisitos e critérios de aceite

| Tarefa | Critério de aceite |
| --- | --- |
| T-M01 | A mensagem exibida vem do `message` do backend. Nenhum código é adivinhado pelo status: 401 não vira "Credenciais inválidas" e 409 não vira "Essa caverna já existe". `docs/backend-error-contract.md` descreve o formato real. |
| T-M02 (sessão) | Um 401 de requisição autenticada limpa o token, a identidade e o `queryClient` e leva ao login com "Sessão expirada". O 401 do próprio login continua sendo "E-mail ou senha inválidos". |
| T-M02 (telas) | As query keys pessoais incluem o `practitionerId`. Erro ≠ vazio em: próxima aula, cavernas próximas, perfil, seletor de aulas de `professor/validacoes` e busca da chamada. |
| T-M03 | Os filtros "Abertas agora" e "Aulas hoje" usam `units` do `GET /caves` público e `GET /classes?caveUnitId&from&to`. Nenhum rótulo vem do filtro selecionado. |
| T-M04 | O onboarding funciona no web, sem `Alert.alert` sem saída. Cadastro ok + login falho leva ao login com o e-mail preenchido. Sem `setTimeout` vazando nem navegação depois de desmontar. |
| T-M05 | O aluno vê o status da inscrição (pendente, confirmada, expirada) e as aulas em que já está. As aulas são buscadas com `from`/`to`. As mensagens de 409 aparecem. Ações concorrentes ficam bloqueadas. |
| T-M06 | O token fica no `expo-secure-store` no nativo e em `AsyncStorage`/`localStorage` no web. A hidratação e o `RoleGuard` continuam funcionando. |
| Certificado | `belt-info` envia `certificateId` em vez de `certificateUrl`. |
| T-Q03 | `jest-expo` + RNTL, com testes de carregando, erro, vazio e sucesso por tela tocada. Erro e vazio têm testes separados. Toda regressão é provada vermelha. |
| T-Q02 | Playwright contra o Expo web (`:8081`) e a API real (`:3000`), com e-mail único por execução, sem limpar o banco. |
| T-O01 | `ci.yaml` roda `typecheck`, `lint` e `test` em PR. |

## Decisões de execução (baixo risco)

- Os testes ficam fora de `src/app/`, porque o Expo Router trata todo arquivo ali como rota:
  - código que não é rota: `src/<área>/__tests__/<nome>-test.ts(x)`;
  - telas: `__tests__/app/<tela>-test.tsx`;
  - sufixo `-test.ts(x)`, reconhecido pelo preset `jest-expo`.
- O `cypress` foi removido: não havia config, specs nem imports (confirmado com grep).
- O aviso de "Sessão expirada" usa o `ErrorToast` global que já existe, sem rota nova.
- `nearby-gym` e `document-picker` também usam `Alert.alert` no onboarding web. Entram no T-M04 como extensão da mesma correção.

## Fora de escopo

D3, PO-1, PO-2 e PO-3 (pendentes de PO). Refresh e revogação de token. Qualquer mudança em `backend/` ou `caverna-desktop/`.
