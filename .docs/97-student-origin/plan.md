# #97 — escolher e persistir unidade de origem

Autorização: continuação do plano pelo PO. Base dev conferida com fetch `47f22a6`, mais correção publicada de sessão #24 (`8aea60f`). Nova branch `feat/97-student-origin`.

Após escolher uma caverna, o aluno escolhe explicitamente uma unidade e confirma a origem. PUT/GET `/practitioners/:id/origin` do backend são o contrato canônico. Só avançar à faixa depois de confirmação bem-sucedida; erro permanece recuperável sem repetir cadastro. Visitas/agenda continuam permitindo treino em outras unidades.

Perfil mostra origem salva após logout/novo login; ausência é explícita e não representa falha. UI segue componentes/tokens atuais, sem afirmar revisão Figma. Unidades têm paginação, seleção acessível, loading, vazio, erro/retry e proteção contra envio duplicado.

Aceite: escolha não automática; unidade pertence à caverna validada pelo backend; confirmação persiste; falha bloqueia avanço; busca/paginação e retorno funcionam; nova sessão preserva origem; token de outra conta recebe 403. Validar lint, tipos, export web, curl e Chromium com API real. Sem nova dependência/runner/config nativa.
