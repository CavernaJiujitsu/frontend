# Plano — integração completa do frontend com a API do aluno

## Contexto

O frontend possui telas do onboarding e da área privada do aluno, mas parte dos
serviços ainda usa tipos de mock, há fluxos reais incompletos e algumas telas
exibem placeholders apesar de o backend já possuir contrato para a operação.
O backend é a fonte de verdade e expõe os contratos de praticante, perfil,
certificados, cavernas, aulas, inscrições, validações de faixa e trilha.

Esta é uma demanda direta do PO, sem card único, para cruzar o app atual com o
backend e eliminar integrações faltantes no escopo do aluno.

## Objetivo

Fazer o frontend consumir corretamente os contratos disponíveis do backend,
remover mocks de runtime nos fluxos do aluno, completar operações já suportadas
pela API e deixar explícitos os limites onde ainda não existe contrato de
produto.

## Requisitos funcionais

1. Corrigir os serviços e tipos para espelhar DTOs, envelopes, enums e filtros
   atuais do backend.
2. Manter onboarding real para criação de praticante, localização, declaração
   de faixa, upload de certificado, escolha de caverna e matrícula em aula.
3. Fazer a agenda privada/onboarding carregar aulas reais por unidade, sem
   depender de dados de aula em `src/api/mocks`.
4. Integrar no perfil a edição dos dados básicos permitidos pelo backend
   (`name`, `email`, `age`), com validação e atualização do cache.
5. Integrar troca e remoção da foto de perfil usando multipart no contrato
   `PUT/DELETE /profiles/me/photo`.
6. Integrar a consulta de certificados quando compatível com o contrato atual,
   sem atribuir certificado a um aluno quando a API não fornecer essa relação.
7. Integrar o acompanhamento de validação de faixa disponível para o aluno,
   preservando estados `PENDING`, `SCHEDULED`, `APPROVED`, `REJECTED` e
   `CANCELLED`.
8. Remover ações que simulam sucesso sem request real, como a confirmação de
   presença no card inicial; check-in só deve ser exposto quando houver a
   inscrição e o id retornados pela API.
9. Preservar a trilha e o home já reais, corrigindo apenas tipos, estados e
   mapeamentos necessários.

## Requisitos não funcionais

- Usar Expo SDK 57 e as dependências já instaladas sempre que possível.
- Não criar aliases de compatibilidade no backend.
- Usar `ScreenLayout`, componentes e tokens existentes.
- Cobrir loading, vazio, erro, sucesso e sessão expirada nas telas tocadas.
- Remover imports e fixtures de mock que participem do runtime; manter apenas
  utilitários de apresentação sem dados fictícios, se ainda forem necessários.
- Strings visíveis em PT-BR e comentários em inglês.

## Contratos de API consumidos

- `PATCH /api/v1/practitioners/:id`: `name`, `email`, `age` ou o par
  `latitude`/`longitude`; protegido pelo dono do praticante.
- `GET /api/v1/profiles/me`: perfil, faixa ativa, estatísticas e trilha.
- `PUT /api/v1/profiles/me/photo` com campo multipart `file`; `DELETE` da mesma
  rota para remover.
- `POST /api/v1/certificates/upload` e `GET /api/v1/certificates`.
- `GET /api/v1/caves`, `GET /api/v1/caves/:id` e unidades da caverna.
- `GET /api/v1/classes` com `caveUnitId`, `type`, `page`, `limit`.
- `POST /api/v1/classes/:id/enrollments` com `practitionerId`.
- Endpoints de inscrição/check-in/cancelamento e listagem de inscrições, quando
  a tela tiver contexto suficiente para operar com o `enrollmentId` real.
- `POST/GET /api/v1/belt-validations` e `GET /api/v1/practitioners/me/trail`.

## Decisões de refinamento

| Tema | Decisão |
|---|---|
| Escopo | Somente aluno/onboarding e área privada já existentes; endpoints administrativos ficam fora. |
| Edição de conta | Usar `PATCH /practitioners/:id`, sem criar endpoint de usuário. |
| Foto | Usar `expo-document-picker`, já presente, filtrando imagem para o perfil e respeitando 5 MB. |
| Certificados | Mostrar apenas dados realmente retornados pela API; não inventar vínculo aluno-certificado. |
| Presença | Não simular confirmação. Exibir check-in apenas com inscrição real e respeitar a regra de `PENDING`. |
| Mocks | Remover mocks de dados de negócio do runtime; conservar somente helpers puros de calendário, movendo-os para utilitário de domínio da agenda. |
| API ausente | Onde não houver contrato necessário (por exemplo configurações), manter a seção fora da implementação e comunicar ao usuário. |

## Fora de escopo

- Painéis de professor, admin ou financeiro.
- Criação de novos endpoints no backend.
- Alteração de regras de negócio ou do schema.
- Configuração de autenticação JWT real, que ainda é stub no backend.
- Implementar configurações de conta sem contrato de API.
- Criar runner de testes novo no frontend.

## Critérios de aceite

1. `bunx tsc --noEmit` e `bun run lint` passam no frontend.
2. Nenhuma tela de aluno usa fixture de aula, caverna, perfil ou faixa como
   fallback de sucesso da API.
3. Agenda envia `caveUnitId` e exibe apenas aulas retornadas pelo backend,
   mantendo estados de loading, vazio e erro.
4. Usuário consegue editar nome, e-mail e idade, recebe erro do backend sem
   perder o formulário e vê os dados atualizados após sucesso.
5. Usuário consegue adicionar/remover foto respeitando o contrato multipart.
6. Perfil não exibe mais “disponível em breve” para operações que a API já
   suporta.
7. Matrícula, cancelamento e check-in nunca exibem sucesso local sem request
   correspondente e id real de inscrição.
8. Tipos do frontend aceitam exatamente os valores atuais do backend, incluindo
   `hoursAccuracy` e estados de inscrição/validação.
9. O artefato `blueprint.md` será aprovado antes do código e `test.md` registrará
   lint, typecheck e validações funcionais disponíveis.

## Estratégia de teste

- Typecheck e lint do frontend.
- Teste manual em web/dev server para onboarding, agenda, perfil, foto e
  estados de erro.
- Validação por `curl` dos endpoints consumidos contra o backend local, quando
  o ambiente de banco estiver disponível.
- Conferência de que requests multipart, query params e envelopes são os mesmos
  do controller/DTO do backend.

## Riscos e pendências

- O backend atual não oferece endpoint explícito de atualização de senha ou de
  configurações; essas ações continuarão fora do escopo.
- `GET /certificates` não declara vínculo com o praticante; a tela não deve
  sugerir uma propriedade que o contrato não garante.
- Upload de foto via `expo-document-picker` pode exigir build de desenvolvimento
  dependendo do ambiente de execução.
- O check-in é permitido somente para inscrição `PENDING` e requer o
  `enrollmentId`; a UX deve evitar prometer confirmação antes de possuí-lo.
