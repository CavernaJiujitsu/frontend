# Blueprint — integração completa do frontend com a API do aluno

## Inventário e reuso

| Peça | Local atual | Reuso/alteração |
|---|---|---|
| Cliente HTTP e envelope | `src/api/bootstrap`, `src/api/types` | Reutilizar `apiClient` e `unwrap`; adicionar somente serviços necessários. |
| Sessão | `src/store/useAppStore.ts` | Reutilizar token e `practitionerId`; invalidar cache após mutações. |
| Agenda | `src/components/schedule/schedule-screen.tsx` | Manter tela e componentes; retirar seeds de aula e mover helpers puros de calendário. |
| Perfil | `src/app/(private)/perfil/index.tsx` | Reutilizar `StudentPage`, estilos e React Query; adicionar formulário e ações reais. |
| Upload de arquivo | `CertificatePicker` + `expo-document-picker` | Extrair tipo de arquivo do mock para tipo de API compartilhado; reutilizar picker. |
| Home | `src/app/(private)/inicio/index.tsx` | Manter `getHomeSummary`/`getMyProfile`; remover confirmação simulada e navegar para agenda. |
| Faixa/trilha | onboarding e `src/app/(private)/trilha` | Reutilizar serviços reais; completar acompanhamento de validação sem fixture. |

## Contrato confirmado

- Praticante: `PATCH /practitioners/:id` com `name`, `email`, `age` ou
  coordenadas.
- Perfil: `GET /profiles/me`, `PUT /profiles/me/photo` multipart e
  `DELETE /profiles/me/photo`.
- Certificado: `POST /certificates/upload`; listagem paginada sem vínculo de
  praticante declarado.
- Classes: filtros `caveUnitId`, `teacherId`, `type`; matrícula com
  `practitionerId`; check-in/cancelamento usam `enrollmentId`.
- Validação: declaração com `practitionerId`, `targetBeltId?`, `certificateUrl?`
  e `classId?`; listagem com filtro de praticante/status.

## Desenho final

### Serviços e tipos

- `profile.service.ts`: tipos completos, upload/remoção de foto e métodos de
  atualização de cache compatíveis com React Query.
- `practitioners.service.ts`: incluir `age` e `updatePractitioner` parcial,
  mantendo `updatePractitionerLocation` como wrapper tipado.
- `classes.service.ts`: expandir matrícula, inscrição, check-in e cancelamento;
  manter `listClasses` paginado e tipado.
- `certificates.service.ts`: tipo local de arquivo e consulta paginada.
- `belt-validations.service.ts`: `classId`, filtros e resposta completa de
  acompanhamento.
- `routes.ts`: rotas de foto; rotas parametrizadas para inscrições.

### Telas e componentes

- Perfil: formulário inline para nome/e-mail/idade; picker de imagem; ações de
  salvar/remover; lista de certificados somente se a API retornar dados.
- Home: card da próxima aula leva para a agenda da caverna; nenhum alerta de
  presença falso.
- Agenda: usar apenas classes da API; corrigir o filtro de data no cliente e
  manter calendário como utilitário puro fora de `mocks`.
- Onboarding: usar tipos reais de certificado e atualizar tipos de declaração.
- Validação: expor status real retornado pelo backend onde já houver ponto de
  entrada, sem criar um fluxo administrativo.

### Estados obrigatórios

Cada mutação terá loading, erro preservando os valores digitados, sucesso com
invalidação de `profile-me`/listas e bloqueio contra duplo envio. Listagens terão
loading, vazio e retry. Sessão 401 continua sendo tratada pelo interceptor.

## Mocks e duplicidades

- Retirar uso de `api/mocks/belts.ts`, `schedule.ts`, `nearby-gym.ts` e
  `inicio.ts` como fonte de dados ou tipos de negócio.
- Manter somente helpers puros de calendário, em `src/utils/schedule.ts`, sem
  seeds nem funções de espera.
- Não criar novo cliente HTTP, envelope, formulário ou componente de botão.

## Riscos e limites

- Como `GET /certificates` não informa proprietário, a tela não exibirá uma
  lista como sendo “meus certificados” sem evidência do contrato.
- A próxima aula do home não traz necessariamente o `enrollmentId`; portanto o
  home não terá check-in até a agenda obter a inscrição real.
- O upload de foto pode exigir development build no dispositivo; o código usará
  o módulo já presente para evitar dependência nativa nova.
