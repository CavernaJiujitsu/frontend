# Blueprint — upload de certificado (#123)

| Peça | Local | Decisão |
|---|---|---|
| Seletor | `src/components/customized/document-picker/` | Reutilizar o picker existente e validar tamanho. |
| Cliente HTTP | `src/api/services/certificates.service.ts` | Enviar `FormData` com campo `file`, sem forçar `Content-Type`. |
| Contrato backend | `backend/src/certificates/certificates.controller.ts` | Espelhar `POST /certificates/upload`. |

Não criar novo endpoint nem duplicar validação de MIME/tamanho do backend.
