# Testes — isolamento de sessão

Resultado: **passou** em 09/11/2026, America/Sao_Paulo, para os cenários abaixo.

## Ambiente

Expo SDK 57, Bun 1.4.0, Chromium instalado e Playwright usado fora do repositório como ferramenta de verificação. Nenhum runner/framework/config/dependência foi acrescentado ao projeto.
API NestJS real em 3100, banco isolado `caverna_http` em Postgres 17/porta 55432; app em `http://localhost:8083`. Apenas contas de QA criadas pela API. O contexto de navegador recebeu permissão de acesso à rede local para essa origem de teste; CORS da API foi configurado para a mesma origem.

## Checks

| Comando | Resultado |
| --- | --- |
| `EXPO_NO_TELEMETRY=1 bun run lint` | Passou |
| `bunx tsc --noEmit` | Passou |
| `EXPO_PUBLIC_API_URL=http://127.0.0.1:3100 bunx expo export --platform web --output-dir /tmp/caverna-session-web` | Passou, 38 rotas estáticas |
| `git diff --check` | Passou |

`expo-doctor` não foi repetido: dependências e config Expo não mudaram. A inicialização do dev server registrou falha do DevTools opcional ao criar cache fora da área gravável e usou fallback; app/export funcionaram.

## Reprodução da regressão

O navegador executou um bundle dos módulos originais de Axios/stores/Query contra a API real. Após login A → reset/logout → cadastro/login B, `GET /profiles/me` devolveu a conta A. `before.json` registra `expectedSecondAccount: false` e `receivedPreviousAccount: true`. Isso confirma uma divergência real de identidade, além da inspeção estática.

## Dez verificações da correção

O Chromium executou os módulos reais da aplicação (AppStore, QueryClient, Axios e ações de sessão) com duas contas sintéticas da API. Respostas 401 atrasadas/correntes foram controladas na fronteira HTTP, mantendo o restante das consultas reais. `browser-cases.json` contém os resultados sem credenciais.

| Caso | Resultado observado |
| --- | --- |
| Perfil A com sessão A | API retornou a própria conta |
| Logout | Token, practitionerId e Query cache removidos |
| Entrada/cadastro B | Sem declaração anterior; perfil retornou B |
| 401 atrasado de A depois de entrar em B | B permaneceu autenticada |
| Consulta após esse 401 | Perfil B continuou acessível |
| B tenta editar A | API retornou 403 sem encerrar B |
| Login público inválido | 401 sem apagar a sessão já ativa |
| Encerramento condicionado ao token A quando B está ativa | B preservada |
| 401 da sessão atual | Identidade, perfil, localização, validação e Query cache removidos |
| Recarregar | Persistência restaurou a conta correta e a API confirmou o perfil |

## Fluxo pelas telas reais

Viewport 390 × 844. Navegação e preenchimento ocorreram na interface, com os seguintes requests reais:

1. Criar fixture A por HTTP; preencher login do app → `POST /auth/login` 200 → `/inicio`.
2. Abrir Perfil (também testado por teclado) → `/profiles/me` 200 → “Sair da conta” → login.
3. “Criar conta” → entrada → apresentação → “Pular” → formulário de cadastro B.
4. Enviar nome/e-mail/senha B → `POST /practitioners` 201 → `POST /auth/login` 200 → permissão de localização.
5. Escolher busca manual → `/onboarding/nearby-gym` → `GET /caves` 200.
6. Comparar a credencial do último request ao token da sessão atual: usou B, não A. `ui-result.json`: `firstAndSecondDiffer: true`, `nextRequestUsesCurrent: true`, `nextRequestUsesPrevious: false`.

Screenshot: `onboarding-after-switch.png`.

## Reprodução manual

Subir backend com `FRONTEND_URL` apontando para a origem do app, definir EXPO_PUBLIC_API_URL e iniciar Expo web. Usar duas contas sintéticas distintas e executar os passos acima sem recarregar entre logout e cadastro B; recarregar antes do cadastro apagaria a store paralela antiga e esconderia a regressão.

Para autorização da API, a rodada backend #116 validou via curl: `PATCH /practitioners/<proprio-id>` com token 200; mesmo PATCH para outro aluno 403; sem token 401; `GET /practitioners/me/trail` com/sem token 200/401. Os nomes e contratos continuam os mesmos.

Os testes aguardam hidratação antes de preencher o formulário. Tentativas iniciais antes desse ponto perderam preenchimento, sem constituir defeito do formulário. O vConsole de desenvolvimento sobrepunha o botão Perfil em viewport pequeno; a navegação por teclado funcionou e esse overlay não está na exportação de produção sem opt-in.

## Limites

iOS/Android não exercitados. Sem alteração de dependência nativa. Scripts temporários em `/workspace/scratch/78-*` não são parte do produto; evidências sanitizadas estão versionadas. Não foram enviados e-mails nem usados dados de produção.
