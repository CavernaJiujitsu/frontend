# Blueprint de sessão

## Reuso e desenho

- `useAppStore.user.accessToken` já persiste o token e controla a área privada. Será a fonte única de identidade da aplicação.
- `useSessionStore` tem apenas dois consumidores e duplica o mesmo token. Remover os consumidores e o arquivo, sem criar uma terceira store.
- `src/auth/session.ts`: coordenar startSession/endSession. Limpar Query cache e dados anteriores antes de estabelecer a nova identidade atomicamente no AppStore. Encerramento pode exigir token esperado para ignorar respostas antigas.
- `axios-bootstrap.ts`: ler token do AppStore; anexar Bearer a requests autenticadas; login/cadastro/recuperação não herdam credencial antiga. Em 401, comparar o token da request ao atual antes de limpar a sessão.
- Login e cadastro usam startSession; Perfil usa endSession. Não espalhar novas chamadas de clear/reset pela UI.
- Reusar QueryClient e layout privado para cancelamento/invalidação e redirecionamento. Sem trocar rotas nem componentes visuais.

## Alternativas e riscos

Sincronizar permanentemente duas stores mantém o risco de divergência e foi rejeitado. Apagar só accessToken deixa perfil/localização/validação antigos e foi rejeitado. Derrubar sessão em todo 401 quebra uma conta nova por resposta atrasada da anterior.

Cancelar/remover queries evita repovoar cache pela conta anterior; as chaves pessoais já incluem practitionerId. Cuidado com efeitos de navegação durante troca: identidade será escrita em uma única atualização Zustand.

## Contrato e verificação

Backend auth.controller/LoginResponseDto/login: accessToken, tokenType Bearer, expiresIn, userId e practitionerId; não muda. Backend #116 exige Bearer nos comandos/personal mutations corrigidos.

Antes do código: reproduzir logout → cadastro de outra conta e observar o token do request. Depois: executar esse ciclo novamente, logout/login, 401 atrasado, 401 corrente, 403 e reload. Usar Playwright como ferramenta externa de verificação com Chromium instalado, sem dependência/config de runner no repo. Expo SDK 57 e referência oficial de parâmetros/roteamento consultados.
