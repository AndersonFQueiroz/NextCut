# NextCut

[![CI Tests](https://github.com/AndersonFQueiroz/NextCut/actions/workflows/tests.yml/badge.svg)](https://github.com/AndersonFQueiroz/NextCut/actions/workflows/tests.yml)

Base do frontend (**React + Vite + TailwindCSS**), componentes **Button / Input / Card**, testes (**Vitest** no frontend, **JUnit 5 + Mockito** no backend mínimo) e **GitHub Actions**.

## Rodar o frontend

```bash
nextcut/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── tests/
│
├── backend/
│   ├── src/main/java/com/nextcut/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── dao/
│   │   ├── model/
│   │   ├── websocket/
│   │   ├── config/
│   │   └── util/
│   │
│   └── src/test/
│
└── docs/
```

---

# ⚙️ Stack Tecnológica

## 🎨 Frontend

* React JS
* Vite
* TailwindCSS
* Axios
* React Router
* Context API
* WebSocket

## 🛠️ Backend

* Java 17+
* Javalin
* Maven
* JDBC
* BCrypt
* JUnit
* Mockito

## 🗄️ Banco de Dados

* Supabase PostgreSQL
* Supabase Auth
* Supabase Realtime

---

# 🔁 Fluxo Principal do Sistema

```mermaid
sequenceDiagram
    participant Cliente
    participant Frontend
    participant Backend
    participant DB
    participant WebSocket

    Cliente->>Frontend: Preenche nome + telefone
    Frontend->>Backend: POST /queue/join
    Backend->>DB: Salva entrada
    Backend->>Backend: Atualiza ArrayDeque
    Backend->>WebSocket: Broadcast atualização
    WebSocket-->>Frontend: Nova posição
    Frontend-->>Cliente: Exibe senha e posição
```

---

# 📋 Regras de Negócio

## 🔒 Regras Obrigatórias

* FIFO (First In, First Out)
* Senha sequencial
* Telefone único
* Cliente não duplica
* Apenas admin gerencia fila
* Atualização em tempo real
* Persistência híbrida (memória + banco)

---

# 🗃️ Modelagem de Dados

## Tabela: `barber`

| Campo               | Tipo      |
| ------------------- | --------- |
| id                  | UUID      |
| username            | VARCHAR   |
| password_hash       | TEXT      |
| avg_service_minutes | INT       |
| is_open             | BOOLEAN   |
| created_at          | TIMESTAMP |

## Tabela: `queue_entries`

| Campo         | Tipo      |
| ------------- | --------- |
| id            | UUID      |
| ticket_number | INT       |
| client_name   | VARCHAR   |
| client_phone  | VARCHAR   |
| status        | VARCHAR   |
| position      | INT       |
| entered_at    | TIMESTAMP |
| called_at     | TIMESTAMP |

---

# 🌐 Endpoints da API

> Estado atual: backend base criado com Javalin e fila em memória. A integração JDBC/Supabase fica para depois da atividade #7, quando as tabelas estiverem prontas.

## Cliente

```http
GET /
POST /queue/join
GET /queue/status/{phone}
POST /queue/leave/{phone}
cd frontend
npm install
npm run dev
```

## Testes

```bash
cd frontend && npm test
cd backend && mvn test
```

## Estrutura

```

## Rodar o backend localmente

Pré-requisitos:

* Java 17+
* Maven 3.9+

```bash
cd backend
mvn test
mvn exec:java -Dexec.mainClass="com.nextcut.app.Main"
```

Por padrão, a API sobe em:

```http
http://localhost:8080
```

---

# 🔐 Segurança

## Implementado:

* BCrypt password hashing
* Sanitização de dados
* Validação de telefone
* Proteção contra duplicidade
* Sessão/JWT seguro
* Erros controlados

---

# 🧪 Testes

## Backend

* QueueService
* AuthService
* DAO
* FIFO
* Tempo estimado

## Frontend

* Formulários
* Integração API
* Estados de loading/error
* Renderização

```mermaid
flowchart LR
    A[Testes Unitários] --> B[Testes Integração]
    B --> C[Testes Fluxo Crítico]
    C --> D[Deploy]
```

---

# ✔ 📄 Documentação e Planejamento

Veja os arquivos de especificação para detalhes:

* [agents.md](./agents.md) — Guia mestre para agentes de IA e developers
* [specs.md](./specs.md) — Especificações técnicas
* [requirements.md](./requirements.md) — Requisitos funcionais
* [docs/git-workflow.md](./docs/git-workflow.md) — Fluxo Git, branches e checklist de PR

---

# 📈 Roadmap

## ✏️ Fase Atual: Design e Planejamento

* [x] Definição de arquitetura
* [x] Especificação de requisitos
* [x] Modelagem de dados
* [x] Design de API
* [x] Estrutura de pastas

## 🔨 Fase 1: MVP Core

* [ ] Estrutura base (frontend + backend)
* [ ] Banco de dados (Supabase)
* [ ] Login admin
* [ ] Entrada na fila
* [ ] Dashboard
* [ ] Tempo real (WebSocket)

## 🚀 Fase 2: Melhorias

* [ ] WhatsApp notifications
* [ ] Multi-barbeiro
* [ ] Histórico avançado
* [ ] Dashboard analytics
* [ ] Painel TV

---

# 🎨 Diferenciais

## 💥 O que torna o NextCut especial:

### Velocidade

Fila instantânea e atualizações em segundos

### Profissionalismo

Visual moderno e experiência premium

### Escalabilidade

Base pronta para crescimento

### Didático

Código estruturado para aprendizado

---

# 🤝 Contribuição

## Padrões:

* Clean Architecture
* SOLID
* DRY
* KISS
* Testes obrigatórios

---

# 📜 Licença

Este projeto pode ser adaptado para fins acadêmicos, comerciais ou evolutivos conforme necessidade.

---

<div align="center">

# ✂️ NextCut

### Simples para usar. Poderoso para gerenciar.

## “Sua barbearia merece mais que papel.”

</div>
├── frontend/     # Vite + React + Tailwind
├── backend/      # Maven — apenas dependências de teste (issue #9)
└── .github/workflows/tests.yml
```
