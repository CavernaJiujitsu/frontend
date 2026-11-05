# Plano — #92 perfil, certificados e configurações

Definir estados reais das telas de perfil, certificado e configurações sem prometer funções ainda fora do contrato backend. O perfil consome `/profiles/me`; certificados usam upload multipart; configurações ficam informativas enquanto não houver endpoint.

Aceite: loading/erro/sucesso/empty claros, upload envia boundary correto, nenhuma ação fictícia altera dados.
