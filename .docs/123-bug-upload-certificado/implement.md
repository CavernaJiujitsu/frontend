# Implementação — upload de certificado (#123)

## Alteração

- `src/api/services/certificates.service.ts`: passou a importar `Platform` e, no
  web, resolve `file.uri` com `fetch`, converte a resposta em `Blob` e o anexa
  ao `FormData` como `file` com `file.name`.
- iOS e Android continuam anexando o descritor `{ uri, name, type }`, que é o
  formato multipart aceito pelo runtime React Native.

## Decisões

- O tratamento fica no serviço HTTP, sem alterar o `CertificatePicker` nem
  duplicar o padrão já usado por `profile.service.ts`.
- O endpoint, o nome do campo (`file`) e o backend permanecem intactos. O
  controller confirma `FileInterceptor('file')` e rejeita uma parte ausente.

## Validação planejada

- `bun run lint` e `bunx tsc --noEmit`.
- Inspeção do `FormData` web para confirmar uma entrada binária nomeada.
- Exercício manual do onboarding no web fica condicionado à API local e a um
  navegador/dev server disponíveis.

## Validação executada

- `bun run lint`: passou.
- `bunx tsc --noEmit`: passou.
- O bundle web local carregou após a alteração, sem erro atribuível ao app.
- O envio real não foi disparado para não criar um certificado persistente fora
  de um ambiente de teste controlado.
