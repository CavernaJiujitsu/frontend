# Isolamento de sessão — complemento #78/#110

Autorizado pelo PO: implementar melhorias e correções necessárias, com desenho e validação antes da entrega. Parte do plano de conclusão aprovado na conversa.

Problema comprovado por inspeção: Axios prioriza useSessionStore; logout limpa somente useAppStore. Novo cadastro atualiza useAppStore e conserva o token antigo na memória, permitindo enviar requisições com a identidade anterior. O interceptor 401 também derruba qualquer sessão atual quando uma request antiga falha tarde.

Objetivo: uma fonte de token e ações comuns para entrada/saída. Limpar dados pessoais e Query cache na troca de conta; 401 só encerra a sessão que originou o request. Não mudar contrato JWT ou persistência acordada nesta correção.

Aceite: login/cadastro enviam o token da conta atual; logout remove credencial e dados/cache; conta B não herda campos/cache da A; 401 da sessão antiga não derruba a nova; 401 da sessão atual redireciona para login pelo layout existente; 403 preserva sessão. Testar no navegador com API real e respostas atrasadas controladas, além de lint/typecheck/export.

Fora: renovação JWT, novo canal de login e refactor visual. Não configurar runner novo no projeto.
