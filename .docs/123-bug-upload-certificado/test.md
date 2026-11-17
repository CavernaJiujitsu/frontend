# Testes — upload de certificado (#123)

## Ambiente

- Frontend Expo SDK 57, executado no web local já disponível em
  `http://localhost:8081`.
- Não há runner de testes configurado no projeto.

## Checks

| Comando | Resultado |
|---|---|
| `bun run lint` | passou |
| `bunx tsc --noEmit` | passou |
| Abertura do app web local | passou; sem erro do app no console |

O único erro observado no console veio de uma extensão do Chrome
(`companion.bundle.js`), não do bundle do projeto.

## Matriz de casos

| Caso | Esperado | Obtido |
|---|---|---|
| Build/typecheck do serviço alterado | Serviço compila com o `Platform` e os dois formatos de multipart | passou |
| Lint | Sem violações no serviço e nos artefatos | passou |
| Carregamento web | Bundle carrega depois da alteração | passou |
| Upload web com arquivo selecionado | A parte `file` deve ser binária, com o nome selecionado, e o backend deve aceitar o upload | pendente de ambiente/API de teste |
| Upload iOS/Android | Mantém o descritor nativo `{ uri, name, type }` | pendente de dispositivo/emulador |

## Contrato e cobertura pendente

O controller confirmado em
`backend/src/modules/graduations/certificates/certificates.controller.ts` usa
`FileInterceptor('file')`; por isso o nome do campo não mudou. Não foi feito
`POST` real nesta validação, pois ele cria um certificado persistente. Para a
evidência final, em um ambiente de teste autenticado: iniciar o onboarding,
selecionar um JPG/PNG/PDF de até 5 MB no navegador e confirmar `201` (ou o
status de sucesso configurado pela API) sem a mensagem `Arquivo não enviado`.
