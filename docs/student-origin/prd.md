# Unidade de origem — #97

## Comportamento

O onboarding mantém a escolha de caverna e, antes da declaração de faixa, pede uma unidade de origem explícita em `/onboarding/origin-unit`. Essa unidade é referência administrativa do aluno; a agenda continua permitindo treinos em outras unidades. Nunca selecionar automaticamente a primeira unidade ou a mais próxima.

A tela tem busca, paginação, loading, vazio, falha/retry, seleção acessível e confirmação com bloqueio de envio duplicado. O nome da caverna vem da API. Falha na confirmação mantém a seleção e não avança. Resposta tardia após sair da tela/trocar conta ou caverna não redireciona o usuário.

O Perfil consulta a origem pelo practitionerId atual e mostra caverna/unidade ou ausência explícita; erro é distinguido de null e oferece retry. A origem permanece depois de novo login; não é um campo local de preferência.

## Contrato

GET/PUT `/api/v1/practitioners/:id/origin`, envelope existente. PUT envia somente `{ caveId, caveUnitId }`. GET retorna null ou `{ caveId, caveName, caveUnitId, caveUnitName }`. Exige Bearer/propriedade; 400 inválido, 401 sessão ausente, 403 outro aluno, 404 unidade fora da caverna, 409 origem diferente já definida. Transferência está fora do mínimo.

Unidades usam o contrato existente GET `/caves/:id/units?page&limit&search`. A tela usa paginação real, sem limitar silenciosamente às primeiras vinte/cem unidades. A lista ordena pelo nome quando timestamps coincidem e usa id como desempate final, preservando paginação estável.

Não há alteração no fluxo de visitas, autorização de gestão ou currículo. O desenho é adaptação funcional aos componentes/tokens atuais; revisão Figma e testes iOS/Android são verificações separadas.
