# Plano aprovado em conversa — melhorias 001–003

Origem: `docs/tasks/improvements/` e decisões confirmadas pelo usuário. Cliente é Expo Router; backend detém autorização e dados.

1. Perfil: atualizar nome/e-mail e buscar endereço; exigir escolha explícita do resultado antes de salvar. Mostrar endereço escolhido ao reabrir.
2. Senha: reaproveitar telas de recuperação; solicitação autenticada com e-mail sai da sessão e abre confirmação pública. Não redirecionar automaticamente após um minuto. Link redefine senha e exige novo login.
3. Entrada: exibir código e QR da inscrição válida; admin de caverna confere no desktop, sem executar presença da chamada.
4. Testes de comportamento, erros e regressões; lint, typecheck e build.

Não incluir senha de funcionário, chaves em `EXPO_PUBLIC_*`, nem afirmar que logout revoga JWT emitido.
