# Contribuindo para o NextCut

Primeiramente, obrigado por considerar contribuir para o **NextCut**! Este é um projeto de código aberto, focado em criar um sistema robusto e moderno de fila virtual para barbearias, priorizando código limpo, boas práticas e um ambiente de fácil aprendizado.

Abaixo, você encontrará as diretrizes gerais para participar do desenvolvimento do projeto.

---

## 1. Fluxo de Trabalho (Git Flow Simplificado)

Adotamos um fluxo simples baseado em branches e Pull Requests para manter o histórico limpo e revisado.

1. **Fork o repositório** (se você for um colaborador externo).
2. **Crie uma branch** para sua feature ou correção:
   ```bash
   git checkout -b feat/minha-nova-funcionalidade
   ```
   ou
   ```bash
   git checkout -b fix/correcao-de-bug
   ```
3. **Faça as modificações** necessárias.
4. **Comite suas mudanças** seguindo o padrão descrito abaixo.
5. **Faça um Push** para a sua branch:
   ```bash
   git push origin feat/minha-nova-funcionalidade
   ```
6. **Abra um Pull Request (PR)** detalhando o que foi feito.

---

## 2. Padrão de Commits (Conventional Commits)

Nós seguimos rigorosamente a especificação do [Conventional Commits](https://www.conventionalcommits.org/). Todas as mensagens de commit devem seguir este formato:

```
<tipo>(<escopo>): <descrição em português>
```

### Tipos Permitidos:
- **`feat`**: Nova funcionalidade ou recurso.
- **`fix`**: Correção de bug.
- **`refactor`**: Refatoração de código que não altera comportamento (nem corrige bug, nem adiciona feature).
- **`test`**: Adição, correção ou refatoração de testes.
- **`docs`**: Atualização ou criação de arquivos de documentação (como este).
- **`style`**: Formatação de código, ponto e vírgula, tabs vs espaços (sem impacto na lógica).
- **`chore`**: Atualizações de tarefas de build, configuração de pacotes ou ferramentas.
- **`perf`**: Alteração de código voltada a melhoria de performance.

**Exemplos Corretos:**
- `feat(queue): adiciona verificação de OTP ao entrar na fila`
- `fix(auth): resolve erro de token expirado no frontend`
- `docs(readme): atualiza instruções de build do projeto`

**Exemplos Proibidos (NÃO FAÇA):**
- ❌ `update`
- ❌ `fix stuff`
- ❌ `wip`
- ❌ `fiz as telas do admin`

> **Nota Crítica sobre Identidade de IA:** Se você estiver utilizando assistentes de IA (como Cursor, Copilot, etc.), **nunca** permita que a IA altere o autor do commit ou adicione `Co-authored-by` com nomes de bots. O commit deve sempre estar associado à identidade real do desenvolvedor.

---

## 3. Padrões de Código

Nosso objetivo é manter o código didático e profissional. 

### Backend (Java / Javalin)
- Arquitetura baseada em Controller -> Service -> DAO.
- Nomes de classes, métodos e variáveis em **Inglês**.
- Comentários de documentação (JavaDoc) em **Português**, focando no **porquê** as coisas foram feitas, e não apenas o quê.
- Testes unitários (JUnit + Mockito) são obrigatórios para lógicas de negócio (Services).

### Frontend (React / Vite)
- Componentes funcionais e Hooks.
- Estilização majoritariamente utilizando **TailwindCSS**.
- Nomes de componentes, variáveis e funções em **Inglês**.
- Comentários descritivos (JSDoc) em **Português** para explicar `useEffect`s ou lógicas complexas de UI.

---

## 4. Ambiente de Desenvolvimento Local

### Banco de Dados & Variáveis de Ambiente
O sistema utiliza PostgreSQL (geralmente via Supabase). Para testes locais, garanta que você possui as variáveis de ambiente configuradas corretamente.
Tanto na pasta `/frontend` quanto na `/backend`, copie o arquivo `.env.example` para `.env` e preencha com suas credenciais locais:
```bash
cp .env.example .env
```

> [!IMPORTANT]
> **Desenvolvimento no GitHub Codespaces**
> Se estiver rodando no Codespace:
> 1. Torne a porta do backend pública rodando: `gh codespace ports visibility 8080:public -c $CODESPACE_NAME`
> 2. No `.env` do frontend, mude o `localhost` para a URL fornecida pelo Codespace (ex: `https://NOME_DO_CODESPACE-8080.app.github.dev`).

### Rodando o Backend
Na pasta `/backend`:
```bash
mvn clean install
mvn exec:java "-Dexec.mainClass=com.nextcut.app.App"
```

### Rodando o Frontend
Na pasta `/frontend`:
```bash
npm install
npm run dev
```

---

## 5. Dúvidas e Reporte de Bugs

Se você encontrou um bug ou tem uma sugestão de nova funcionalidade, sinta-se à vontade para abrir uma **Issue** no repositório descrevendo o cenário com o máximo de detalhes (passos para reproduzir, comportamento esperado x atual, prints de tela).

Agradecemos imensamente por ajudar a construir o NextCut! ✂️
