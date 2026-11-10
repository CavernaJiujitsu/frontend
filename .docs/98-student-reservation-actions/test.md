# Testes — ações de reserva no app

10/11/2026. Expo SDK 57, Chromium real 390×844 em America/Sao_Paulo, Expo Web :8083 e backend :3100 com banco local dedicado `caverna_http`. Dados sintéticos criados via API. Nenhuma credencial/token incluído no repo.

| Check | Resultado |
| --- | --- |
| `bun run lint` | Passou |
| `bunx tsc --noEmit` | Passou |
| `EXPO_PUBLIC_API_URL=http://127.0.0.1:3100 EXPO_NO_TELEMETRY=1 bunx expo export --platform web --output-dir /tmp/caverna98-actions-web` | Passou, 39 rotas |
| Browser com app/backend reais | 8 verificações aprovadas, browser-evidence.json |
| Backend coordenado | 308 unitários/integração, 80 E2E e 24 verificações curl aprovados |

No executor, CLI Expo usou `__UNSAFE_EXPO_HOME_DIRECTORY=/tmp/caverna-expo-home`, pois /home/agent não é gravável. A primeira tentativa de exportação sem EXPO_PUBLIC_API_URL falhou explicitamente; repetida com a URL local correta e aprovada. Nenhum env/lockfile foi editado para contornar esses problemas. A consulta externa à documentação versionada do SDK foi bloqueada por política de rede; nenhuma API nova foi introduzida.

## Antes/depois e matriz de navegador

Antes: login real de aluno com reserva PENDING reproduziu o botão Confirmar presença e ausência de cancelamento.

| Caso | Resultado observado |
| --- | --- |
| PENDING | Cancelar inscrição e orientação de que o professor confirma presença; sem botão Confirmar |
| Falha controlada 503 no cancelamento | Reserva preservada, mutation volta ao estado disponível e permite retry; não houve falsa remoção |
| Request de cancelamento mantida pendente e cliques extras | Aguarde…, aria-disabled/busy; somente um envio ativo, Bearer da sessão atual |
| Sucesso real no cancelamento | 200 e refetch da home com estado vazio |
| Nova reserva pela agenda real | 201 com practitionerId do aluno e Bearer corretos; retorno para inicio |
| IN_PROGRESS | Fixture privilegiada local alterou somente status da própria inscrição; cancelamento real 200 e home vazia |
| Presença confirmada pelo professor real | Check-in feito por requisição de QA com identidade do responsável, não pelo browser do aluno; após reload, selo CONFIRMED e sem cancelar/confirmar |
| Rede do browser do aluno | Zero requests para check-in durante todo o fluxo |

Falha temporária 503 foi uma resposta controlada pelo teste; demais serviços e respostas vieram da API real, sem mock do app. Alert existente não tem renderização nativa na execução Web: validada recuperação/retry, não aparência de popup nativo. Captura confirmed.png inspecionada; somente dados sintéticos, com vConsole de desenvolvimento preexistente.

## Reprodução e limites

Subir backend coordenado, criar aluno e aula futura por API, iniciar Expo Web com EXPO_PUBLIC_API_URL local. Entrar, reservar pela agenda, voltar à home e cancelar. Repetir com falha temporária e request lenta; depois confirmar a presença como professor e recarregar o app: somente selo/orientação. Curl/401/403 e comandos de API registrados em backend `.docs/98-enrollment-ownership/test.md`.

Sem framework de teste novo (projeto não possui runner configurado); Playwright externo ao repo foi reutilizado. Sem execução iOS/Android, revisão visual Figma ou deploy. Política de gestão e privacidade de outras leituras permanecem pendentes.
