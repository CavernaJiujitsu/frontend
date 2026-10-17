# Blueprint — Integração dos dados essenciais da Home

## Inventário e reuso

| Peça | Localização | Uso |
| --- | --- | --- |
| Cliente HTTP | `src/api/bootstrap/axios-bootstrap.ts` | Executar a consulta autenticada/configurada pelo app. |
| Envelope | `src/api/types/envelope.ts` | Desempacotar `data` com `unwrap`. |
| Endpoints | `src/api/endpoints/routes.ts` | Centralizar a URL `practitionerHome`. |
| Sessão e localização | `src/store/useAppStore.ts` | Obter `practitionerId` e coordenadas atuais. |
| Query/cache | `@tanstack/react-query` | Controlar loading, erro, cache e nova tentativa. |
| Erro global | `src/hooks/use-report-query-error.ts` | Reportar o erro da query de modo consistente. |
| Feedback de carregamento | `components/customized/loading-spinner/` | Comunicar carregamento em cada card remoto. |
| Navegação privada | `BottomNavbar` e `ScreenLayout` | Permanecer inalterados. |
| Dados sem contrato | `src/api/mocks/inicio.ts` | Manter somente nome/faixa/progresso necessários ao card de faixa. |

## Alternativas avaliadas

| Tema | Alternativas | Escolha |
| --- | --- | --- |
| Consultas | Uma rota agregadora; endpoints independentes | Rota agregadora, pois o backend define a Home como uma única chamada. |
| Estado assíncrono | `useEffect` + `useState`; React Query | React Query, já adotado no projeto e adequado para cache/refetch. |
| Localização parcial | Enviar o campo disponível; omitir ambos | Omitir ambos, pois o DTO exige par latitude/longitude válido. |
| Próxima aula ausente | Exibir erro; estado vazio | Estado vazio: `nextClass: null` é resposta normal do contrato. |
| Cavernas ausentes | Exibir erro; estado vazio | Estado vazio: a API retorna lista vazia com sucesso. |

## Desenho

```text
useAppStore (practitionerId, location)
              │
              ▼
useQuery(["home-summary", practitionerId, latitude, longitude])
              │
              ▼
getHomeSummary → apiClient.get(routes.practitionerHome(id)) → unwrap
              │
              ▼
Inicio: saudação | próxima aula | cavernas próximas
```

### Arquivos criados

| Arquivo | Responsabilidade |
| --- | --- |
| `src/api/services/home.service.ts` | Tipos do contrato e função `getHomeSummary`. |

### Arquivos alterados

| Arquivo | Alteração |
| --- | --- |
| `src/api/endpoints/routes.ts` | Adiciona o construtor de rota `practitionerHome`. |
| `src/app/(private)/inicio/index.tsx` | Troca os dados remotos mockados por query, estados e mapeamento de apresentação. |
| `src/api/mocks/inicio.ts` e `src/types/inicio.ts` | Remove `isOpen`, que não pertence mais à apresentação usada pela tela. |
| `src/styles/private/inicio.styles.ts` | Inclui estilos do feedback/retentativa. |

## Mapeamento do contrato para UI

| API | Apresentação |
| --- | --- |
| `practitioner.fullName` | Primeiro nome da saudação. |
| `nextClass.startsAt` | Dia abreviado e horário em PT-BR. |
| `nextClass.caveUnit.caveName` | Etiqueta da próxima aula. |
| `nextClass.teacher.name` | Nome do professor. |
| `nearbyCaves._meta.total` / `radiusKm` | Resumo da quantidade e do raio. |
| Primeiro item de `nearbyCaves.data` | Nome, bairro/endereço alternativo e distância da mais próxima. |
| Primeiros três itens de `nearbyCaves.data` | Avatares decorativos com cores estáveis locais. |

## Limites conhecidos

- A confirmação exibida no card ainda é local (`Alert`); ela não altera matrícula
  nem presença no backend.
- A faixa continua usando mock, pois `GET /home` não a retorna.
- As cores dos avatares são decorativas e não identificam uma caverna no domínio.
