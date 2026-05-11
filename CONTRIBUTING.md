# Contribuindo com o NextCut

## Fluxo de branches

- `main`: codigo estavel, atualizado apenas por pull request aprovado.
- `develop`: integracao das entregas antes de promover para `main`.
- `feature/<responsavel>-<descricao>`: novas funcionalidades.
- `fix/<responsavel>-<descricao>`: correcoes.
- `docs/<responsavel>-<descricao>`: documentacao.

Exemplo:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/anderson-backend-setup
```

## Commits

Use o formato:

```text
tipo: descricao curta (#issue)
```

Tipos recomendados:

- `feat`: funcionalidade
- `fix`: correcao
- `docs`: documentacao
- `test`: testes
- `refactor`: melhoria interna
- `chore`: configuracao ou tarefas de apoio

Exemplos:

```bash
git commit -m "feat: criar estrutura inicial do backend (#3)"
git commit -m "docs: documentar fluxo git do time (#5)"
```

## Pull requests

- Abra PR da sua branch para `develop`, salvo combinacao diferente do time.
- Explique o que foi feito e cite a issue.
- Rode os testes da area alterada antes de pedir revisao.
- Nao inclua credenciais, tokens ou arquivos `.env`.
- Nao misture tarefas sem relacao no mesmo PR.

## Backend

```bash
cd backend
mvn test
mvn package
```

## Checklist

- [ ] A branch segue o padrao do projeto.
- [ ] O commit cita a issue quando existir.
- [ ] Os testes foram executados.
- [ ] O PR usa o template do repositorio.
- [ ] Nao ha credenciais no diff.
