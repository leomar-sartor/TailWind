---
name: front-code-review
description: Revisa alterações do frontend ARP com foco em bugs, regressões, segurança, GraphQL/Apollo, autenticação, React e Zustand. Use ao revisar diffs, commits, branches ou pull requests deste projeto.
---

# Code review do frontend ARP

Faça uma revisão técnica somente leitura. Não altere arquivos, não crie commits e não corrija os problemas sem pedido explícito.

## Fonte de verdade

1. Leia `.cursor/rules/project.mdc` antes da revisão.
2. Confirme o comportamento no código atual; não assuma que documentação antiga está correta.
3. Use `package.json`, `src/main.tsx`, `src/router/AppRouter.tsx` e os módulos afetados para validar arquitetura e versões.

## Definir o diff

- Se o usuário indicar PR, commit, branch, base ou arquivos, revise exatamente esse escopo.
- Sem escopo explícito, revise alterações staged, unstaged e arquivos novos do repositório atual.
- Para branch, compare com o merge-base da branch-base; não revise apenas o último commit.
- Leia o contexto ao redor do diff e os consumidores/tipos/documentos GraphQL diretamente relacionados.
- Não reporte problemas preexistentes fora do diff, exceto quando a alteração os introduzir, agravar ou tornar alcançáveis.

## Ordem de análise

### 1. Correção funcional

- Fluxos create/edit/delete distinguem corretamente criação e edição.
- IDs recebidos como string são convertidos quando o schema exige `Long`/número.
- Estados `loading`, vazio, erro e sucesso são coerentes.
- Paginação por cursor mantém `cursorStack`, `after`, filtros e debounce consistentes.
- `useEffect` possui dependências corretas, cleanup e não cria loops ou requests duplicadas.
- Handlers assíncronos aguardam mutations/refetch antes de navegar ou mostrar sucesso.
- Componentes não executam efeitos durante renderização.

### 2. GraphQL e Apollo

- Queries/mutations ficam em `src/graphql/queries` ou `src/graphql/mutations`, separadas por domínio.
- Tipos de data e variables correspondem ao documento GraphQL; sinalize `any` que oculte incompatibilidades reais.
- A mutation trata exceções e erros retornados por causa de `errorPolicy: 'all'`.
- Após escrita, o cache é atualizado ou ocorre `refetch` deliberado.
- Não há `fetch` paralelo para endpoints que já pertencem à API GraphQL.
- Mudanças em `src/graphql/client.ts` preservam endpoint por ambiente, `credentials: 'include'` e a ordem dos links.
- Refresh concorrente libera ou falha todas as requests pendentes e sempre restaura `isRefreshing`.

### 3. Autenticação e segurança

- Rotas privadas permanecem sob `ProtectedRoute`; providers mantêm a ordem definida no projeto.
- Logout limpa estado e cache mesmo se a mutation falhar.
- Access token usa `authStore`/`authStorage`; refresh token continua somente em cookie `httpOnly`.
- Nenhum token, senha, payload sensível ou PII é registrado.
- Conteúdo externo não é inserido com `dangerouslySetInnerHTML` sem sanitização.
- URLs, redirects e parâmetros de rota não permitem navegação não confiável.
- Inputs são normalizados, mas validação de autorização não é tratada como responsabilidade exclusiva do frontend.

### 4. Estado React e Zustand

- Estado exclusivo da tela continua local; Zustand é usado apenas quando o estado cruza componentes/etapas.
- Selectors são preferidos quando evitam rerender amplo.
- Actions Zustand fazem atualizações imutáveis e limpam estados dependentes.
- Closures não usam valores obsoletos em callbacks, timers ou effects.
- Objetos de Context não causam renders excessivos sem necessidade.

### 5. UI e acessibilidade

- Reutiliza componentes existentes antes de duplicar markup.
- Botões têm `type`, estado `disabled` e nome acessível, inclusive botões apenas com ícone.
- Inputs possuem label/associação acessível e exibem erros úteis.
- Layout mantém responsividade, tema/dark mode e tokens existentes.
- Confirmações destrutivas usam o helper compartilhado e impedem submissões repetidas.

### 6. Manutenibilidade

- TypeScript `strict` é respeitado; prefira `unknown`, type guards e `import type`.
- Não há parser de erro, máscara, layout, store ou cliente Apollo duplicado.
- Não há `console.log`, código de demonstração, comentários obsoletos ou imports mortos novos.
- `async/await` é preferido; `.then()` é aceitável somente quando a integração Observable/Apollo justificar.
- A alteração segue a estrutura horizontal atual; não introduz padrões de backend, TypeORM ou SQL.

## Verificação

Quando o ambiente permitir, execute:

```bash
npm run lint
npm run buildtsc
```

- Relacione falhas à alteração antes de reportá-las.
- Se um comando não puder ser executado, informe a limitação; não presuma sucesso.
- Não exija testes inexistentes no projeto, mas aponte lógica de alto risco sem cobertura e descreva o caso que deveria ser testado.

## Critério para findings

Reporte somente problemas concretos e acionáveis, com evidência de impacto. Não reporte:

- preferência pessoal de estilo;
- reformatação sem efeito;
- possibilidade puramente hipotética sem caminho de execução;
- problema que lint ou TypeScript já impedem, salvo se a configuração não o detectar;
- dívida técnica não alterada pelo diff.

Classifique cada finding:

- `P0`: bloqueia operação ou causa comprometimento crítico imediato.
- `P1`: bug grave, falha de segurança ou perda/corrupção de dados provável.
- `P2`: bug funcional ou regressão relevante em cenário realista.
- `P3`: problema menor, mas verificável, de robustez ou manutenção.

## Formato da resposta

Apresente findings primeiro, ordenados por prioridade e depois por arquivo:

```markdown
[P2] Título curto e específico
`src/path/File.tsx:42-48`

Explique o cenário que ativa o problema, o impacto observável e a correção recomendada.
```

Requisitos:

- Use o menor intervalo de linhas que demonstre o problema.
- Um finding por causa raiz; agrupe ocorrências equivalentes.
- Não elogie nem resuma arquivos sem necessidade.
- Depois dos findings, inclua uma síntese curta e os comandos de validação executados.
- Se não houver findings, diga claramente: `Nenhum problema acionável encontrado.` e registre eventuais limitações de validação.
