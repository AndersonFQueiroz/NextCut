// StrictMode não muda visual em produção; em desenvolvimento avisa sobre práticas perigosas do React.
import { StrictMode } from 'react'
// createRoot é a API moderna que substituiu ReactDOM.render: anexa o app React a um elemento do HTML.
import { createRoot } from 'react-dom/client'
// BrowserRouter usa a URL do navegador (path /login, /admin). Alternativa seria HashRouter (#/login).
import { BrowserRouter } from 'react-router-dom'
// Importa estilos globais (cores, cartão, botões). Ordem importa: carrega antes dos componentes desenharem.
import './index.css'
// Importa o componente raiz que define as rotas (arquivo App.tsx).
import App from './App.tsx'

// document = página HTML; getElementById('root') pega a <div id="root"> do index.html.
// O ponto de exclamação (!) diz ao TypeScript “confie que não é null”; se remover #root do HTML, quebra em runtime.
createRoot(document.getElementById('root')!).render(
  // StrictMode envolve a árvore para checagens extras só em modo desenvolvimento.
  <StrictMode>
    {/*
      BrowserRouter fornece contexto de rota para useNavigate, Link, Routes etc. em qualquer filho.
      Se App não usar rotas, poderia remover BrowserRouter — mas aqui precisamos dele.
    */}
    <BrowserRouter>
      {/* App contém <Routes> com /login e /admin */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
