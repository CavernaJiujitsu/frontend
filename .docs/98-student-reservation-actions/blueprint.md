# Blueprint — ações da próxima aula

| Peça | Reuso |
| --- | --- |
| Inicio e mutation existentes | Trocar mutation discriminada action por cancelamento único; manter onError/refetch/query keys |
| cancelClassEnrollment, apiClient | Reusar sem alteração; header já vem da identidade atual |
| enrollmentStatus do HomeSummary | PENDING/IN_PROGRESS canceláveis; CONFIRMED informativo |
| Pressable e styles confirmBtn existentes | Preservar controle compacto da linha sem adicionar componente/estilos; disabled/busy durante mutação |
| styles tag/tagText/emptyText | Selo de confirmação e orientação do professor sem ação |
| Backend e QA existente | Fixtures sintéticas por API, status IN_PROGRESS por fixture privilegiada local; requests reais do navegador |

Desenho: único arquivo funcional src/app/(private)/inicio/index.tsx. Remover import/check-in e variável action da mutation; onSuccess mensagem de cancelamento fixa. Renderizar botão só nos dois status permitidos e selo/orientação no confirmado. Manter tela vazia, fallback de erro e query de home/perfil. Escrever PRD específico em docs/student-reservations/prd.md.

Alternativas: deixar botão de check-in desabilitado ainda sugere ação não prevista no produto; escondê-lo e oferecer cancelamento correto resolve o fluxo. Não expor cancelamento CONFIRMED que a API rejeita. Não extrair máquina de estados/componente para um ramo local com três status.

Validação: reproduzir antes, testar após com Playwright externo já disponível (não instalar runner no app), lint/tipos/export e evidências de API compartilhadas com backend. Revisão do diff incremental contra PR #26, sem reformatação incidental.
