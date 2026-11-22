# Relatório de testes — melhorias 001–003 (app)

- `bun run typecheck`: passou.
- `bun run lint`: passou com um aviso já existente em `schedule-screen-test.tsx` (`require()`).
- `bunx jest --runInBand --silent --forceExit`: 30 suítes/227 testes passaram. `--forceExit` foi usado por aviso de handle aberto no Jest; isto não equivale a afirmar ausência de handles.
- `bunx expo export --platform web`: passou, incluindo `/entrada/[classId]`.
- Perfil: teste de seleção explícita entre dois endereços e envio somente do escolhido; solicitação de link confirma e-mail e aciona saída. Sessão: teste separado comprova remoção de token/cache e navegação à confirmação.
- QR: teste verifica matriz QR gerada do mesmo código exibido ao aluno.
- Refinamento visual do perfil: notificações `notify()` exibidas como toast global não bloqueante no app (sem `window.alert`), com sucesso/erro/informativo, botão de fechar e cores da identidade visual. Resultados de endereço agora formam uma lista com seleção visível, indicação de escolha e resumo antes de salvar; mudar a busca limpa os resultados anteriores.
- Cavernas: teste de origem padrão com endereço salvo, troca explícita para coordenadas do dispositivo e recálculo quando as coordenadas do perfil mudam. Sem endereço salvo, mantém origem do dispositivo. Verificação no banco local do usuário informado: endereço em `practitioners.address`; Franco da Rocha até Centro-SP e Matriz ≈ 27,0 km, diferente dos ≈ 11,8 km exibidos antes porque o app priorizava as coordenadas do dispositivo.

Pendente: reteste visual em dispositivo e navegador com backend e credenciais reais de homologação/produção.

## Correção da rota de entrada em dev (20/11/2026)

- O `404 Cannot GET /entries/classes/.../code` foi causado pela ausência de `/api/v1` na URL montada pelo app. `getEntryCode` agora usa a rota versionada compartilhada; teste de serviço confirma o caminho completo e a leitura do envelope.
- `bun run typecheck`: passou; `bun run lint`: passou com o aviso preexistente em `schedule-screen-test.tsx`.
- `bunx jest --runInBand --silent --forceExit`: 33 suítes / 233 testes passaram; `--forceExit` continua necessário por handle aberto não diagnosticado nesta correção.
- `bunx expo export --platform web`: passou. Enviar a `dev` não publica automaticamente o frontend nem aplica migrations no banco; reteste no ambiente publicado segue pendente.
