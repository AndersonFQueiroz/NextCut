# Guia de Contribuição - NextCut

Obrigado por se interessar em contribuir para o NextCut! Como este é um projeto acadêmico e profissional, seguimos padrões rigorosos de qualidade.

## Fluxo de Trabalho (Git Flow Simplificado)

1.  **Sincronização:** Sempre inicie o trabalho puxando as atualizações da `main`.
2.  **Branches:** Crie branches descritivas: `feature/nome-da-tarefa` ou `bugfix/descricao-do-erro`.
3.  **Commits:** Use mensagens claras e em português. Ex: `feat: implementa persistência JDBC para fila`.
4.  **Pull Requests:** Todo código deve passar por PR antes de entrar na `main`.

## Padrões de Código

### Backend (Java)
- Use **PreparedStatements** para qualquer interação com o banco.
- Documente métodos complexos com **JavaDoc**.
- Mantenha o padrão de nomes `camelCase` para métodos e variáveis.
- Tratamento de exceções: Relance exceções de infraestrutura (SQL) como `RuntimeException` com mensagens úteis.

### Frontend (React)
- Utilize componentes funcionais e Hooks.
- Estilização via **Tailwind CSS**.
- Mantenha a lógica de API isolada na pasta `services/`.

## Requisitos de Qualidade
- **Testes:** Novas funcionalidades devem vir acompanhadas de testes unitários.
- **Documentação:** Atualize o `README.md` ou docs internos se houver mudança na arquitetura.
- **Segurança:** Nunca comite arquivos `.env` ou chaves de API.

## Como Reportar Problemas
Use as **Issues** do GitHub para descrever bugs ou sugerir melhorias.
