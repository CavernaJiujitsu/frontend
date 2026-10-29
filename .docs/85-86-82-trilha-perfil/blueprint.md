# Blueprint — escopo refinado autorizado

Reusar ScreenLayout, BottomNavbar, DefaultButton, LoadingSpinner, cabeçalhos inicioStyles e tokens. Substituir o placeholder de trilha e os mocks inline do perfil por views com modelos de apresentação em src/types/student-preview.ts e fixtures em src/api/mocks/student-preview.ts. Estes tipos NÃO são contratos de API.

Criar componentes compartilhados de cenário/feedback/progresso em src/components/student-preview, estilos em src/styles/private/student-preview.styles.ts e rota /trilha/[stageId]. Perfil mantém accordions. Seletor de cenários colapsável identificado como demonstração, sem persistência e sem requisições.

Alternativas descartadas: inventar endpoint, integrar só parte do perfil, usar identidade do onboarding como sessão, inferir aprovação a partir de COMPLETED. PRDs separados para trilha e perfil registram bloqueios e checklist da integração futura.
