# Fluxo Git e Pull Requests

Este documento cobre a atividade #5 da Semana 1: configurar branches, regras de PR e fluxo de trabalho do NextCut.

## Branches principais

- `main`: branch estável do projeto. Recebe apenas código revisado por pull request.
- `develop`: branch de integração para juntar features antes de promover para `main`.
- `feature/<responsavel>-<descricao>`: branch de funcionalidade ou tarefa.
- `fix/<responsavel>-<descricao>`: branch para correções pequenas.
- `docs/<responsavel>-<descricao>`: branch para alterações apenas em documentação.

Exemplos:

```bash
git checkout main
git pull origin main
git checkout develop
git pull origin develop
git checkout -b feature/anderson-backend-base
```

## Branches da Semana 1

| Responsável | Atividades | Branch sugerida |
| ----------- | ---------- | --------------- |
| Nina | #1, #2 | `feature/nina-frontend-setup` |
| Anderson | #3, #5 | `feature/anderson-backend-setup` |
| Anderson | #4 | `feature/anderson-supabase-jdbc` |
| Jaqueline | #6 | `feature/jaqueline-admin-login` |
| Pedro | #7, #8 | `feature/pedro-database-setup` |
| Nina | #9 | `feature/nina-test-setup` |

Observacao: a atividade #4 deve ser iniciada depois da #7, porque a conexao JDBC depende das tabelas do Supabase.

## Padrão de commits

Use mensagens curtas no padrão:

```text
tipo: descrição objetiva
```

Tipos recomendados:

- `feat`: nova funcionalidade
- `fix`: correção
- `docs`: documentação
- `test`: testes
- `refactor`: reorganização sem mudar comportamento
- `chore`: configuração, build ou tarefas internas

Exemplos:

```bash
git commit -m "feat: criar estrutura inicial do backend"
git commit -m "docs: adicionar fluxo de pull requests"
```

## Fluxo de trabalho

1. Atualizar a `main` antes de começar.
2. Criar uma branch para a tarefa.
3. Fazer commits pequenos e focados.
4. Rodar os testes da área alterada.
5. Abrir pull request para `main`.
6. Solicitar revisão de pelo menos uma pessoa.
7. Corrigir comentários da revisão.
8. Fazer merge apenas depois dos checks passarem.

## Regras de pull request

- O PR deve explicar o que foi feito e qual issue/tarefa atende.
- O PR não deve misturar frontend, backend e documentação sem necessidade.
- Código Java deve compilar e testes devem passar com `mvn test` dentro de `backend/`.
- Mudanças em banco de dados devem incluir script SQL em `backend/src/main/resources/db/migration` ou pasta equivalente definida pela equipe.
- Não commitar credenciais, tokens, URLs privadas de banco ou arquivos `.env`.

## Checklist de PR

```markdown
## O que foi feito
- 

## Issue/Tarefa
Closes #

## Como testar
- [ ] `cd backend && mvn test`

## Observações
- 
```

## Proteções recomendadas no GitHub

Configurar em `Settings > Branches > Branch protection rules` para `main`:

- exigir pull request antes do merge;
- exigir pelo menos 1 aprovação;
- bloquear merge com conversa não resolvida;
- exigir branch atualizada antes do merge, se o time estiver trabalhando em paralelo;
- restringir push direto na `main`.
