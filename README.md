# ✂️ NextCut — Fila Virtual para Barbearia

[![CI Tests](https://github.com/AndersonFQueiroz/NextCut/actions/workflows/tests.yml/badge.svg)](https://github.com/AndersonFQueiroz/NextCut/actions/workflows/tests.yml)

<div align="center">

## 🚀 Modernizando o atendimento da barbearia com tecnologia em tempo real

### Transforme o antigo caderno físico em uma experiência digital inteligente, rápida e profissional.

![React](https://img.shields.io/badge/Frontend-React_JS-61DAFB?style=for-the-badge&logo=react)
![Java](https://img.shields.io/badge/Backend-Java_17+-ED8B00?style=for-the-badge&logo=openjdk)
![Javalin](https://img.shields.io/badge/API-Javalin-000000?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![WebSocket](https://img.shields.io/badge/Realtime-WebSocket-010101?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-JUnit_+_Mockito-success?style=for-the-badge)

</div>

---

# 🛠️ Início rápido (desenvolvimento)

Pré-requisitos:

* Node.js 20+
* Java 17+
* Maven 3.9+

**Backend** (Javalin + Maven):

```bash
cd backend
mvn test
 Get-Content .env | Where-Object { $_ -match '^\w+=' } | ForEach-Object { $name, $value = $_.Split('=', 2); [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }; mvn exec:java "-Dexec.mainClass=com.nextcut.app.App"
```

Por padrão, a API sobe em:

```http
http://localhost:8080
```

**Frontend** (Vite + React + Tailwind; testes com Vitest em ambiente `jsdom`):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Testes** (local e CI):

```bash
cd frontend && npm test
cd backend && mvn test
```

---

# 📌 Sobre o Projeto

**NextCut** é uma plataforma web de fila virtual para barbearias que desejam abandonar métodos manuais e oferecer uma experiência moderna aos clientes.

> 🎯 **Estado atual**: frontend React com telas de cliente (incluindo verificação de telefone via código OTP de 4 dígitos), acompanhamento da fila, login e painel administrativo; backend Java com Javalin, JDBC/PostgreSQL, autenticação BCrypt, fila FIFO com tratamento para clientes `IN_SERVICE` e `WAITING`, além de WebSocket para atualização em tempo real. Algumas ações administrativas exibidas na UI ainda dependem de endpoints backend futuros, conforme planejamento do projeto.

## 🎯 Problema Resolvido
### Antes:
- Caderno físico
- Confusão na ordem
- Cliente preso no local
- Falta de previsibilidade
- Gestão manual

### Depois:
- Entrada via link
- Fila em tempo real
- Senha automática
- Acompanhamento remoto
- Painel administrativo

---

# 🌟 Principais Funcionalidades

## 👤 Cliente
- Entrar na fila com nome + telefone
- Receber senha sequencial automática
- Acompanhar posição em tempo real
- Ver estimativa de espera
- Sair da fila

## 💈 Barbeiro (Admin)
- Login seguro
- Visualizar fila completa
- Chamar próximo cliente
- Remover clientes (previsto no planejamento)
- Abrir/Fechar atendimento (previsto no planejamento)
- Ajustar tempo médio de serviço (previsto no planejamento)

---

# 🧠 Arquitetura do Sistema

```mermaid
flowchart LR
    A[Cliente / Barbeiro Frontend React] --> B[HTTP REST API]
    A --> C[WebSocket Tempo Real]
    B --> D[Javalin Controllers]
    C --> E[WebSocket Manager]
    D --> F[Service Layer]
    E --> F
    F --> G[DAO Layer]
    G --> H[(Supabase PostgreSQL)]
```

---

# 🏗️ Clean Architecture

```mermaid
flowchart TD
    UI[Frontend React] --> Controller
    Controller --> Service
    Service --> DAO
    DAO --> Database[(Supabase)]
    Service --> QueueMemory[(ArrayDeque FIFO)]
```

---

# 📂 Estrutura de Pastas

```bash
nextcut/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── routes/
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
* Vitest (com `jsdom`)
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
* JDBC
* Scripts SQL em `docs/sql/`
* Autenticação própria com BCrypt
* Atualização em tempo real via WebSocket Javalin

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
    Frontend->>Backend: POST /queue/request-otp
    Backend-->>Frontend: Simulação envio de código via Console/Log
    Cliente->>Frontend: Digita código de 4 dígitos na tela de OTP
    Frontend->>Backend: POST /queue/verify-otp
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

Estado atual do backend:

## Cliente

```http
GET /
POST /queue/request-otp
POST /queue/verify-otp
POST /queue/join (Legado interno)
GET /queue/status/{phone}
POST /queue/leave/{phone}
```

## Admin

```http
POST /login
POST /admin/next
```

Planejados para o painel administrativo:

```http
POST /admin/remove/{id}
POST /admin/toggle
```

## WebSocket

```http
/ws/queue
```

# 🔐 Segurança

## Implementado:

* BCrypt password hashing
* Validação de telefone
* Proteção contra duplicidade
* Token de sessão simples para o painel
* Erros controlados

---

# 🧪 Testes

> **Issue #9:** o frontend usa **Vitest** + Testing Library (padrão recomendado com Vite); o comando continua sendo `npm test`, como nos critérios de aceite.

## Backend

* QueueService
* AuthService
* DatabaseConfig
* FIFO
* Duplicidade por telefone

## Frontend

* Componentes base
* Renderização com Testing Library
* Estados visuais de botao

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
* [CONTRIBUTING.md](./CONTRIBUTING.md) — Como contribuir e padrões do repositório

---

# 📈 Roadmap

## ✏️ Fundação do Projeto

* [x] Definição de arquitetura
* [x] Especificação de requisitos
* [x] Modelagem de dados
* [x] Design de API
* [x] Estrutura de pastas

## 🔨 Fase 1: MVP Core

* [x] Estrutura base (frontend + backend)
* [x] Banco de dados via JDBC/PostgreSQL
* [x] Login admin
* [x] Entrada na fila
* [x] Tela de acompanhamento
* [x] Tempo real (WebSocket)
* [ ] Completar endpoints administrativos de remover cliente e alternar atendimento

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
