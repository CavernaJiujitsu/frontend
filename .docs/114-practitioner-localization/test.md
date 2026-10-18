# Testes — Card 114: localização do praticante

## Ambiente

- Frontend: Expo SDK 57, Bun, React Native 0.86.
- Não há runner de testes configurado no projeto; o Cypress está listado como dependência, mas não há configuração/specs para este fluxo.
- Backend local executado via Docker Compose.

## Checks do projeto

| Comando | Resultado |
| --- | --- |
| `bun run lint` | Passou. |
| `bunx tsc --noEmit` | Passou. |
| `git diff --check` | Passou. |
| `bunx expo-doctor` | Não executado: a primeira tentativa falhou porque Bun não conseguiu escrever no diretório temporário com `EROFS`. Não houve alteração de dependências ou configuração do Expo. |

## Teste direto da normalização

Comando executado:

```bash
bun -e 'import { normalizeCoordinates } from "./src/utils/location.ts"; const cases = [[-23.550520123456, -46.633308987654], [0, 0], [undefined, 1], [91, 0], [-90, 180]]; for (const [latitude, longitude] of cases) console.log(JSON.stringify({ latitude, longitude, normalized: normalizeCoordinates(latitude, longitude) }));'
```

Resultado observado:

- `-23.550520123456`, `-46.633308987654` → `-23.55052012`, `-46.63330899`.
- `0`, `0` → `0`, `0`.
- Latitude ausente → `null`.
- Latitude `91` → `null`.
- `-90`, `180` → preservados como limites válidos.

## Matriz funcional

| Caso | Esperado | Obtido |
| --- | --- | --- |
| POST com localização válida já no store | Envia `coordinates` aninhado com números normalizados | Confirmado no backend: HTTP 201 e resposta com latitude/longitude como decimals. |
| POST sem localização | Omite `coordinates` | Coberto por montagem condicional no código; não exercitado via HTTP nesta rodada. |
| PATCH após permissão | Usa `practitionerId` e envia latitude/longitude em par | Confirmado no backend: HTTP 200. |
| Negativos, zero, limites e precisão | Aceita valores válidos e limita a 8 casas | Passou no teste direto do helper. |
| Coordenada ausente/fora da faixa | Não envia payload inválido | Passou no teste direto do helper. |
| Falha do PATCH | Mantém GPS/ID, mostra retry e permite continuar sem sincronizar | Implementado; não houve simulação de erro no app. |
| Permissão negada/skip | Não envia coordenadas e navega sem GPS | Implementado; não exercitado no navegador, que não oferece o mesmo fluxo nativo de GPS. |
| Ausência de `practitionerId` | Não chama PATCH e permite continuar | Implementado; não exercitado diretamente. |
| Requests concorrentes/dupla navegação | Ações bloqueadas e navegação protegida | Implementado; confirmado por inspeção e typecheck. |

## Tentativas de validação funcional

### Expo Web

Comando:

```bash
bun run web
```

Resultado: a primeira tentativa no sandbox encerrou com `Error: connect EPERM 127.0.0.1:42269`. Com acesso ampliado, o Expo subiu em `http://localhost:8082/onboarding/start`; o fluxo avançou até `/onboarding/create-account` e o clique sem preenchimento exibiu “Informe seu nome completo.”.

### Backend e API

Comandos:

```bash
docker compose ps
curl -sS -o /tmp/caverna-check-response -w '%{http_code}' http://localhost:3000/health
curl -sS -o /tmp/caverna-check-response -w '%{http_code}' http://localhost:3000/api/v1/health
```

Resultados:

- `docker compose up -d`: containers `backend-api`, `backend-db`, `backend-nginx` e `backend-adminer` em execução; banco saudável.
- POST com `coordinates` normalizado: HTTP `201`, mensagem “Praticante criado”, latitude `-23.55052012` e longitude `-46.63330899` na resposta.
- POST com mais de 8 casas sem normalização: HTTP `400`, confirmando a necessidade do helper no frontend.
- PATCH com `{"latitude":0,"longitude":0}`: HTTP `200`, confirmando que zero real é aceito.
- GET do mesmo praticante: HTTP `200`, confirmando latitude `"0.00000000"` e longitude `"0.00000000"` persistidas.

Foi criado um praticante temporário de teste local para essa validação; ele foi removido ao final com DELETE HTTP 200, mantendo o usuário conforme o comportamento do endpoint.

## Como reproduzir a validação pendente

1. Iniciar o backend local em `backend/` com Docker disponível.
2. Iniciar o frontend com `bun run web` ou em um development build Expo.
3. Criar uma conta sem GPS e confirmar POST sem `coordinates`.
4. Conceder localização e confirmar PATCH em `/api/v1/practitioners/:id`.
5. Simular falha do PATCH, escolher retry e confirmar que não há novo POST.
6. Consultar o praticante por GET e verificar latitude/longitude persistidas.

## Cobertura restante

- `expo-doctor` permanece pendente por limitação de escrita temporária do ambiente.
- O fluxo nativo de permissão, retry visual após falha e o POST sem coordenadas precisam ser exercitados em um development build ou ambiente com backend/fixtures controlados.
