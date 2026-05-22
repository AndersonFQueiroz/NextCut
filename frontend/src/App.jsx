// Route define cada caminho da aplicação; Routes escolhe qual Route renderizar.
import { Route, Routes } from 'react-router-dom'
// ClientEntryPage é a página pública de entrada do cliente na fila.
import ClientEntryPage from './pages/ClientEntryPage'
// LoginPage é a página onde o barbeiro informa usuário e senha.
import LoginPage from './pages/LoginPage'
// QueueStatusPage é a página pública para consultar o status da fila.
import QueueStatusPage from './pages/QueueStatusPage'
// AdminDashboardPage é o painel real do barbeiro com fila e controles da tarefa #14.
import AdminDashboardPage from './pages/AdminDashboardPage'
// PrivateRoute verifica se existe nextcut_token antes de liberar a rota /admin.
import PrivateRoute from './routes/PrivateRoute'

// App concentra as rotas principais do frontend NextCut.
export default function App() {
  // O return entrega ao React Router a tabela de rotas da aplicação.
  return (
    // Routes envolve todas as rotas e renderiza apenas a que combinar com a URL atual.
    <Routes>
      {/* Rota raiz pública: mostra a entrada do cliente. */}
      <Route path="/" element={<ClientEntryPage />} />
      {/* Rota /entrada pública: alternativa explícita para a entrada do cliente. */}
      <Route path="/entrada" element={<ClientEntryPage />} />
      {/* Rota /fila pública: mostra o status da fila para clientes. */}
      <Route path="/fila" element={<QueueStatusPage />} />
      {/* Rota /login pública: mostra o formulário de autenticação do barbeiro. */}
      <Route path="/login" element={<LoginPage />} />
      {/* Rota pai protegida: PrivateRoute decide se renderiza a filha ou redireciona para /login. */}
      <Route element={<PrivateRoute />}>
        {/* Rota /admin protegida: substitui o placeholder pelo dashboard real do barbeiro. */}
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  )
}
