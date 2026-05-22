// Link é como <a href> mas sem recarregar a página inteira: o React Router intercepta a navegação.
import { Link } from 'react-router-dom'
// Mesmo Card da tela de login para manter o mesmo “bloco” visual.
import { Card } from '../components/ui/Card'

/**
 * AdminDashboard — página simples só para provar que /admin abriu depois do “login” de protótipo.
 * Você pode substituir todo o conteúdo por gráficos, tabelas, menu lateral etc. quando for a hora.
 */
export function AdminDashboard() {
  return (
    // Mesma classe page-shell da LoginPage: mesma largura máxima centralizada.
    <main className="page-shell">
      {/*
        admin-shell só ajusta gap no CSS; é opcional — poderia remover className se não precisar do ajuste fino.
      */}
      <Card className="admin-shell">
        {/* Mesmo padrão visual de cabeçalho da LoginPage (marca + título) */}
        <div className="login-brand">
          <div className="brand-mark" aria-hidden>
            N
          </div>
          <div>
            <p className="eyebrow">Painel administrador</p>
            <h1>Rotas configuradas</h1>
          </div>
        </div>

        {/* Texto explicativo; <code> deixa a rota em fonte monoespaçada */}
        <p className="login-description">
          A rota <code>/admin</code> já está funcionando. Em seguida podemos montar a tela de gerenciamento de fila e o layout final.
        </p>

        {/*
          to="/login" = destino da navegação.
          className="button-secondary" reaproveita o estilo de botão secundário definido no CSS (parece botão mas é link).
        */}
        <Link to="/login" className="button-secondary">
          Voltar ao login
        </Link>
      </Card>
    </main>
  )
}
