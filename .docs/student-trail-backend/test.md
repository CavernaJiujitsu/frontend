# Teste — integração da trilha com o backend

## Ambiente

- Frontend Expo SDK 57, Bun 1.4.0.
- Backend local iniciado com `docker compose up -d` em `../backend`.
- API acessível pelo nginx local em `http://localhost:4000`.
- Usuário de desenvolvimento do backend: `dev-profile@caverna.test`.
- O usuário local não possui faixa ativa, permitindo validar o estado de
  avaliação pendente.

## Checks do projeto

| Comando | Resultado |
|---|---|
| `bun run lint` | Passou sem erros ou warnings após remover um import não utilizado |
| `bunx tsc --noEmit` | Passou |
| `git diff --check` | Passou |
| `bunx expo-doctor` | Não executou: Bun retornou `EROFS accessing temporary directory`; a tentativa com `BUN_TMPDIR=/tmp/caverna-bun-tmp` teve o mesmo bloqueio |
| `bunx expo export --platform web --output-dir /tmp/caverna-student-trail-export` | Não concluiu no ambiente; Metro iniciou, mas o processo foi interrompido após permanecer sem progresso observável |

Não há runner de testes frontend configurado no projeto. Não foram instalados
nem criados novos specs.

## Testes do backend relacionados ao contrato

Comando:

```bash
bun test src/practitioners/tests/trail.service.spec.ts
```

Resultado: 7 testes passaram, 0 falharam. Foram cobertos praticante inexistente,
ausência de faixa, faixa sem trilha, trilha sem progresso, progresso calculado,
trilha completa e movimentos opcionais.

## Evidência dos endpoints

Sem autenticação, os dois endpoints retornaram HTTP 401 e a mensagem de token
inválido, confirmando a proteção JWT:

```text
GET /api/v1/practitioners/me/trail → 401
GET /api/v1/profiles/me           → 401
```

Após login local com a conta de desenvolvimento, foram chamadas exatamente as
rotas usadas pelos services do frontend:

```text
POST /api/v1/auth/login                         → 200
GET  /api/v1/practitioners/me/trail             → 200
GET  /api/v1/profiles/me                        → 200
```

Trecho relevante da resposta da trilha:

```json
{
  "noActiveBelt": true,
  "practitionerId": "2361d831-2d69-477b-9fad-39a9126ffeb5",
  "message": "Avaliação pendente: você ainda não possui uma faixa ativa."
}
```

Trecho relevante do perfil:

```json
{
  "activeBelt": null,
  "trailStats": null,
  "statistics": {
    "hoursTrained": 0,
    "classesCompleted": 0,
    "trainingStreak": 0
  }
}
```

Os tokens não foram registrados neste artefato.

## Matriz de casos

| Caso | Esperado | Obtido |
|---|---|---|
| Trilha sem autenticação | Erro 401 tratado pela camada de API | 401 confirmado no curl |
| Perfil sem autenticação | Erro 401 tratado pela camada de API | 401 confirmado no curl |
| Usuário sem faixa ativa | Tela de avaliação pendente sem etapas mockadas | Contrato real retornou `noActiveBelt: true`; fluxo implementado |
| Perfil sem faixa ativa | `activeBelt`/`trailStats` nulos, sem converter ausência em zero | Contrato real retornou ambos nulos; fluxo implementado |
| Trilha ativa | Etapas, percentuais e movimentos do backend | Tipos e mapeamentos compilados; não exercitado com fixture ativa disponível |
| Detalhe de etapa inválida | Mensagem de etapa indisponível | Fluxo implementado; exportação visual não concluiu |
| Erro/retry | Mensagem e nova chamada sem fallback mock | Fluxo implementado; não exercitado visualmente por falta de sessão autenticada no app |
| Descrição nula | Campo oculto | Implementado e coberto pelo typecheck |

## Como reproduzir

1. Iniciar o backend em `../backend` com `docker compose up -d`.
2. Iniciar o frontend com `bunx expo start --web` e configurar
   `EXPO_PUBLIC_API_URL=http://localhost:4000`.
3. Usar uma sessão autenticada no app quando o fluxo de login frontend estiver
   disponível; a tela `/trilha` deve chamar `/api/v1/practitioners/me/trail`.
4. Para validar o contrato diretamente, fazer login no backend local e usar o
   Bearer token nas duas requisições descritas acima.

## Cobertura pendente

- Não foi possível exercitar visualmente o app com uma sessão autenticada porque
  a tela de login frontend ainda é demonstrativa e não persiste JWT.
- Não havia usuário local com faixa ativa para validar visualmente as etapas e o
  detalhe completo; os testes do backend cobrem o cálculo e os estados ativos.
- `expo-doctor` e exportação web ficaram limitados pelo ambiente descrito acima.

## Diagnóstico e correção do 401

O erro `Token de acesso inválido` foi reproduzido porque o frontend não tinha
fluxo de login real, não persistia `accessToken` e o `apiClient` não enviava o
header `Authorization`. A correção adicionou:

- `POST /api/v1/auth/login` no service de autenticação;
- persistência do token na store persistida;
- interceptor que envia `Authorization: Bearer <token>`;
- login automático após criação de conta, antes do fluxo de localização.

Após a correção, `bun run lint`, `bunx tsc --noEmit` e `git diff --check`
passaram. O backend já havia confirmado login HTTP 200 e as rotas de trilha e
perfil HTTP 200 com Bearer válido.

Foi adicionada uma proteção adicional: as queries privadas só são habilitadas
com `practitionerId` e `accessToken`; respostas 401 limpam o token persistido e
as telas oferecem retorno ao login. Isso evita repetir chamadas sem
autorização quando a sessão antiga estiver inválida.
