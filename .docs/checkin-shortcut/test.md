# Correção do atalho de entrada

- Referência de escopo aprovado: `docs/tasks/improvements/frd-improvements-v1.md` e `blueprint-improvements-v1.md` (T-006). Entrada validada pelo administrador da caverna, sem confirmação de presença pelo aluno.
- O botão flutuante antes enviava sempre a `/inicio`; agora usa a inscrição da próxima aula para abrir `/entrada/[classId]` com `classId` e `enrollmentId`. Sem inscrição ou com erro de carregamento, explica a situação sem navegação falsa; o botão não sobrepõe a tela de entrada.
- A tela de entrada exibe dados da aula correspondente, QR/código para apresentar à administração e o estado de código já usado; não oferece botão de autoconfirmação.
- Testes automatizados: `bunx jest --runInBand --silent --forceExit`: 32 suítes e 232 testes passaram (incluindo 5 novos testes direcionados). `bun run typecheck` e `bunx expo export --platform web` passaram; `bun run lint` passou com um aviso preexistente de `require()` em `src/components/__tests__/schedule-screen-test.tsx`.
- Pendente: reteste visual e reserva real pelo usuário no app; o atalho precisa de uma inscrição elegível retornada na próxima aula para mostrar o código.
