# Teste — correção dos filtros da listagem de cavernas

## Ambiente

- Branch: `dev`
- Expo SDK: 57 (`expo ~57.0.30`)
- Validação local tentada com `bunx expo start --web`.

## Checks

| Comando | Resultado |
| --- | --- |
| `bun run lint` | Passou. |
| `bunx tsc --noEmit` | Passou. |
| `bunx expo-doctor` | Não executado; não houve alteração de dependências ou configuração do app. |

## Matriz de casos

| Caso | Esperado | Obtido |
| --- | --- | --- |
| Chips no carregamento da rota | Os três botões ficam totalmente visíveis | Validado por inspeção do layout: o contêiner passou a ter 48 px, acima da altura dos chips com padding. |
| Seleção de filtro | Chip selecionado mantém destaque e dispara o filtro existente | Código de seleção não foi alterado; lint/typecheck passaram. |
| Scroll horizontal | Chips continuam rolando horizontalmente quando necessário | `ScrollView` horizontal não foi alterado; apenas sua altura foi ampliada. |
| Lista loading/erro/vazia/sucesso | Estados existentes permanecem intactos | Nenhum código desses estados foi alterado. |

## Validação funcional

O Expo Web iniciou, mas o ambiente reportou modo offline e bloqueou o acesso ao socket local (`curl http://127.0.0.1:8081/` retornou `Operation not permitted`). A abertura da aplicação no navegador local também não ficou disponível. Portanto, a inspeção visual em runtime não pôde ser concluída neste ambiente.

## Como reproduzir

1. Executar `bunx expo start --web`.
2. Acessar a área autenticada e abrir `Cavernas`.
3. Confirmar que `Mais próximas`, `Abertas agora` e `Aulas hoje` aparecem por inteiro.
4. Selecionar cada chip e confirmar a atualização da lista.

## Resultado

Checks estáticos passaram. A validação visual runtime ficou fora de cobertura por restrição do ambiente; a mudança foi publicada na branch `dev` após os checks.
