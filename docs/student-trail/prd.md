# Trilha e detalhe da etapa — cards #85 e #86

Status: **interface demonstrativa implementada; integração bloqueada**.

## Escopo aprovado
Em 24/10/2026 o usuário solicitou somente as telas, mantendo a API e o desenvolvimento de seus contratos para uma etapa posterior. Não considerar #86 concluído por esta entrega.

## Páginas
- `/trilha`: sequência visual de faixas, concluídas, atual e futuras; botão de abertura da etapa atual.
- `/trilha/[stageId]`: detalhe correspondente ao ID selecionado, movimentos e evidências, retorno à trilha e estado de ID desconhecido.
- Menu mantém Trilha selecionada no detalhe. Trocas de aba usam replace.

## Referência e adaptações
Figma `cElkXHrDPF0phVvMdIyExb`, frame `20:33`. Layout adaptado para ScrollView, cabeçalho fixo e menu existente. Faixas futuras sem cadeado para não implicar desbloqueio sequencial ainda não aprovado. Currículo apenas ilustrativo. Consulta do detalhe no Figma bloqueada pelo limite Starter; revisão visual do detalhe pendente.

## Demonstração
Fixtures em `src/api/mocks/student-preview.ts`. Tipos em `src/types/student-preview.ts` são modelos de apresentação, **não um contrato aprovado de API**. Banner visível identifica dados fictícios; cenários colapsáveis permitem revisar loading, erro/retry, vazio, avaliação pendente e trilha ativa sem validações. Retry só retorna ao exemplo. Nenhuma requisição, escrita de presença ou persistência de progresso.
O exemplo de 30% e 3/10 checkpoints é independente da lista parcial de movimentos; não é recalculado. Técnicas com o mesmo nome aparecem em itens diferentes, com chaves distintas.

## Bloqueios para consumir API
1. #83: https://trello.com/c/vvwjol3v — fechar regras, DTOs, rotas e migrations. Na origin/dev consultada não existem controllers de leitura de trilha.
2. #107: https://trello.com/c/2AJ0GuxC — evidência de autoria, aula, unidade e instante.
3. Autenticação real e autorização: ID persistido no onboarding não comprova identidade. Login da dev ainda demonstrativo; não confiar em ID recebido via deep link para autorizar leitura.
4. Presença/aprovação auditada deve existir antes de validar a atualização ponta a ponta.

## Informações necessárias no contrato futuro (não prescreve rota ou DTO)
| Necessidade da interface | Decisão do backend |
|---|---|
| Aluno autenticado | Origem da identidade e autorização para os próprios dados |
| Sem trilha / avaliação pendente / ativa | Estados explícitos, distintos de falha de transporte |
| Faixa, trilha e etapa | IDs estáveis, ordenação e identificação da etapa atual |
| Progresso | Percentual, numerador/denominador e semântica de checkpoints; servidor calcula |
| Item e progresso | trailStageMovementId e ID de progresso; movementId/nome não bastam |
| Estado de movimento | Distinguir VALIDATED, COMPLETED legado e pendente sem inferir assinatura |
| Evidências | IDs, professor/usuário validador, aula, unidade e instante histórico; nulabilidade explícita |
| Detalhe | Definir resposta embutida ou endpoint dedicado; comportamento de ID ausente |
| Erros/versionamento | Contrato de erro existente, resposta incompatível explícita e rollout coordenado |

## Decisões de negócio ainda abertas
Opcionais e denominador; etapa sem obrigatórios; técnica repetida em etapas; ordem sequencial versus visual; dispensa de trilhas anteriores; correção de presença; requisitos de promoção e elegibilidade. Não implementar essas regras no frontend.

## Checklist da integração posterior
- [ ] Ler controller/DTO final e substituir fixtures por serviço fiel ao backend, sem aliases ou fallback mock.
- [ ] Vincular cache à identidade autenticada e limpar/segregar dados na troca de conta.
- [ ] Exibir loading, erro/retry e vazio reais; não converter 404 genérico em ausência de trilha.
- [ ] Refetch ao retornar à tela e após presença/aprovação; invalidar trilha, home e histórico pertinentes.
- [ ] Não contar evidências repetidas como movimentos nem reconstruir autoria do professor atual da aula.
- [ ] Validar vazio, pendente, ativa sem movimentos, legado sem autoria, múltiplas evidências e contrato incompatível.
- [ ] Revisar layout de detalhe no Figma; remover seletor de cenários da experiência integrada.

Referências: https://trello.com/c/HGK9tfG4 e https://trello.com/c/OxpuahjH.
