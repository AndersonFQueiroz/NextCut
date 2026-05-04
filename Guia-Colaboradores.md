# Guia para Colaboradores - Fluxo de Trabalho com Branches

Este guia explica como trabalhar em equipe no repositório `NextCut` usando Git e GitHub. Cada colaborador deve seguir estes passos para criar sua própria branch, trabalhar nela, fazer push e solicitar merge via Pull Request (PR).

## Pré-requisitos
- Instale Git (se não tiver): `sudo apt install git` (no Linux).
- Configure seu Git (rode uma vez): `git config --global user.name "Seu Nome"` e `git config --global user.email "seuemail@example.com"`.
- Clone o repositório: `git clone https://github.com/AndersonFQueiroz/NextCut`.

## Passos para Trabalhar em uma Feature

### 1. Atualizar a Branch Principal (`main`)
Antes de começar qualquer trabalho, certifique-se de que sua cópia local de `main` está atualizada.
```bash
git checkout main
git pull origin main
```

### 2. Criar uma Branch Pessoal
Crie uma nova branch baseada em `main`. Use um nome descritivo, como `feature-seu-nome-descricao`.
```bash
git checkout -b feature-seu-nome-descricao
```
Exemplo: `git checkout -b feature-joao-login`.

### 3. Trabalhar na Branch
- Edite arquivos, adicione código, etc.
- Teste suas mudanças localmente.

### 4. Committar Mudanças
Adicione os arquivos modificados e faça um commit.
```bash
git add .  # Adiciona todos os arquivos modificados
git commit -m "Descrição clara das mudanças, ex.: Adicionada funcionalidade de login"
```

### 5. Fazer Push da Branch
Envie sua branch para o GitHub.
```bash
git push origin feature-seu-nome-descricao
```
Na primeira vez, pode ser necessário: `git push -u origin feature-seu-nome-descricao`.

### 6. Criar um Pull Request (PR)
- Vá para o repositório no GitHub (https://github.com/AndersonFQueiroz/NextCut).
- Clique em "Pull requests" > "New pull request".
- Selecione: **base: main**, **compare: feature-seu-nome-descricao**.
- Adicione título e descrição (explique o que fez).
- Clique em "Create pull request".
- Aguarde revisão e aprovação.

### 7. Após o Merge
- O proprietário (Anderson) revisará e fará o merge.
- Delete a branch local: `git branch -d feature-seu-nome-descricao`.
- Delete a branch remota (opcional): `git push origin --delete feature-seu-nome-descricao`.

## Lidando com Conflitos
Se houver conflitos (quando dois colaboradores mudam o mesmo arquivo):
1. Atualize `main`: `git checkout main && git pull`.
2. Mescle `main` na sua branch: `git checkout feature-seu-nome-descricao && git merge main`.
3. Resolva conflitos editando os arquivos (procure por `<<<<<<<`, `=======`, `>>>>>>>`).
4. Committe: `git add . && git commit -m "Resolvido conflitos"`.
5. Push novamente: `git push origin feature-seu-nome-descricao`.

## Dicas
- Sempre trabalhe em sua própria branch, nunca diretamente em `main`.
- Faça commits pequenos e frequentes.
- Use mensagens de commit claras.
- Se precisar de ajuda, pergunte no PR ou no chat da equipe.

Se tiver dúvidas, consulte a documentação do Git ou pergunte ao Anderson!</content>
<parameter name="filePath">/home/anderson/Documentos/Projetos/NextCut/Guia-Colaboradores.md