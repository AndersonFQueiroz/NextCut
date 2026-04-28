# AGENTS.md — NextCut (Fila Virtual para Barbearia)

> Documento mestre para agentes de IA, desenvolvedores e colaboradores técnicos.
> Objetivo: garantir desenvolvimento consistente, escalável, seguro, didático e pronto para produção.

---

# 1. VISÃO GERAL DO PROJETO

## Nome:
**NextCut**

## Objetivo:
Construir uma plataforma web responsiva de fila virtual para barbearia onde:
- Clientes entram na fila via link
- Acompanham posição em tempo real
- Barbeiro gerencia fila
- Sistema substitui controle manual
- Atualização ocorre em tempo real
- Projeto deve ser apresentável academicamente e profissionalmente

---

# 2. PRIORIDADES DO PROJETO (OBRIGATÓRIO)

Toda decisão técnica deve equilibrar:

## A) Velocidade de entrega (MVP)
- Entregar funcionalidades principais primeiro
- Evitar overengineering
- Soluções simples antes de complexas

## B) Código limpo e escalável
- Seguir Clean Architecture
- Separação clara de responsabilidades
- Fácil manutenção

## C) Segurança e robustez
- Login seguro
- Hash de senha
- Validação de dados
- Proteção contra duplicidade

## D) Didático / Fácil entendimento
- Código organizado
- Comentários quando necessário
- Estrutura intuitiva
- Ideal para apresentação acadêmica

---

# 3. STACK OFICIAL (NÃO ALTERAR SEM JUSTIFICATIVA)

## Frontend
- React JS
- Vite
- React Router
- Axios
- TailwindCSS (preferencial)
- WebSocket nativo ou Socket wrapper compatível
- Context API (ou Zustand se necessário)

## Backend
- Java 17+
- Javalin
- Maven
- JDBC
- BCrypt
- WebSocket Javalin
- JUnit + Mockito

## Banco
- Supabase PostgreSQL
- Supabase Auth (quando útil)
- Supabase Realtime (quando útil)
- JDBC como camada principal

## Deploy
### Desenvolvimento:
- Frontend local
- Backend local
- Supabase remoto/local

### Produção:
- Frontend: Vercel
- Backend: Railway/Render

---

# 4. ARQUITETURA OBRIGATÓRIA

## Modelo:
Frontend → HTTP/WebSocket → Controller → Service → DAO → Supabase

## Clean Architecture:
### Backend:
- controller
- service
- dao
- model
- websocket
- config
- util
- tests

### Frontend:
- pages
- components
- hooks
- services
- context
- routes
- utils
- tests

---

# 5. REGRAS ABSOLUTAS DE NEGÓCIO

## Fila:
- FIFO obrigatório
- Senha sequencial
- Telefone único
- Cliente não duplica
- Cliente não altera posição
- Apenas barbeiro manipula fila
- Tempo estimado baseado em avg_service_minutes

## Status válidos:
- WAITING
- IN_SERVICE
- DONE
- LEFT

---

# 6. ESTADO DA FILA (HIBRIDO)

## Obrigatório:
### Memória:
- ArrayDeque para performance

### Persistência:
- PostgreSQL como fonte permanente

## Regra:
- Toda alteração em memória deve sincronizar com banco
- Banco deve permitir reconstrução da fila
- Em reinicialização, fila deve ser restaurada

---

# 7. FRONTEND — INSTRUÇÕES

## Objetivo:
UI moderna, simples, rápida e mobile-first

## Telas:
### Cliente:
- Home / Entrada
- Status da fila
- Sair da fila

### Admin:
- Login
- Dashboard
- Próximo cliente
- Remover cliente
- Abrir/Fechar barbearia

## Regras:
- Design responsivo obrigatório
- Atualização em tempo real
- Estados de loading
- Tratamento de erro
- Validação de formulário
- Máscara de telefone
- UX simples

## Componentização:
- Reutilizar botões
- Reutilizar cards
- Reutilizar inputs
- Evitar lógica excessiva em páginas

---

# 8. BACKEND — INSTRUÇÕES

## Controllers:
Responsáveis apenas por:
- Request
- Response
- Status code
- Validação inicial

## Services:
Responsáveis por:
- Regras de negócio
- Fila
- Cálculo
- Segurança lógica

## DAO:
Responsável por:
- SQL
- Persistência
- Queries

## Nunca:
- SQL em controller
- Regra de negócio em DAO

---

# 9. WEBSOCKET / REALTIME

## Objetivo:
Atualização instantânea para:
- Mudança de posição
- Próximo cliente
- Remoção
- Status da barbearia

## Regra:
Sempre que fila mudar:
- Persistir
- Broadcast

## Prioridade:
1. WebSocket Javalin
2. Supabase Realtime como complemento

---

# 10. SEGURANÇA

## Login:
- BCrypt obrigatório
- Session ou JWT seguro
- Nunca senha em texto puro

## Validações:
- Nome obrigatório
- Telefone obrigatório
- Telefone único
- Sanitização de entrada

## Proteções:
- Rate limiting básico se possível
- Erros sem expor stacktrace

---

# 11. PADRÕES DE CÓDIGO

## Código:
- Inglês
- Nomes descritivos
- Métodos curtos
- SOLID quando possível
- DRY
- KISS

## Documentação:
- Português
- README claro
- Comentários apenas quando agregam

---

# 12. TESTES (OBRIGATÓRIO)

## Cobertura mínima:
### Backend:
- QueueService
- AuthService
- DAO crítico
- Estimativa de tempo
- Regras FIFO

### Frontend:
- Form validation
- API integration
- Render states

## Tipos:
- Unitários
- Integração
- Fluxos críticos

## Regra:
Nenhuma feature crítica sem teste

---

# 13. FLUXO DE DESENVOLVIMENTO

## Ordem:
### Fase 1:
- Estrutura base
- Banco
- Login
- Entrada fila

### Fase 2:
- Dashboard admin
- WebSocket
- Atualização real

### Fase 3:
- Estimativa
- Destaques
- UX polish

### Fase 4:
- Deploy
- Segurança extra
- Monitoramento

---

# 14. LIMITES (NÃO IMPLEMENTAR AGORA)

## Proibido:
- Multi-barbearia
- Pagamento
- App mobile nativo
- Sistema complexo de usuários
- Gamificação
- Features fora do escopo MVP

---

# 15. CHECKLIST ANTES DE QUALQUER MUDANÇA

## Perguntar:
- Isso quebra FIFO?
- Isso mantém sincronização híbrida?
- Isso segue Clean Architecture?
- Isso é seguro?
- Isso mantém simplicidade?
- Existe teste?
- É apresentável?

---

# 16. PADRÃO DE RESPOSTA PARA AGENTES

Ao criar qualquer funcionalidade:
## Sempre:
1. Explicar objetivo
2. Definir arquivos afetados
3. Seguir arquitetura
4. Implementar
5. Testar
6. Documentar

---

# 17. ROADMAP FUTURO (APÓS MVP)
- Notificações WhatsApp
- Múltiplos barbeiros
- Histórico avançado
- Analytics
- Painel TV

---

# 18. FILOSOFIA FINAL

**NextCut deve ser:**
## Simples o suficiente para apresentar,
## Robusto o suficiente para funcionar,
## Limpo o suficiente para evoluir,
## Rápido o suficiente para impressionar.

---

# REGRA MESTRA
> Sempre priorize soluções claras, testáveis, seguras e alinhadas ao escopo.
> Evite complexidade desnecessária.
> Toda implementação deve parecer profissional, mas compreensível.