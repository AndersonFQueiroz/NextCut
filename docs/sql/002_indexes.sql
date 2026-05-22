-- 002_indexes.sql
-- Autor: Jaqueline — Semana 2 — Tarefa #19
--
-- Os índices de performance da tabela queue_entries já foram
-- criados em 001_initial.sql como parte da estrutura base.
-- Este arquivo os documenta formalmente conforme critério #19.
--
-- idx_queue_phone    → buscas por client_phone (telefone do cliente)
-- idx_queue_status   → filtros por status (WAITING, IN_SERVICE...)
-- idx_queue_position → ordenação da fila por posição
--
-- Nenhum comando adicional é necessário: os comandos do 001_initial.sql
-- usam IF NOT EXISTS para evitar erros e índices duplicados.

SELECT 'Índices de performance já aplicados em 001_initial.sql' AS info;
