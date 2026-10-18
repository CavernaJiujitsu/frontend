# Blueprint — Card 114: localização do praticante

## Inventário

| Peça | Local | Uso no plano |
| --- | --- | --- |
| Serviço de praticante | `src/api/services/practitioners.service.ts` | Criar tipos de coordenadas, adicionar `updatePractitionerLocation` e modelar latitude/longitude da resposta. |
| Rotas | `src/api/endpoints/routes.ts` | Reutilizar `routes.practitioners` e adicionar a rota parametrizada do praticante. |
| Tela de cadastro | `src/app/onboarding/(create-account)/create-account.tsx` | Reutilizar localização já existente no Zustand ao montar o POST; omitir coordenadas quando inválidas. |
| Tela de permissão | `src/app/onboarding/(location-permission)/location-permission.tsx` | Coordenar captura, PATCH, retry, continuação sem sincronizar e navegação única. |
| Hook de localização | `src/hooks/use-location-permission.ts` | Preservar solicitação automática/manual, mas aguardar callback assíncrono para o estado de solicitação representar todo o fluxo. |
| Ações da permissão | `src/components/onboarding/location-permission/location-permission-actions.tsx` | Reutilizar `DefaultButton`; receber estado de salvamento para bloquear ações e refletir “Salvando localização...”. |
| Estado global | `src/store/useAppStore.ts` | Reutilizar `location`, `locationPermissionGranted` e `practitionerId`; não adicionar senha nem duplicar coordenadas normalizadas. |
| Mensagens de erro | `src/api/utils/backend-message.ts` | Reutilizar no erro de PATCH, mantendo o padrão existente da tela. |
| Tokens e estilos | `src/constants/theme.ts`, `src/styles/onboarding/location-permission.style.ts` | Reutilizar estilos existentes; adicionar apenas estilo mínimo para estado de erro se necessário. |
| Busca de cavernas | `src/app/onboarding/(nearby-gym)/nearby-gym.tsx` | Não alterar; continuará usando o GPS do store para a consulta de proximidade. |

## Reuso e alternativas avaliadas

### Atualização da localização

- Escolhida: função dedicada `updatePractitionerLocation(practitionerId, payload)` no serviço de praticantes, usando `apiClient.patch`, `routes` e `unwrap<ApiEnvelope>`.
- Evitada: usar `axios.patch` diretamente na tela, pois duplicaria convenções de API e deixaria o contrato espalhado na UI.
- Evitada: alterar `updatePractitioner` genérico, pois não existe hoje e a operação de localização precisa exigir o par de coordenadas.

### Normalização e validação

- Escolhida: helper puro em `src/utils/location.ts`, compartilhado pelo POST e PATCH.
- O helper validará `Number.isFinite`, latitude entre -90/90, longitude entre -180/180 e a presença explícita dos dois valores; depois aplicará `toFixed(8)`.
- Evitada: `if (latitude && longitude)`, pois rejeitaria zero válido.
- Evitada: enviar `LocationObject` completo, pois o backend só aceita o contrato numérico.

### Fluxo de erro/retry

- Escolhida: manter a localização capturada em estado local da tela e no Zustand; em erro do PATCH, `Alert` oferecerá “Tentar novamente” e “Continuar sem sincronizar”. O retry chamará apenas a operação de atualização.
- O skip inicial continuará navegando sem request.
- Evitada: solicitar GPS novamente no retry ou refazer o POST, pois a conta e o `practitionerId` já existem.

### Contrato assíncrono do hook

- Escolhida: aceitar callback `void | Promise<void>` e fazer `await onPermissionGranted?.(location)` dentro do hook.
- A tela manterá `isSavingLocation` separado de `isRequestingPermission`; o hook não será responsável por API ou navegação.

## Desenho final

### Arquivos alterados

- `src/api/services/practitioners.service.ts`
  - `Practitioner` ganha `latitude: string | null` e `longitude: string | null`.
  - `CreatePractitionerPayload` ganha `coordinates?` com par numérico.
  - Novo `PractitionerLocationPayload` exige latitude e longitude.
  - Novo `updatePractitionerLocation` usa `PATCH /api/v1/practitioners/:id`.
- `src/api/endpoints/routes.ts`
  - Novo `practitioner(id)` apontando para `/api/v1/practitioners/:id`.
- `src/utils/location.ts`
  - Função pura para normalizar e validar um par de coordenadas.
- `src/app/onboarding/(create-account)/create-account.tsx`
  - Ler `user.location` existente.
  - Montar `coordinates` somente quando o helper retornar par válido.
- `src/hooks/use-location-permission.ts`
  - Aguardar callbacks assíncronos; manter proteção contra solicitação concorrente.
- `src/components/onboarding/location-permission/location-permission-actions.tsx`
  - Receber `isSavingLocation` e combinar com `isRequestingPermission` para desabilitar ações; exibir rótulo coerente.
- `src/app/onboarding/(location-permission)/location-permission.tsx`
  - Ler `practitionerId`, capturar localização, normalizar, salvar no store, chamar PATCH, controlar salvamento e navegação.
  - Em erro, usar `backendMessage` e oferecer retry/continuação explícita.

### Estados da tela de permissão

| Estado | Ações | Resultado |
| --- | --- | --- |
| Solicitando permissão | Botão e skip desabilitados | Aguarda autorização/captura. |
| Salvando localização | Botão e skip desabilitados; botão mostra “Salvando localização...” | Aguarda PATCH. |
| Sucesso | Sem alerta | Marca permissão, navega uma vez para nearby-gym. |
| Erro de PATCH | Alert com retry/continuar | Retry usa o mesmo par; continuar navega sem afirmar persistência. |
| Permissão negada/captura falha | Alert atual | Permite tentar novamente ou skip; nenhum payload artificial. |
| Sem `practitionerId` | Alert orientativo | Não chama PATCH; permite seguir sem GPS. |

### Contrato consumido

POST:

```ts
{ user: CreateUser; coordinates?: { latitude: number; longitude: number } }
```

PATCH:

```ts
PATCH /api/v1/practitioners/:id
{ latitude: number; longitude: number }
```

Os nomes seguem `CreatePractitionerDto`, `CoordinatesDto` e `UpdatePractitionerDto` do backend.

## Duplicidades evitadas

- Não criar novo store para coordenadas; o `user.location` atual continua sendo a fonte do GPS fresco.
- Não criar nova tela ou novo fluxo visual de permissão.
- Não duplicar busca de cavernas nem alterar seus filtros.
- Não manter senha em estado global.
- Não adicionar alias para o formato antigo de latitude/longitude no POST.

## Riscos e limites

- A tela de cadastro normalmente chega antes da permissão, então o caminho principal continuará enviando apenas `user`; o caminho com coordenadas existentes ficará coberto sem mudar a ordem do onboarding.
- A persistência não será inferida pela consulta de cavernas; o serviço retornará o praticante atualizado, mas a confirmação completa por GET fica para a etapa de testes.
- A atualização do hook altera apenas a espera do callback e não a API do Expo; `expo-location` já está instalado e não haverá dependência nova.
