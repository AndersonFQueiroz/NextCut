// Importa Navigate e Outlet do React Router para controlar acesso e renderizar rotas filhas.
import { Navigate, Outlet } from 'react-router-dom'

// PrivateRoute é um componente de proteção usado como pai da rota /admin.
export default function PrivateRoute() {
  // localStorage é uma área do navegador que guarda textos mesmo depois de atualizar a página.
  const token = localStorage.getItem('nextcut_token')

  // Se existir token, o barbeiro já fez login e pode ver o conteúdo protegido.
  if (token) {
    // Outlet é o espaço onde o React Router desenha a rota filha, neste caso AdminDashboardPage.
    return <Outlet />
  }

  // Navigate redireciona para outra rota sem recarregar a aplicação inteira.
  return <Navigate to="/login" replace />
}
