-- ============================================================
--  NextCut — 001_initial.sql
--  Pasta: /docs/sql/001_initial.sql
--  Autor: Muginski
-- ============================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TABELA: barber
CREATE TABLE IF NOT EXISTS barber (
    id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    username             VARCHAR(50)  NOT NULL UNIQUE,
    password_hash        TEXT         NOT NULL,
    avg_service_minutes  INT          NOT NULL DEFAULT 20 CHECK (avg_service_minutes > 0),
    is_open              BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ENUM: status da fila (valores exatos conforme issue #7)
DO $$ BEGIN
    CREATE TYPE queue_status AS ENUM (
        'WAITING',
        'IN_SERVICE',
        'DONE',
        'LEFT'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- TABELA: queue_entries
CREATE TABLE IF NOT EXISTS queue_entries (
    id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number  INT           NOT NULL,
    client_name    VARCHAR(100)  NOT NULL,
    client_phone   VARCHAR(20)   NOT NULL,
    status         queue_status  NOT NULL DEFAULT 'WAITING',
    position       INT           NOT NULL,
    entered_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    entered_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
    called_at      TIMESTAMPTZ   NULL
);

-- ÍNDICES
CREATE UNIQUE INDEX IF NOT EXISTS uq_phone_per_day
    ON queue_entries (client_phone, entered_date);
CREATE INDEX IF NOT EXISTS idx_queue_phone    ON queue_entries (client_phone);
CREATE INDEX IF NOT EXISTS idx_queue_status   ON queue_entries (status);
CREATE INDEX IF NOT EXISTS idx_queue_position ON queue_entries (position);
CREATE INDEX IF NOT EXISTS idx_queue_date     ON queue_entries (entered_date);

-- FUNÇÃO: próxima senha do dia
CREATE OR REPLACE FUNCTION next_ticket_number()
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE v_max INT;
BEGIN
    SELECT COALESCE(MAX(ticket_number), 0) + 1 INTO v_max
    FROM queue_entries WHERE entered_date = CURRENT_DATE;
    RETURN v_max;
END;
$$;

-- FUNÇÃO: fechar fila do dia
CREATE OR REPLACE FUNCTION clear_daily_queue()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE queue_entries SET status = 'LEFT'
    WHERE status = 'WAITING' AND entered_date = CURRENT_DATE;
END;
$$;

-- VIEW: fila ativa com estimativa de espera
CREATE OR REPLACE VIEW vw_active_queue AS
SELECT id, ticket_number, client_name, client_phone,
       status, position, entered_at, called_at,
       position * (SELECT avg_service_minutes FROM barber LIMIT 1) AS estimated_wait_minutes
FROM queue_entries
WHERE status = 'WAITING' AND entered_date = CURRENT_DATE
ORDER BY position ASC;

-- RLS
ALTER TABLE barber        ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem entrar na fila"
    ON queue_entries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Fila é pública para leitura"
    ON queue_entries FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Apenas barbeiro pode gerenciar a fila"
    ON queue_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Barbeiro lê apenas seus próprios dados"
    ON barber FOR SELECT TO authenticated USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Barbeiro atualiza apenas seus próprios dados"
    ON barber FOR UPDATE TO authenticated USING (auth.uid()::TEXT = id::TEXT);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE barber;

-- SEED: barbeiro admin (senha: admin123 hasheada com BCrypt 12 rounds)
INSERT INTO barber (username, password_hash, avg_service_minutes, is_open)
VALUES (
    'admin',
    '$2a$12$eixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    20,
    FALSE
)
ON CONFLICT (username) DO NOTHING;