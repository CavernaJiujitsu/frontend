# Testes — upload de certificado (#123)

| Validação | Resultado |
|---|---|
| `bunx tsc --noEmit` | passou |
| `bun run lint` | passou |
| contrato do backend `FileInterceptor('file')` | confirmado |
| teste manual multipart no dispositivo | pendente de execução com Expo e API acessíveis |

O caso regressivo é o header manual ausente: sem ele, o runtime consegue anexar o boundary ao corpo multipart.
