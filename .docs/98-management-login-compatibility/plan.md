# Correção de compatibilidade — #98 — [BE] Autorizar acessos por perfil, academia e professor responsável

Classificação: ajuste do app associado à correção de lacuna de card existente, não card novo. PO autorizou correções e reabertura, exigindo título literal e aviso de conclusão. Este ajuste não conclui o card inteiro.

Base recém-conferida por fetch: dev `47f22a66fbcbae09bb989a6d3ef88e3845914b06`, dependência PR #25 `1ab3d2929ae69e1a8dc23767449222425061d707`. Branch `fix/98-management-login-compatibility`. Sem commits remotos pendentes.

O backend passa a autenticar contas autorizadas sem practitioner, omitindo practitionerId. O app do aluno não pode abrir uma sessão sem esse identificador e depois falhar na home. Ajustar tipo LoginResponse ao DTO real e validar no ponto central startSession antes de alterar cache/store. Exibir mensagem recuperável explicando o acesso de gestão; login/cadastro de aluno continuam iguais. Não criar perfil de aluno ou inventar ID.

Aceite: resposta de gestão sem practitionerId não altera store/cache nem navega para home; mensagem legível na tela; aluno com ID real entra normalmente; HTTP público mantém isolamento de token. Validar lint, tipos, export web e login real de gestão/aluno no Chromium. Sem dependência, teste nativo ou configuração Expo nova; nenhum uso novo de API Expo/React Native.
