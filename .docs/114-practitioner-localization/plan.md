# Plano — Card 114: localização do praticante no cadastro e após permissão

## Contexto

O onboarding cria o praticante antes de solicitar a localização. A tela de permissão já obtém um `LocationObject`, guarda o GPS no Zustand e navega para a escolha de caverna, mas ainda não persiste as coordenadas no backend.

O backend atualizado define `CreatePractitionerDto.coordinates` como objeto opcional com `latitude` e `longitude`. O `UpdatePractitionerDto` existente recebe `latitude` e `longitude` diretamente no PATCH, sempre em par.

## Objetivo

Enviar a localização válida do praticante ao backend durante o cadastro quando ela já estiver disponível e, no fluxo atual, persistir a localização obtida após a permissão usando o `practitionerId` criado, sem alterar o fluxo visual ou criar uma nova conta.

## Requisitos funcionais

1. Atualizar os tipos do serviço de praticantes para refletir `coordinates?: { latitude: number; longitude: number }` no payload de criação e os campos de localização na resposta sem converter decimals de resposta à força.
2. Adicionar uma operação de atualização de localização que envie `PATCH /api/v1/practitioners/:id` com latitude e longitude numéricas em par.
3. Normalizar latitude e longitude para no máximo 8 casas decimais, validar finitude e os intervalos geográficos antes do envio. Zero deve ser aceito.
4. No cadastro, omitir `coordinates` quando não houver uma localização válida disponível.
5. Após a permissão ser concedida, extrair somente `location.coords.latitude` e `location.coords.longitude`, persistir no praticante correto e só então seguir para `/onboarding/nearby-gym`.
6. Separar o estado de solicitação de permissão do estado de salvamento da localização, evitando requests concorrentes e navegação dupla.
7. Em falha do PATCH, manter `practitionerId` e GPS no store, mostrar mensagem de erro em PT-BR e permitir tentar novamente a persistência sem repetir cadastro ou solicitar GPS novamente.
8. Permissão negada, captura indisponível ou ausência de `practitionerId` devem permitir continuar sem GPS e não devem enviar valores artificiais ou request inválida.

## Requisitos não funcionais

- Seguir as convenções de `frontend/AGENTS.md`, `unwrap<ApiEnvelope>`, `backendMessage` e Expo Router.
- Não adicionar dependências nem alterar o backend.
- Comentários de código em inglês e textos visíveis ao usuário em PT-BR.
- Manter compatibilidade com iOS, Android e o comportamento existente da escolha da caverna.

## Regras de negócio

- Coordenadas são opcionais na criação e obrigatórias em par quando enviadas (`backend/src/practitioners/dto/create-practitioner.dto.ts` e `coordinates.dto.ts`).
- O PATCH aceita atualização parcial, mas latitude e longitude devem ser enviadas juntas (`backend/src/practitioners/dto/update-practitioner.dto.ts`).
- A localização persistida não substitui o GPS fresco usado nas consultas de proximidade.
- A senha não deve ser guardada no store para postergar o cadastro.

## Contrato de API consumido

### POST `/api/v1/practitioners`

```json
{
  "user": {
    "name": "Aluno Exemplo",
    "email": "aluno.exemplo@example.com",
    "password": "senha-exemplo-123"
  },
  "coordinates": {
    "latitude": -23.55052,
    "longitude": -46.633308
  }
}
```

`coordinates` é omitido quando não há um par válido.

### PATCH `/api/v1/practitioners/:id`

```json
{
  "latitude": -23.55052,
  "longitude": -46.633308
}
```

## Decisões de refinamento

| Tema | Decisão | Motivo |
| --- | --- | --- |
| Formato do POST | Usar `coordinates` aninhado | É o DTO atualizado do backend; o exemplo de campos soltos no card está desatualizado. |
| Momento do PATCH | Após sucesso da captura e antes de navegar | Confirma a persistência antes de indicar que o fluxo foi sincronizado. |
| Falha do PATCH | Exibir erro, manter dados e oferecer retry/continuar | A conta já existe e não deve ser recriada; continuar sem sincronizar precisa ser explícito. |
| Precisão | `Number(value.toFixed(8))` após validar faixa e finitude | Alinha com `maxDecimalPlaces: 8`, preservando negativos e zero. |
| Fluxo sem ID | Não chamar API e orientar retomada/continuar | Evita PATCH para `undefined` e criação duplicada. |

## Fora de escopo

- Implementação ou alteração do backend/card #113.
- Alteração de schema, migration, geocodificação ou mapas.
- Rastreamento contínuo/background.
- Mudança da unidade de origem ou novo fluxo visual.
- Guardar senha para reenviar o POST depois.

## Critérios de aceite

1. O tipo do POST aceita `coordinates` opcional na raiz e o serviço envia o formato do DTO atual.
2. Com localização válida, o POST inclui latitude e longitude numéricas; sem localização, omite `coordinates`.
3. Após conceder localização no onboarding atual, o PATCH usa o `practitionerId` correto e envia o par numérico.
4. Coordenadas negativas, zero e valores com mais de 8 casas são tratados corretamente.
5. Permissão negada, captura falha ou localização incompleta não gera coordenadas artificiais e permite continuar.
6. Falha HTTP mostra mensagem adequada, preserva conta/ID/GPS e permite retry do PATCH sem novo cadastro.
7. Não há requests concorrentes nem dupla navegação durante o salvamento.
8. Ausência de `practitionerId` não dispara request inválida.
9. Cadastro, reserva, busca e escolha da caverna mantêm o comportamento atual.

## Estratégia de teste

- Testes unitários para normalização/validação e montagem dos payloads POST/PATCH.
- Testes do serviço para verificar rota, envelope e payload de atualização.
- Testes do fluxo da tela para sucesso, erro com retry, permissão negada, skip, ausência de ID e prevenção de concorrência.
- `bunx expo lint` e `bunx tsc --noEmit` no frontend.
- Quando o ambiente permitir, confirmar persistência por GET do praticante ou resposta equivalente do backend, sem usar apenas a query de proximidade como evidência.

## Riscos e pendências

- A tela de permissão inicia a solicitação automaticamente ao abrir; o retry deve reutilizar a localização já capturada quando possível e não duplicar o PATCH.
- O callback atual do hook é síncrono; será necessário ajustar o contrato para aguardar o salvamento ou coordenar explicitamente o estado na tela.
- A validação de erros deve continuar distinguindo falha da API de permissão negada.
