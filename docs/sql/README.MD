# 🗄️ Banco de Dados — NextCut

Documentação do banco de dados PostgreSQL via Supabase utilizado no sistema de fila virtual NextCut.

---

## 🛠️ Tecnologia

- **Supabase** (PostgreSQL gerenciado)
- **JDBC** para conexão com o backend Java
- **Supabase Realtime** para atualizações em tempo real
- **Row Level Security (RLS)** para segurança por linha

---

## 📂 Arquivos SQL

| Arquivo | Descrição |
|---|---|
| `docs/sql/001_initial.sql` | Criação das tabelas, índices, funções, view, RLS e seed inicial |
| `docs/sql/002_indexes.sql` | Índices de performance (em desenvolvimento) |

---

## 📋 Tabelas

### `barber`
Armazena os dados do barbeiro/administrador do sistema.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária gerada automaticamente |
| `username` | VARCHAR(50) | Nome de usuário para login (único) |
| `password_hash` | TEXT | Senha hasheada com BCrypt |
| `avg_service_minutes` | INT | Tempo médio de atendimento em minutos (padrão: 20) |
| `is_open` | BOOLEAN | Se a barbearia está aberta (padrão: false) |
| `created_at` | TIMESTAMPTZ | Data/hora de criação (padrão: now()) |

---

### `queue_entries`
Armazena cada cliente que entra na fila virtual.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária gerada automaticamente |
| `ticket_number` | INT | Número da senha exibida ao cliente |
| `client_name` | VARCHAR(100) | Nome do cliente |
| `client_phone` | VARCHAR(20) | Telefone do cliente |
| `status` | queue_status | Status atual na fila |
| `position` | INT | Posição atual na fila |
| `entered_at` | TIMESTAMPTZ | Momento de entrada na fila (padrão: now()) |
| `entered_date` | DATE | Data de entrada (padrão: today) |
| `called_at` | TIMESTAMPTZ | Momento em que o barbeiro chamou o cliente |

---

## 🔤 ENUM: `queue_status`

| Valor | Descrição |
|---|---|
| `WAITING` | Cliente aguardando na fila |
| `IN_SERVICE` | Cliente sendo atendido |
| `DONE` | Atendimento concluído |
| `LEFT` | Cliente saiu da fila |

---

## ⚡ Funções

### `next_ticket_number()`
Retorna o próximo número de senha do dia atual.
```sql
SELECT next_ticket_number();
```

### `clear_daily_queue()`
Marca todos os clientes em `WAITING` do dia como `LEFT`.
Chamada automaticamente ao fechar a barbearia.
```sql
SELECT clear_daily_queue();
```

---

## 👁️ View: `vw_active_queue`
Retorna a fila ativa do dia com estimativa de espera calculada automaticamente.

```sql
SELECT * FROM vw_active_queue;
```

| Coluna | Descrição |
|---|---|
| `id` | ID do cliente na fila |
| `ticket_number` | Número da senha |
| `client_name` | Nome do cliente |
| `client_phone` | Telefone do cliente |
| `status` | Status atual |
| `position` | Posição na fila |
| `entered_at` | Hora de entrada |
| `called_at` | Hora que foi chamado |
| `estimated_wait_minutes` | Estimativa de espera em minutos |

---

## 🔒 Segurança (RLS)

| Tabela | Ação | Quem pode |
|---|---|---|
| `queue_entries` | INSERT | Qualquer um (anônimo ou autenticado) |
| `queue_entries` | SELECT | Qualquer um (anônimo ou autenticado) |
| `queue_entries` | UPDATE/DELETE | Apenas barbeiro autenticado |
| `barber` | SELECT/UPDATE | Apenas o próprio barbeiro autenticado |

---

## 📡 Realtime

As tabelas `queue_entries` e `barber` estão com Realtime habilitado no Supabase.
O frontend React recebe atualizações automáticas via WebSocket sempre que a fila mudar.

---

## 🚀 Como recriar o banco do zero

1. Acesse **Supabase → SQL Editor**
2. Cole e execute o arquivo `docs/sql/001_initial.sql`
3. O banco será criado com as tabelas, índices, funções e o barbeiro admin padrão

> ⚠️ **Atenção:** O hash da senha do admin no seed é apenas para desenvolvimento.
> Substituir pela senha real gerada pelo backend Java antes de ir para produção.

---

## 👤 Responsável

Desenvolvido por **Muginski** — Semana 1 e 2 do projeto NextCut.
