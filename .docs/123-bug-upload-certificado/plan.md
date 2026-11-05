# Plano — corrigir upload de certificado (#123)

Remover o header multipart manual do cliente React Native para que Axios gere o `boundary` correto. O backend já usa `FileInterceptor('file')` e aceita JPG, PNG e PDF até 5 MB.
