-- Migração para adicionar colunas de pagamento ao finalizar atendimento.
-- Execute este SQL no Supabase (SQL Editor) antes de usar o recurso de Pix.

ALTER TABLE queue_entries
ADD COLUMN IF NOT EXISTS paid_amount DOUBLE PRECISION DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tip_amount  DOUBLE PRECISION DEFAULT NULL;

-- Comentários para documentação no banco
COMMENT ON COLUMN queue_entries.paid_amount IS 'Valor cobrado pelo serviço (R$), preenchido ao finalizar atendimento';
COMMENT ON COLUMN queue_entries.tip_amount  IS 'Valor da gorjeta (R$) escolhida pelo cliente, preenchido ao finalizar';
