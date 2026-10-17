# Revisão — Integração dos dados essenciais da Home

Status: **sem achados bloqueantes na revisão estática**.

| Área | Verificação | Resultado |
| --- | --- | --- |
| Contrato | Rota, path, queries e forma de resposta comparados aos DTOs/controller do backend. | Conforme. |
| Queries | Coordenadas não são enviadas parcialmente; opcionais não viram `undefined` na URL. | Conforme. |
| Estados | Loading, sucesso vazio e erro são diferenciados. | Conforme. |
| Erros | A falha passa pelo reporter compartilhado e há retentativa explícita. | Conforme. |
| Reuso | Cliente HTTP, envelope, store, React Query, spinner e layout existentes são reutilizados. | Conforme. |
| Tipos | Serviço descreve os campos consumidos pela tela; não há `any`. | Conforme. |
| Acessibilidade | Botões e cards interativos preservam roles e labels. | Conforme. |

## Observações não bloqueantes

- `AVATAR_COLORS` usa cores locais para avatares puramente decorativos. Se essas
  cores passarem a ser parte do design system, devem migrar para tokens.
- O mock de faixa permanece necessário até que exista um contrato próprio para
  progresso do praticante.
- A confirmação de presença é somente visual e deve ganhar integração em uma
  demanda separada.
