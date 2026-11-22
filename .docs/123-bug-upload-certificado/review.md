# Review — upload de certificado (#123)

| Severidade | Achado |
|---|---|
| 🔵 informativo | A validação manual em dispositivo depende de API e Expo acessíveis. |

Conformidades: campo `file` bate com o backend, tamanho/MIME continuam validados na seleção e no servidor, sem segredo ou URL montada com input livre.

Conclusão: correção liberada para teste manual.
