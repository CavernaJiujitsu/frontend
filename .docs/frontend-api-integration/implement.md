# Implementação — integração completa do frontend com a API do aluno

## O que foi feito

- Atualizados serviços e tipos de perfil, praticante, classes, certificados e
  validação de faixa para refletir os contratos do backend.
- Adicionadas edição de nome, e-mail e idade no perfil, com invalidação do cache
  após sucesso e preservação do formulário em caso de erro.
- Adicionados upload e remoção de foto de perfil via multipart.
- Agenda passou a importar somente helpers puros de calendário; seeds de aulas
  não participam mais do runtime.
- Onboarding passou a usar o tipo real de arquivo de certificado, mantendo o
  upload real já existente.
- Home passou a usar `enrollmentId`/`classId` reais para check-in e
  cancelamento. O botão não simula mais presença.
- FAB privado deixou de exibir um check-in fictício e abre a próxima aula real.
- Tela de cavernas deixou de usar tipo/mock e imagem aleatória de runtime.
- Placeholders de edição e foto foram substituídos por operações reais; onde a
  API não possui vínculo/contrato, a limitação passou a ser informada.

## Arquivos principais

- `src/api/endpoints/routes.ts`
- `src/api/services/{profile,practitioners,classes,certificates,belt-validations}.service.ts`
- `src/app/(private)/{inicio,perfil}/index.tsx`
- `src/app/(private)/_layout.tsx`
- `src/app/onboarding/(belt-info)/belt-info.tsx`
- `src/app/onboarding/(nearby-gym)/nearby-gym.tsx`
- `src/components/{schedule/schedule-screen.tsx,customized/checkin-fab/checkin-fab.tsx,customized/document-picker/document-picker.tsx}`
- `src/utils/schedule.ts`

## Decisões e limites

- `GET /certificates` não informa proprietário do certificado; a UI não mostra
  essa listagem global como se fosse do aluno.
- Não foi criado endpoint novo no backend.
- O upload de foto usa `expo-document-picker`, já instalado no app.
- Os arquivos históricos em `src/api/mocks` permanecem como artefatos de
  referência/documentação, mas não são importados pelo runtime das telas
  integradas.

## Validação

- `bun run lint`: passou.
- `bunx tsc --noEmit`: passou.
- `git diff --check`: passou.
- Expo web respondeu `HTTP/1.1 200 OK` na porta local 8081 já em uso.
- `bunx expo-doctor`: 19/21 checks passaram; os dois alertas são pré-existentes
  de dependências (`expo-constants` duplicado e `@react-native-async-storage/async-storage`
  fora da versão esperada), sem alteração neste escopo.
