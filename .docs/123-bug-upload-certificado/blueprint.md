# Blueprint — upload de certificado (#123)

| Peça | Local | Decisão |
|---|---|---|
| Seletor | `src/components/customized/document-picker/` | Reutilizar o picker existente e validar tamanho. |
| Cliente HTTP | `src/api/services/certificates.service.ts` | Ramificar pelo `Platform.OS`: converter `uri` em `Blob` no web; conservar o descritor `{ uri, name, type }` no mobile. Enviar o `FormData` com campo `file`, sem forçar `Content-Type`. |
| Referência de reuso | `src/api/services/profile.service.ts` | Reutilizar o padrão web já aplicado ao envio de foto, sem criar helper ou tipo paralelo para uma única chamada. |
| Contrato backend | `backend/src/modules/graduations/certificates/certificates.controller.ts` | Espelhar `POST /certificates/upload` com parte binária obrigatória `file`. |

Não criar novo endpoint nem duplicar validação de MIME/tamanho do backend.

Alternativas consideradas:

| Alternativa | Decisão |
|---|---|
| Anexar o objeto React Native em todas as plataformas | Rejeitada: no browser ele não é `Blob`/`File` e vira texto. |
| Alterar o `CertificatePicker` para produzir outro formato | Rejeitada: o tipo atual é adequado para mobile e já é consumido pelo onboarding. |
| Converter somente dentro de `uploadCertificate` | Escolhida: isola a diferença de runtime no limite HTTP e segue o padrão de `profile.service.ts`. |
