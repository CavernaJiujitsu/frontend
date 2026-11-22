# Plano — corrigir upload de certificado (#123)

Corrigir o upload de certificado no navegador. O seletor fornece um objeto
React Native (`uri`, `name`, `mimeType`), mas anexá-lo diretamente ao
`FormData` web o serializa como texto (`[object Object]`), e o backend responde
`400 Arquivo não enviado`.

No web, buscar a `uri`, converter a resposta para `Blob` e anexá-la sob o campo
`file`, preservando o nome original. iOS e Android continuarão usando o objeto
multipart aceito pelo runtime React Native. O backend já usa
`FileInterceptor('file')` e aceita JPG, PNG e PDF até 5 MB.

Critérios de aceite:

1. No web, a parte `file` do multipart é um `Blob` com `file.name` como nome de arquivo.
2. No mobile, o payload multipart existente permanece inalterado.
3. O campo multipart continua se chamando `file` e não há mudança de endpoint ou backend.
