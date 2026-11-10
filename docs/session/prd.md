# Sessão do aluno

## Fonte única

`useAppStore.user.accessToken` é a única fonte de token do cliente. Login e cadastro estabelecem identidade por `startSession` em `src/auth/session.ts`; logout chama `endSession`. Não reintroduzir uma store paralela de credenciais.

Ao estabelecer outra sessão, limpar Query cache e substituir atomicamente os dados do usuário. Localização, permissão, declaração de faixa e perfil anterior não devem acompanhar a próxima conta. O practitionerId usado é o retornado pelo login, não um ID confiado ao formulário.

O login compartilhado também pode devolver conta autorizada de gestão sem practitionerId. O app do aluno verifica esse identificador antes de qualquer alteração de cache/store: informa a ausência de perfil de aluno e orienta usar a aplicação da gestão. Não abre a home com ID ausente, não inventa um practitioner nem cria perfil automaticamente.

## HTTP e expiração

- Axios lê o token atual e adiciona Bearer. Cadastro, login e solicitação de recuperação são públicos e não herdam a credencial da conta anterior.
- Sem sessão, remover Authorization em vez de reaproveitar um header antigo.
- Em 401 de request autenticada, encerrar a sessão apenas se o token enviado ainda for o token atual. Uma resposta atrasada da conta A não encerra a B.
- 401 de login público inválido não encerra outra sessão; 403 representa recusa de autorização e não apaga a sessão.
- `endSession` remove identidade/dados pessoais e Query cache; o layout privado encaminha ao login. Não adicionar redirects globais ao Axios.

Persistência e JWT de duas horas continuam com o contrato anterior. Não há refresh/revogação nova nesta correção. Os serviços preservam os contratos do backend.

## Verificação

Cobrir logout → cadastro de outra conta, logout/login, respostas 401 antigas/correntes, 403, cache pessoal e recarregamento. Evidências da regressão/correção em `.docs/78-session-isolation/`.
