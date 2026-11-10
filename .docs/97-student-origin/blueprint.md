# Blueprint mobile #97

- NearByGym passa a navegar a `/onboarding/origin-unit`, com caveId observado na lista. Nome/identidade final da caverna vêm da API, não do deep link.
- Nova tela usa ScreenLayout, SearchInput, DefaultButton, LoadingSpinner, TanStack Query e estilos separados com tokens. Estado local controla unidade selecionada e página; busca com debounce e cancelamento. Não reutilizar dados de outra caverna/página como seleção válida.
- Reutilizar CaveUnit e contrato paginado: extrair `listUnitsPage`, mantendo `listUnits` como wrapper compatível. Parâmetros page/limit/search seguem DTO real; AbortSignal vai ao Axios.
- `practitioners.service` ganha tipo PractitionerOrigin e GET/PUT fiéis ao backend. Não adicionar aliases.
- PUT por mutation recebe a seleção exata. Ref trava submissão duplicada. Sucesso invalida origem/perfil e navega para select-belt com a caverna retornada pelo servidor. Transferência 409 é exibida e oferece retorno seguro.
- Perfil usa query key por practitionerId e mostra loading, erro/retry, null ou caverna/unidade. Session helper do #24 já limpa cache na troca de conta.
- UI é adaptação funcional ao visual existente; confirmação inicial, não transferência. Não alterar agenda para restringir treino à origem.
- Paginação usa texto em linha separada dos botões para caber no viewport mobile. Validação com resposta tardia verifica retorno pelo histórico sem redirecionar após desmontar a tela.

Testes: fluxo real caverna → unidade → confirmar → faixa; falha controlada/retry; duas unidades da mesma caverna; paginação/vazio; deep link inválido; perfil após novo login; 403 por API com duas contas. Sem novo framework de testes no projeto.
