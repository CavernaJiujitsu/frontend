# Testes mobile #97

Resultado final em 10/11/2026 (UTC). API Nest real em porta 3100 com banco isolado `caverna_http`; Expo Web em 8083; Chromium 154, viewport 390×844.

| Verificação | Resultado |
| --- | --- |
| `bun run lint` | Passou |
| `bunx tsc --noEmit` | Passou |
| `EXPO_NO_TELEMETRY=1 bunx expo export --platform web --output-dir /tmp/caverna-origin-web` | Passou; 39 rotas |
| Fluxo no Chromium com API real | 10 cenários passaram; `browser-evidence.json` |
| Backend coordenado | 300 unitários/integração e 65 E2E passaram; 12 respostas curl + privacidade |

## Cenários observados no navegador

1. GET de unidades com 503 controlado: mensagem explícita e retry recupera dados reais.
2. Nenhuma unidade pré-selecionada; confirmar fica desabilitado.
3. Busca sem resultado exibe vazio recuperável.
4. Caverna com 22 unidades: segunda página retorna duas unidades reais, além das primeiras vinte.
5. PUT com 503 controlado: mantém seleção e não avança.
6. Retry com PUT real bem-sucedido: navega à seleção de faixa.
7. Perfil consulta e mostra a origem persistida.
8. Logout/login reais: Perfil preserva exatamente a mesma origem.
9. PUT real com resposta retida pelo harness; voltar no histórico antes da resposta não causa redirecionamento tardio.
10. Deep link com caverna inválida: erro e retorno recuperáveis.

Contas/cavernas sintéticas criadas por HTTP e formulário real de cadastro. Somente falhas/atraso foram controlados no navegador, sem substituir os services da aplicação. Seleção, busca, paginação, gravação e nova sessão usam o backend real.

## Reprodução manual

1. Subir backend com migrations aplicadas em banco dedicado. Configurar EXPO_PUBLIC_API_URL para a API local e iniciar `EXPO_NO_TELEMETRY=1 bunx expo start --web --port 8083`.
2. Criar uma caverna de QA com pelo menos 22 unidades pela API. Criar aluno pela tela, escolher busca manual e buscar a caverna.
3. Verificar confirmação desabilitada, pesquisar termo inexistente, limpar busca e abrir segunda página. Escolher uma unidade e confirmar; conferir avanço para faixa.
4. Abrir Perfil; sair, entrar novamente e conferir a mesma origem. Uma visita em outra unidade não deve alterar esse campo (também coberto no E2E backend).
5. Simular falha de GET/PUT nas ferramentas de rede; verificar retry sem refazer cadastro nem perder seleção. Durante PUT, voltar pelo histórico e então liberar a resposta; a navegação atual deve ser preservada.
6. Abrir `/onboarding/origin-unit?cavernaId=invalid`; conferir erro e botão para escolher outra caverna.

No Chromium local foi necessário permitir `local-network-access` à origem localhost:8083 e aguardar hidratação React antes de preencher o primeiro formulário. O vConsole de desenvolvimento preexistente sobrepõe a navegação inferior; o teste usou Enter no botão real de Perfil. Não foi confundido com comportamento do build final.

Screenshots: `origin-selection.png` (erro controlado, escolha retida e página 2), `origin-profile.png` (origem após novo login). São dados sintéticos; não incluem token. Log de export local: `/workspace/scratch/97-web-export.log`; harness local: `/workspace/scratch/97-origin-ui.cjs`.

Sem execução nativa iOS/Android, sem nova suíte/runner no projeto e sem validação visual contra Figma. `expo-doctor` não foi usado como evidência deste incremento, pois dependências e configuração nativa não foram modificadas.
