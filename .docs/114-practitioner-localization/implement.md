# Implementação — Card 114: localização do praticante

## Resultado

Implementado o envio de coordenadas do praticante no POST quando já existe uma localização válida e o envio via PATCH após a permissão de localização no onboarding.

## Arquivos alterados

- `src/api/endpoints/routes.ts`: rota parametrizada de praticante.
- `src/api/services/practitioners.service.ts`: tipos de coordenadas, campos de resposta e `updatePractitionerLocation`.
- `src/utils/location.ts`: validação de faixa, finitude e normalização para 8 casas decimais.
- `src/app/onboarding/(create-account)/create-account.tsx`: inclusão condicional de `coordinates` no POST.
- `src/hooks/use-location-permission.ts`: callback de permissão pode ser assíncrono e é aguardado.
- `src/app/onboarding/(location-permission)/location-permission.tsx`: PATCH após captura, bloqueio durante salvamento, navegação única, retry e continuação explícita sem sincronização.
- `src/components/onboarding/location-permission/location-permission-actions.tsx`: estado visual e bloqueio durante o salvamento.

## Decisões e desvios

- Seguido o DTO atualizado do backend: o POST usa `coordinates` aninhado. O exemplo antigo de campos soltos do card não foi usado.
- A localização é guardada no Zustand assim que capturada, antes do PATCH, preservando o GPS em caso de falha de rede.
- O retry reutiliza a mesma localização capturada e o mesmo `practitionerId`; não solicita GPS novamente nem refaz o cadastro.
- O skip e a opção “Continuar sem sincronizar” navegam para a busca, mas não afirmam que o backend salvou a localização.

## Validação executada

- `bun run lint` — passou.
- `bunx tsc --noEmit` — passou.

## Pendências

- Ainda falta executar a etapa de testes do fluxo completo, incluindo verificação real de POST/PATCH, permissão negada, retry e confirmação da persistência por GET.
