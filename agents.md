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

> 📄 Para entender o estado atual de implementação, consulte `README.md`, `requirements.md` e `specs.md` antes de iniciar qualquer tarefa.

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
- `WAITING`
- `IN_SERVICE`
- `DONE`
- `LEFT`

---

# 6. ESTADO DA FILA (HÍBRIDO)

## Obrigatório:
### Memória:
- ArrayDeque para performance

### Persistência:
- PostgreSQL como fonte permanente

## Regra:
- Toda alteração em memória deve sincronizar com banco
- Banco deve permitir reconstrução da fila
- Em reinicialização, fila deve ser restaurada do banco (status `WAITING` e `IN_SERVICE`)

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

## Contrato de Mensagens WebSocket

Todo broadcast deve seguir este formato JSON:

```json
{
  "event": "QUEUE_UPDATED",
  "payload": {
    "queue": [
      {
        "id": "uuid",
        "ticketNumber": 1,
        "clientName": "João",
        "position": 1,
        "status": "WAITING",
        "estimatedWaitMinutes": 10
      }
    ],
    "isOpen": true,
    "avgServiceMinutes": 10
  }
}
```

### Eventos válidos:
| Evento            | Quando disparar                          |
|-------------------|------------------------------------------|
| `QUEUE_UPDATED`   | Qualquer mudança na fila                 |
| `SHOP_STATUS`     | Barbearia abre ou fecha                  |
| `CLIENT_CALLED`   | Próximo cliente chamado (com ticketNumber) |
| `CLIENT_REMOVED`  | Cliente removido manualmente             |

### Regra:
- Frontend deve reconectar automaticamente em caso de queda
- Backend deve suportar múltiplos clientes conectados simultaneamente
- Nunca enviar dados sensíveis (senha hash, dados internos) via WebSocket

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

# 12. PADRÃO DE RESPOSTAS HTTP

Toda resposta da API deve seguir este padrão de corpo JSON:

### Sucesso:
```json
{
  "success": true,
  "data": { }
}
```

### Erro:
```json
{
  "success": false,
  "error": "Mensagem de erro legível"
}
```

### Mapeamento de status codes:
| Situação                        | HTTP Status |
|---------------------------------|-------------|
| Sucesso geral                   | 200         |
| Recurso criado                  | 201         |
| Requisição inválida             | 400         |
| Não autenticado                 | 401         |
| Sem permissão                   | 403         |
| Recurso não encontrado          | 404         |
| Conflito (ex: telefone duplicado)| 409        |
| Erro interno do servidor        | 500         |

### Regra:
- Nunca retornar stack trace em produção
- Nunca retornar status 200 em erros
- Sempre retornar `Content-Type: application/json`

---

# 13. VARIÁVEIS DE AMBIENTE

## Backend (`backend/.env` ou variáveis de ambiente):
```env
DB_URL=jdbc:postgresql://<host>:<port>/<database>
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=chave_secreta_longa_e_aleatoria
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=bcrypt_hash_da_senha
PORT=8080
```

## Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws/queue
```

## Regras:
- Nunca commitar arquivos `.env`
- `.env.example` deve existir com as chaves (sem valores reais)
- Agentes não devem hardcodar credenciais no código
- Em produção, usar variáveis do Railway/Render/Vercel

---

# 14. TESTES (OBRIGATÓRIO)

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

# 15. FLUXO DE DESENVOLVIMENTO

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

# 16. LIMITES (NÃO IMPLEMENTAR AGORA)

## Proibido:
- Multi-barbearia
- Pagamento
- App mobile nativo
- Sistema complexo de usuários
- Gamificação
- Features fora do escopo MVP

---

# 17. CHECKLIST ANTES DE QUALQUER MUDANÇA

## Perguntar:
- Isso quebra FIFO?
- Isso mantém sincronização híbrida?
- Isso segue Clean Architecture?
- Isso é seguro?
- Isso mantém simplicidade?
- Existe teste?
- É apresentável?

---

# 18. PADRÃO DE RESPOSTA PARA AGENTES

Ao criar qualquer funcionalidade:

## Sempre:
1. Explicar objetivo
2. Definir arquivos afetados
3. Seguir arquitetura
4. Implementar
5. Testar
6. Documentar

## Formato de resposta esperado:

```
### Objetivo
[O que será implementado e por quê]

### Arquivos afetados
- backend/src/.../NomeClasse.java — [motivo]
- frontend/src/.../NomeComponente.jsx — [motivo]

### Implementação
[Código]

### Testes
[Como testar / testes unitários]

