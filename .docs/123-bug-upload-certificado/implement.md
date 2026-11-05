# Implementação — upload de certificado (#123)

Corrigido o envio multipart para deixar o Axios/React Native gerar automaticamente o `boundary`. O campo continua sendo `file`, compatível com o `FileInterceptor` do backend.
