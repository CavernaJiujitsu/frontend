# Blueprint — integração da trilha com o backend

## Inventário

| Peça | Local atual | Uso no plano |
|---|---|---|
| Rota da trilha | `src/app/(private)/trilha/index.tsx` | Alterar para consumir query da trilha e renderizar estados reais |
| Detalhe da etapa | `src/app/(private)/trilha/[stageId].tsx` | Alterar para localizar a etapa na resposta real |
| Perfil | `src/app/(private)/perfil/index.tsx` | Alterar dados de faixa/estatísticas para `/profiles/me` |
| Início | `src/app/(private)/inicio/index.tsx` | Alterar card de faixa/progresso para dados de `/profiles/me` |
| Layout compartilhado | `src/components/student-preview/preview-kit.tsx` | Reutilizar `StudentPage` e `Progress`; retirar controles/feedback demonstrativos ou separar o que continuar útil |
| Estilos | `src/styles/private/student-preview.styles.ts` e `src/styles/private/inicio.styles.ts` | Reutilizar tokens e ajustar estados reais/pending |
| Botão e loading | `DefaultButton` e `LoadingSpinner` | Reutilizar nas ações e estados de tela |
| Erros de query | `src/hooks/use-report-query-error.ts` | Reutilizar para reportar falhas ao toast global |
| Cliente HTTP | `src/api/bootstrap/axios-bootstrap.ts` | Reutilizar `apiClient`, sem novo cliente |
| Envelope | `src/api/types/envelope.ts` | Reutilizar `ApiEnvelope`/`unwrap` |
| Rotas | `src/api/endpoints/routes.ts` | Adicionar somente `practitionerTrail` e `profileMe` |
| Mock atual | `src/api/mocks/student-preview.ts` | Deixar de ser usado pelas telas integradas; remover apenas se não houver outro consumidor |
| Tipos atuais | `src/types/student-preview.ts` | Substituir pelos tipos do contrato ou manter somente tipos de apresentação ainda necessários |

## Confirmação do contrato

O contrato foi conferido em:

- `../backend/src/practitioners/practitioners.controller.ts`
- `../backend/src/practitioners/dto/trail-response.dto.ts`
- `../backend/src/profiles/profiles.controller.ts`
- `../backend/src/profiles/dto/profile-response.dto.ts`

O serviço consumirá exatamente:

- `GET /api/v1/practitioners/me/trail`
- `GET /api/v1/profiles/me`

As respostas são desembrulhadas com `ApiEnvelope<T>`. O retorno sem faixa será
modelado como uma união discriminada por `noActiveBelt`, sem transformar esse
estado em erro ou em lista vazia silenciosa.

## Alternativas avaliadas

### Um único service para trilha e perfil

Descartado. Os endpoints têm responsabilidades e respostas diferentes; manter
`trail.service.ts` e `profile.service.ts` separados torna o contrato explícito
e permite cache independente.

### Buscar a trilha usando `practitionerId` da store

Descartado. O endpoint canônico é `/practitioners/me/trail`; a identidade deve
ser resolvida pelo JWT e não interpolada no caminho.

### Manter fixture como fallback visual

Descartado. Falha de rede deve exibir erro/retry e não mascarar indisponibilidade
com dados de outro aluno ou dados de demonstração.

### Criar um componente totalmente novo para a página

Descartado. A página já possui `StudentPage`, `Progress`, `ScreenLayout`,
`BottomNavbar`, `DefaultButton` e tokens compatíveis; serão reaproveitados e
ajustados somente onde o fluxo real exigir.

## Desenho final

### Arquivos novos

- `src/api/services/trail.service.ts`: tipos `TrailResponse`, `NoActiveBeltResponse`,
  `TrailStage`, `TrailMovement` e função `getMyTrail()`.
- `src/api/services/profile.service.ts`: tipos do perfil resumido e função
  `getMyProfile()`.

### Arquivos alterados

- `src/api/endpoints/routes.ts`: rotas `practitionerTrail` e `profileMe`.
- `src/app/(private)/trilha/index.tsx`: `useQuery` por identidade autenticada,
  loading, erro/retry, estado pending e renderização da resposta real.
- `src/app/(private)/trilha/[stageId].tsx`: mesma query da trilha, busca da etapa
  por `id`/`trailStageId`, detalhe real e tratamento de ID inválido.
- `src/app/(private)/inicio/index.tsx`: query do perfil para faixa e progresso;
  manter home para próxima aula e cavernas.
- `src/app/(private)/perfil/index.tsx`: query do perfil para nome, e-mail,
  faixa e estatísticas disponíveis, com travessão quando nulos.
- `src/components/student-preview/preview-kit.tsx`: remover API de cenários da
  experiência integrada e preservar apenas o layout/elementos compartilhados,
  se ainda houver consumidores.
- `src/types/student-preview.ts`: remover modelos que representavam contrato
  fictício ou substituí-los por tipos derivados/compatíveis com os services.
- `src/styles/private/student-preview.styles.ts`: ajustar estilos de estado
  pending e mensagens sem dados, usando tokens existentes.
- `src/api/mocks/student-preview.ts`: deixar sem consumidores de produção; excluir
  somente se a busca de referências confirmar que não é necessário preservá-lo.

### Queries e cache

- Trilha: `['practitioner-trail', practitionerId]`, habilitada quando houver
  `practitionerId` autenticado disponível na store.
- Perfil: `['profile-me', practitionerId]`, com a mesma condição.
- Usar `useReportQueryError` para erros e `refetch` nos botões de retry.
- Não usar o `practitionerId` para montar a URL da trilha; ele apenas segrega o
  cache enquanto o endpoint usa `/me`.

### Estados da trilha

1. Loading: `LoadingSpinner` com mensagem em PT-BR.
2. Erro: mensagem de falha e `DefaultButton` para `refetch`, com reporte global.
3. Sem faixa: tela de avaliação pendente com `noActiveBelt: true`; sem etapas,
   progresso ou faixa fictícios.
4. Ativa: cabeçalho da trilha, progresso recebido e etapas ordenadas.
5. Etapa inválida: mensagem de etapa não encontrada e retorno para `/trilha`.

### Estados do perfil e início

- Com `activeBelt`/`trailStats`: renderizar valores reais.
- Com campos nulos: renderizar `—` e texto de indisponibilidade, sem converter
  ausência em zero.
- Erro: usar o padrão de erro da tela e permitir retry.

## Componentes e navegação

- A rota de detalhe continuará sendo aberta com `router.push`, pois é uma
  subrota da Trilha.
- O menu inferior continuará usando `router.replace` para troca de aba.
- O estado pending não criará uma rota nova; será uma composição dentro de
  `/trilha`, mantendo a aba selecionada.
- Descrições nulas serão omitidas por renderização condicional.

## Duplicidades evitadas

- Não criar outro cliente Axios, outro sistema de erro ou outro spinner.
- Não duplicar o contrato de perfil dentro do service de trilha.
- Não recalcular percentuais ou status no componente.
- Não manter controles de cenário junto da query real.
- Não criar endpoint por estágio; o detalhe usa a resposta já carregada da
  trilha autenticada.

## Riscos e limites

- A tela de referência de avaliação pendente contém informações de reserva que
  não estão nos endpoints fornecidos; o blueprint não cria dados artificiais
  para preencher esses campos.
- A resposta de `/profiles/me` não contém `noActiveBelt`; `activeBelt: null` e
  `trailStats: null` serão tratados como ausência de faixa nesse contexto.
- Alterações locais existentes no worktree devem ser preservadas.
