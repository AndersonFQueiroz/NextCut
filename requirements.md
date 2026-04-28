# 📄 ESPECIFICAÇÃO FUNCIONAL

## Sistema: Fila Virtual para Barbearia (NextCut)

---

## 1. 📌 Visão Geral

O sistema **Fila Virtual para Barbearia** tem como objetivo substituir o controle manual de filas (caderno físico), permitindo que clientes entrem em uma fila virtual por meio de um link e acompanhem sua posição em tempo real.

A aplicação será web, responsiva, com:

* **Frontend:** Web (HTML/CSS/JS)
* **Backend:** Java (sem framework obrigatório)
* **Banco de Dados:** Supabase
* **Atualização em tempo real:** Supabase Realtime (ou WebSocket)

---

## 2. 👥 Atores do Sistema

### Cliente

* Acessa o sistema via link
* Insere nome e telefone
* Entra na fila virtual
* Acompanha sua posição em tempo real

### Barbeiro (Administrador)

* Realiza login no sistema
* Visualiza e gerencia a fila
* Chama próximos clientes
* Remove clientes da fila

---

## 3. ⚙️ Requisitos Funcionais

### 🔐 Autenticação

* **RF01:** O sistema deve permitir login do barbeiro
* **RF02:** O sistema deve validar credenciais do barbeiro

---

### 👤 Entrada do Cliente na Fila

* **RF03:** O sistema deve permitir que o cliente informe nome e telefone
* **RF04:** O sistema deve gerar automaticamente uma senha sequencial
* **RF05:** O sistema deve inserir o cliente em uma fila única
* **RF06:** O sistema deve exibir a posição do cliente na fila
* **RF07:** O sistema deve impedir entradas duplicadas com o mesmo telefone (opcional, mas recomendado)

---

### 📋 Gerenciamento da Fila

* **RF08:** O barbeiro deve visualizar a fila completa
* **RF09:** O barbeiro deve chamar o próximo cliente da fila
* **RF10:** O sistema deve remover automaticamente o cliente atendido
* **RF11:** O barbeiro deve poder remover clientes manualmente

---

### 🔄 Atualização em Tempo Real

* **RF12:** O sistema deve atualizar automaticamente a posição dos clientes
* **RF13:** O sistema deve refletir mudanças imediatamente para todos os usuários
* **RF14:** O sistema deve utilizar tecnologia de atualização em tempo real (WebSocket ou Supabase Realtime)

---

### 📱 Interface

* **RF15:** O sistema deve possuir interface responsiva
* **RF16:** O sistema deve possuir as seguintes telas:

  * Tela de entrada do cliente
  * Tela de acompanhamento da fila
  * Tela administrativa (barbeiro)

---

### ⏱️ Funcionalidades Extras (Avançado)

* **RF17:** O sistema deve destacar visualmente os 3 próximos clientes
* **RF18:** O sistema deve exibir uma estimativa de tempo de espera (baseada em média de atendimento)
* **RF19 (Opcional):** O sistema pode manter um histórico simples de atendimentos

---

## 4. 📏 Regras de Negócio

* **RN01:** A fila é única e compartilhada
* **RN02:** A senha deve ser sequencial (ex: 001, 002, 003…)
* **RN03:** Um cliente só entra na fila após informar nome e telefone
* **RN04:** A ordem de atendimento segue FIFO (First In, First Out)
* **RN05:** Apenas o barbeiro pode manipular a fila
* **RN06:** Clientes não podem alterar sua posição
* **RN07:** A atualização da fila deve ocorrer em tempo real
* **RN08:** Um cliente não pode estar duas vezes na fila simultaneamente (regra recomendada)

---

## 5. 🚫 Requisitos Não Funcionais

* **RNF01:** O sistema deve ser acessível via navegador
* **RNF02:** O sistema deve ser responsivo (mobile e desktop)
* **RNF03:** O sistema deve ter atualização em tempo real
* **RNF04:** O tempo de resposta deve ser inferior a 2 segundos
* **RNF05:** Os dados devem ser armazenados no Supabase
* **RNF06:** O sistema deve garantir consistência da fila
* **RNF07:** O sistema deve ser simples e intuitivo

---

## 6. 🧩 Casos de Uso

### UC01 – Entrar na fila

1. Cliente acessa o sistema
2. Informa nome e telefone
3. Sistema gera senha
4. Cliente entra na fila
5. Sistema exibe posição atual

---

### UC02 – Acompanhar fila

1. Cliente acessa tela de acompanhamento
2. Sistema exibe posição atual
3. Sistema atualiza automaticamente

---

### UC03 – Login do barbeiro

1. Barbeiro acessa área administrativa
2. Insere login e senha
3. Sistema valida acesso

---

### UC04 – Chamar próximo cliente

1. Barbeiro visualiza fila
2. Clica em “Próximo”
3. Sistema remove o primeiro da fila
4. Sistema atualiza todos os clientes

---

### UC05 – Remover cliente

1. Barbeiro seleciona cliente
2. Clica em “Remover”
3. Sistema exclui cliente da fila
4. Sistema atualiza fila

---

## 7. 🗂️ Estrutura de Telas

### Tela 1: Entrada

* Campo: Nome
* Campo: Telefone
* Botão: Entrar na fila

---

### Tela 2: Fila

* Número da senha
* Posição atual
* Estimativa de tempo
* Lista simplificada da fila

---

### Tela 3: Admin (Barbeiro)

* Lista da fila
* Botão “Chamar próximo”
* Botão “Remover”

---

## 8. 🧱 Modelo de Dados (Sugestão)

### Tabela: queue

* id (UUID)
* name (string)
* phone (string)
* ticket_number (integer)
* position (integer)
* created_at (timestamp)

### Tabela: admin

* id
* username
* password (hash)

---

## 9. 🏗️ Arquitetura Sugerida

* Frontend → consome API REST (Java)
* Backend → gerencia fila (Queue/Deque)
* Supabase → armazenamento + realtime
* Realtime → atualização automática da UI

---

## 10. 🚀 Escopo Avançado

* Atualização automática sem refresh
* Destaque visual dos próximos clientes
* Estimativa de tempo de espera
* Interface moderna (cards, cores)

---

## 11. ⚠️ Limites do Projeto

Evitar:

* Cadastro completo de usuários
* Múltiplas barbearias
* Sistema de pagamento
* Aplicativo mobile nativo

---

## 12. 📌 Descrição Final

Sistema web que substitui o controle manual de fila em barbearias, permitindo que clientes entrem em uma fila virtual, recebam uma senha e acompanhem sua posição em tempo real, enquanto o barbeiro gerencia os atendimentos de forma simples e eficiente.
