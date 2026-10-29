# Revisão — recuperação e redefinição de senha

> Registro histórico de 25/10/2026, anterior à implementação da solicitação do link em 29/10/2026. Os achados abaixo não representam o estado atual da branch; consultar `implement.md` e `test.md`.

## Escopo

Comparação do `plan.md` desta demanda com o código presente na branch `feat/password-recovery` em 25/10/2026. O plano está marcado como **aguardando aprovação do PO**. Não há `blueprint.md`, `implement.md` ou `test.md` nesta pasta.

## Achados

| ID | Severidade | Categoria | Achado | Onde | Recomendação |
| --- | --- | --- | --- | --- | --- |
| R1 | 🔴 alto | Fluxo e critérios 1–2 | O botão “Esqueci minha senha” apenas mostra “A recuperação de senha será disponibilizada em breve.” Não há solicitação de e-mail, validação, confirmação genérica nem tratamento de 429/503 ou falha de rede. | `src/app/onboarding/(login)/login.tsx:53–57,155–163` | Após aprovação do plano, criar a tela de solicitação e conectar o botão a ela. |
| R2 | 🔴 alto | Rota e critérios 3–4, 7–8 | Não existe rota pública `/reset-password`, leitura de token, formulário de nova senha, estado de link inválido ou saudação definida pelo plano. | `src/app/` | Criar a rota e implementar os estados previstos; usar saudação genérica enquanto não houver origem segura para o nome. |
| R3 | 🔴 alto | API e critérios 5–7 | Não existe serviço de recuperação em `src/api/services/`; portanto, nenhuma das operações do backend é chamada e não há validação da senha nem confirmação de sucesso. | `src/api/services/` | Espelhar os DTOs e controller do backend e integrar as telas após aprovação. Enviar somente `{ token, password }` no reset. |
| R4 | 🟡 médio | Processo e evidências | O plano segue sem aprovação registrada, e faltam `blueprint.md`, `implement.md` e `test.md`. Não há evidência de fluxo web, deep link ou chamadas HTTP. | `.docs/password-recovery/` | Aprovar/refinar o plano antes de codificar e registrar implementação e testes conforme o fluxo SDD. |

## Conformidades verificadas

- O login existente usa `FormField`, `DefaultButton`, tokens de tema, área segura e textos em PT-BR.
- A busca nas rotas e nos serviços não encontrou manipulação de token nem persistência ou log de senha para este fluxo, pois ele ainda não existe.
- `bun run lint` e `bunx tsc --noEmit` passaram no código atual. Esses checks não validam os critérios funcionais da recuperação.

## Conclusão

**Plano não implementado; bloqueia considerar a demanda concluída ou pronta para merge.** É necessário resolver a aprovação e a decisão pendente sobre personalização do nome, implementar os fluxos e registrar testes em `test.md`.
