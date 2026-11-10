# Testes — #98 — [BE] Autorizar acessos por perfil, academia e professor responsável

Validação em 10/11/2026 (UTC), API real local em 3100 e banco separado caverna_http; Expo Web em 8083; Chromium 154, viewport 390×844. Sem dados reais ou credenciais de produção.

| Verificação | Resultado |
| --- | --- |
| `bun run lint` | Passou |
| `bunx tsc --noEmit` | Passou |
| `EXPO_NO_TELEMETRY=1 bunx expo export --platform web --output-dir /tmp/caverna98-web` | Passou; 39 rotas |
| Helper real em bundle de navegador, com API real | 5 verificações passaram; core-evidence.json |
| Interface real de login/perfil | 5 verificações passaram; browser-evidence.json |

## Sessão/cache

1. Login da conta docente sem aluno realmente omite practitionerId.
2. Tentar estabelecer essa sessão lança erro e preserva integralmente identidade de aluno já ativa.
3. O cache privado do aluno anterior é preservado na tentativa recusada, como nas falhas de login já existentes.
4. Após logout, a resposta sem aluno não estabelece sessão incompleta.
5. Login do aluno continua estabelecendo o practitioner exato e limpando cache da sessão anterior normalmente.

O bundle de QA foi gerado fora do repo com os módulos reais do app e carregado em página de teste. Não foi criado runner/framework no projeto nem substituído o helper por mock. Scripts locais: /workspace/scratch/98-session-core.cjs e 98-session.bundle.js.

## Interface

1. Credenciais docentes aceitas pela API (200), sem abrir a home de aluno.
2. Orientação visível sobre ausência de perfil de aluno; permanece no login.
3. Entrar como aluno depois dessa tentativa abre inicio normalmente com conta correta.
4. Perfil real do aluno permanece consultável.
5. A orientação também aparece quando havia aluno autenticado antes de navegar ao login e tentar a conta docente.

Antes do tratamento tipado, o navegador mostrou a mensagem genérica `Algo deu errado. Tente novamente em instantes.` em vez da orientação; a falha foi reproduzida, não presumida. Após corrigir, texto e navegação foram verificados. Captura em management-login-guidance.png, com conta sintética e sem token.

## Reprodução e limites

Subir backend coordenado com as migrations da dependência; preparar aluno e conta docente autorizada no banco de QA; configurar EXPO_PUBLIC_API_URL e iniciar Expo Web. Na tela login, entrar como docente sem aluno e verificar a orientação/permanência. Em seguida entrar como aluno, abrir Perfil e conferir a identidade. Nunca criar practitioner artificial para liberar gestão.

O navegador local exige permissão local-network-access, e o harness aguarda hidratação antes de preencher. A store usa AsyncStorage/IndexedDB na Web; as verificações de integridade foram feitas no helper real, sem pressupor localStorage. vConsole é preexistente e sobrepõe parte inferior no modo de desenvolvimento.

Sem execução iOS/Android nem revisão Figma. Dependências/configuração nativa não mudaram; expo-doctor não é usado como evidência. O card completo segue Fazendo, pois ainda faltam policies legadas e integração desktop.
