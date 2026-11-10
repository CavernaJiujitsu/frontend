# Implementação — compatibilidade do #98 — [BE] Autorizar acessos por perfil, academia e professor responsável

Tipo: correção associada a lacuna de card existente, não card novo. A alteração é coordenada com o login compartilhado do backend.

- LoginResponse.practitionerId opcional espelha o DTO real.
- startSession lança StudentProfileRequiredError antes de limpar Query cache ou substituir identidade se faltar o aluno. Login/cadastro usam o mesmo ponto central.
- Login apresenta a orientação desse erro local conhecido pelo toast existente. Demais erros continuam no normalizador; não exibir mensagem arbitrária de servidor.
- Nenhuma home com ID fictício, perfil de aluno criado implicitamente, store paralela, dependência, configuração nativa ou alteração de layout.

A validação primeiro demonstrou que o normalizador genérico escondia a orientação local, mesmo com login 200. O tratamento tipado corrigiu esse comportamento sem alterar mensagens de outros erros. O screenshot aguarda a animação de 220 ms do toast antes da captura; vConsole preexistente aparece no desenvolvimento.

Base conferida: dev `47f22a6`, PR #25 `1ab3d29`; branch fix/98-management-login-compatibility. Depende do frontend #25 e acompanha backend com login/contextos. Não conclui o card inteiro nem implementa entrada da gestão no mobile; nativo e desktop continuam fora desta validação.
