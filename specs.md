# Specs — NextCut (Especificação Técnica)

## 1. Stack Técnica

### Backend
- Java 17+
- Javalin
- WebSocket (Javalin API)
- BCrypt (hash de senha)
- Maven

### Banco de Dados
- Supabase (PostgreSQL)
- JDBC
- DAO (persistência manual)

### Deploy
- Frontend: Vercel
- Backend: serviço Java (ex: Railway ou Render)

---

## 2. Arquitetura

Cliente → HTTP/WebSocket → Javalin → Service → DAO → Supabase (PostgreSQL)

---

## 3. Modelagem de Dados

### barber
- id
- username
- password_hash
- avg_service_minutes
- is_open
- created_at

### queue_entries
- id
- ticket_number
- client_name
- client_phone
- status
- position
- entered_at
- called_at

---

## 4. Estrutura de Pacotes

com.nextcut
- app
- config
- controller
- service
- model
- dao
- websocket

---

## 5. Endpoints

### Implementados no backend atual

### Cliente
- GET /
- POST /queue/request-otp
- POST /queue/verify-otp
- POST /queue/join (legado interno)
- GET /queue/status/{phone}
- POST /queue/leave/{phone}

### Barbeiro
- POST /login
- POST /admin/next

### WebSocket
- /ws/queue

### Planejados para completar o painel administrativo
- POST /admin/remove/{id}
- POST /admin/toggle

---

## 6. Estrutura de Dados

- ArrayDeque<QueueEntry> (FIFO)

---

## 7. Regras Técnicas

- Fila baseada em FIFO
- Identificação única por telefone
- Status: WAITING, IN_SERVICE, DONE, LEFT
- Estimativa baseada em tempo médio configurável

---

## 8. Conceitos Aplicados

- Encapsulamento: QueueService
- Abstração: DAO
- Collections: Queue/Deque
