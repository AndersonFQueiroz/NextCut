// Routes envolve várias Route; Route liga um path da URL a um componente React.
// Navigate redireciona automaticamente para outra rota (útil para / e rotas desconhecidas).
import { Routes, Route, Navigate } from 'react-router-dom'
// Importa a página de login que você edita em src/pages/LoginPage.tsx.
import { LoginPage } from './pages/LoginPage'
// Importa a página “destino” após o submit do login (protótipo sem auth real).
import { AdminDashboard } from './pages/AdminDashboard'

/**
 * App — “mapa” de todas as rotas do front.
 * Fluxo hoje: usuário cai em /login → preenche → vai para /admin.
 * Para adicionar rota nova: copie uma linha <Route path="..." element={...} /> dentro de <Routes>.
 */
function App() {
  // Retorna a árvore de rotas; o React Router compara a URL do navegador com cada path.
  return (
    <Routes>
      {/*
        Routes precisa envolver todas as Route no react-router-dom v6+.
        path="/login" = quando a URL termina com /login, mostramos <LoginPage />.
        element recebe JSX; pode ser element={<LoginPage />} como está.
      */}
      <Route path="/login" element={<LoginPage />} />
      {/*
        path="/admin" = painel administrativo placeholder.
        Se mudar o path aqui, mude também navigate('/...') na LoginPage para bater.
      */}
      <Route path="/admin" element={<AdminDashboard />} />
      {/*
        path="/" é a raiz do site. Navigate to="/login" manda o usuário para o login.
        replace substitui a entrada no histórico (botão voltar não fica preso entre / e /login).
      */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/*
        path="*" casa com qualquer URL que não tenha sido listada acima (404 “suave”).
        Aqui redirecionamos tudo desconhecido para /login em vez de mostrar página vazia.
      */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// export default permite importar este arquivo em main.tsx como import App from './App.tsx'.
export default App