### Commit sugerido
feat(escopo): descrição curta em português
```

---

# 19. ANTI-PATTERNS (NUNCA FAZER)

Esta seção documenta erros comuns que agentes de IA cometem neste projeto. São proibições absolutas:

## Arquitetura:
- ❌ SQL direto em controller ou service
- ❌ Regra de negócio em DAO
- ❌ Lógica de fila fora de `QueueService`
- ❌ Estado da fila só em memória sem persistir no banco
- ❌ Estado da fila só no banco sem ArrayDeque em memória

## Segurança:
- ❌ Senha em texto puro em qualquer lugar
- ❌ Stack trace exposto em resposta de erro
- ❌ Credenciais hardcodadas no código
- ❌ Endpoint admin sem autenticação

## WebSocket:
- ❌ Broadcast sem persistir primeiro
- ❌ Enviar dados sensíveis via WebSocket
- ❌ Ignorar reconexão automática no frontend

## Git:
- ❌ Commitar `.env` ou arquivos com credenciais reais
- ❌ Commitar `node_modules`, `target/`, `build/`, `.class`
- ❌ Mensagens de commit genéricas ("update", "fix", "wip")
- ❌ Adicionar co-autoria de IA no commit

## Testes:
- ❌ Feature crítica sem teste
- ❌ Testar implementação ao invés de comportamento

---

# 20. GIT E CONTROLE DE VERSÃO (OBRIGATÓRIO)

> Esta seção é crítica. Agentes de IA **NUNCA** devem sobrescrever a identidade do autor nem gerar mensagens de commit genéricas ou aleatórias.

## 20.1 Identidade do Autor (NUNCA ALTERAR)

**PROIBIDO:**
- Usar identidade própria do agente como autor ou co-autor do commit
- Adicionar `Co-authored-by` com nome/email de ferramenta de IA (ex: Cursor, GitHub Copilot, etc.)
- Alterar `user.name` ou `user.email` do git local
- Criar commits com autor diferente do dono do repositório

**OBRIGATÓRIO:**
- Sempre usar a identidade Git já configurada no ambiente local (`git config user.name` / `git config user.email`)
- Se a identidade local não estiver configurada, **perguntar ao desenvolvedor** antes de fazer qualquer commit
- O autor do commit deve ser sempre e somente o desenvolvedor humano do projeto

**Como verificar antes de commitar:**
```bash
git config user.name   # deve retornar o nome do desenvolvedor
git config user.email  # deve retornar o email do desenvolvedor
```

## 20.2 Mensagens de Commit (Conventional Commits)

Todo commit deve seguir o padrão **Conventional Commits**:

```
<tipo>(<escopo>): <descrição curta em português>

[corpo opcional explicando o porquê, não o quê]
```

### Tipos válidos:
| Tipo       | Quando usar                                      |
|------------|--------------------------------------------------|
| `feat`     | Nova funcionalidade                              |
| `fix`      | Correção de bug                                  |
| `refactor` | Refatoração sem mudança de comportamento         |
| `test`     | Adição ou correção de testes                     |
| `docs`     | Atualização de documentação                      |
| `style`    | Formatação, espaços, ponto e vírgula (sem lógica)|
| `chore`    | Tarefas de build, configs, dependências          |
| `perf`     | Melhoria de performance                          |

### Exemplos corretos:
```
feat(queue): adiciona endpoint para entrar na fila
fix(auth): corrige validação de senha com caracteres especiais
refactor(dao): extrai lógica de query para método privado
test(service): adiciona testes unitários para QueueService
docs(readme): atualiza instruções de setup do backend
chore(env): adiciona .env.example com variáveis necessárias
```

### Exemplos PROIBIDOS:
```
✗ "update"
✗ "fix stuff"
✗ "wip"
✗ "asdfgh"
✗ "Cursor AI commit"
✗ "changes"
✗ "done"
```

## 20.3 Escopo dos Commits

- Cada commit deve representar **uma única mudança coesa**
- Não misturar feat + fix + refactor no mesmo commit
- Prefira commits pequenos e frequentes a commits grandes e genéricos
- Nunca commitar arquivos desnecessários (`.env`, `node_modules`, arquivos de build)

## 20.4 Regras para Agentes ao Fazer Commits

Antes de qualquer `git commit`, o agente **deve**:

1. Verificar `git config user.name` e `git config user.email`
2. Confirmar que não está adicionando co-autoria de IA
3. Gerar uma mensagem de commit seguindo Conventional Commits
4. Mostrar a mensagem proposta ao desenvolvedor para aprovação, **antes de executar**
5. Nunca usar `--no-verify` para burlar hooks

**Fluxo obrigatório para o agente:**
```
→ Analisa as mudanças feitas
→ Propõe mensagem de commit clara e descritiva
→ Aguarda confirmação do desenvolvedor
→ Executa o commit com a identidade local já configurada
```

---

# 21. ROADMAP FUTURO (APÓS MVP)
- Notificações WhatsApp
- Múltiplos barbeiros
- Histórico avançado
- Analytics
- Painel TV

---

# 22. FILOSOFIA FINAL

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
