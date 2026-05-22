// useCallback memoriza funções usadas pelo polling; useEffect roda efeitos como buscar dados; useState guarda estados da tela.
import { useCallback, useEffect, useState } from 'react'
// LogOut, Phone e Scissors são ícones da lucide-react usados nos botões e informações do painel.
import { LogOut, Phone, Scissors } from 'lucide-react'
// useNavigate permite sair do painel e voltar para /login pelo React Router.
import { useNavigate } from 'react-router-dom'

// API_BASE centraliza o endereço do backend para facilitar manutenção.
const API_BASE = 'http://localhost:8080'

// getToken lê o token salvo no login para enviar no header Authorization.
function getToken() {
  // localStorage.getItem busca um texto salvo no navegador pela chave informada.
  return localStorage.getItem('nextcut_token')
}

// normalizeQueue garante que a página funcione mesmo se o backend devolver nomes diferentes para a lista.
function normalizeQueue(data) {
  // payload remove o envelope ApiResponse quando o backend devolve { success, data }.
  const payload = data?.data ?? data

  // Array.isArray verifica se o retorno inteiro já é uma lista de clientes.
  if (Array.isArray(payload)) {
    // Retorna a própria lista quando o backend responde diretamente com um array.
    return payload
  }

  // Array.isArray(data?.fila) aceita a chave em português, caso o backend use esse nome.
  if (Array.isArray(payload?.fila)) {
    // Retorna data.fila quando a API mandar { fila: [...] }.
    return payload.fila
  }

  // Array.isArray(data?.queue) aceita a chave em inglês, comum em APIs REST.
  if (Array.isArray(payload?.queue)) {
    // Retorna data.queue quando a API mandar { queue: [...] }.
    return payload.queue
  }

  // Array.isArray(payload?.entries) aceita o QueueSnapshot atual do backend Java.
  if (Array.isArray(payload?.entries)) {
    // Retorna payload.entries quando a API mandar { entries: [...] }.
    return payload.entries
  }

  // Retorna array vazio para evitar erro de renderização se o formato vier inesperado.
  return []
}

// normalizeIsOpen interpreta o estado de atendimento aberto em nomes possíveis vindos da API.
function normalizeIsOpen(data) {
  // payload remove o envelope ApiResponse quando o backend devolve { success, data }.
  const payload = data?.data ?? data

  // Boolean transforma valores truthy/falsy em true ou false de forma explícita.
  return Boolean(payload?.is_open ?? payload?.isOpen ?? payload?.open ?? false)
}

// getClientId escolhe o identificador do cliente para montar /admin/remove/{id}.
function getClientId(cliente) {
  // O operador ?? usa o primeiro valor que não seja null nem undefined.
  return cliente.id ?? cliente.queue_id ?? cliente.queueId ?? cliente.phone ?? cliente.telefone
}

// getClientTicket escolhe o número da senha exibido em destaque no card.
function getClientTicket(cliente, index) {
  // Usa senha/ticket/password se existir; caso contrário, usa a posição visual da lista.
  return cliente.senha ?? cliente.ticket ?? cliente.ticketNumber ?? cliente.password ?? index + 1
}

// getClientName escolhe o nome do cliente usando chaves possíveis do backend.
function getClientName(cliente) {
  // Retorna um texto padrão quando nome/name não vier preenchido.
  return cliente.nome ?? cliente.name ?? cliente.clientName ?? 'Cliente sem nome'
}

// getClientPhone escolhe o telefone do cliente usando chaves possíveis do backend.
function getClientPhone(cliente) {
  // Retorna um texto padrão quando telefone/phone não vier preenchido.
  return cliente.telefone ?? cliente.phone ?? cliente.clientPhone ?? 'Telefone não informado'
}

// AdminDashboardPage renderiza o painel do barbeiro pedido na tarefa #14.
export default function AdminDashboardPage() {
  // navigate muda de rota sem recarregar a página, usado no botão Sair.
  const navigate = useNavigate()
  // fila guarda a lista de clientes retornada pela API; começa como array vazio.
  const [fila, setFila] = useState([])
  // isOpen informa se o atendimento está aberto; começa false até a API confirmar.
  const [isOpen, setIsOpen] = useState(false)
  // carregando controla o texto "Carregando fila..." no lugar da lista.
  const [carregando, setCarregando] = useState(false)
  // erro guarda uma mensagem para mostrar quando alguma chamada da API falha.
  const [erro, setErro] = useState('')

  // carregarFila busca a fila atual e é reutilizada pelo polling e pelos botões.
  const carregarFila = useCallback(async (mostrarCarregando = false) => {
    // Lê o token salvo no login para autorizar a chamada protegida.
    const token = getToken()
    // Se mostrarCarregando for true, a tela mostra o estado de loading centralizado.
    if (mostrarCarregando) {
      // Atualiza o estado de carregamento antes de iniciar o fetch.
      setCarregando(true)
    }

    // try/catch evita que uma falha de rede quebre a tela.
    try {
      // fetch chama primeiro o endpoint GET /admin/queue exigido pela tarefa #14.
      let resposta = await fetch(`${API_BASE}/admin/queue`, {
        // headers envia o token no padrão Bearer exigido por APIs autenticadas.
        headers: { Authorization: `Bearer ${token}` },
      })

      // Se /admin/queue ainda não existir no backend atual, usamos /queue para permitir teste local da lista.
      if (resposta.status === 404) {
        // fetch em /queue usa o endpoint público já existente no QueueController atual.
        resposta = await fetch(`${API_BASE}/queue`, {
          // Mantém Authorization mesmo no fallback para continuar compatível se o backend proteger essa rota depois.
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      // Se o status não for 200-299, a página trata como erro.
      if (!resposta.ok) {
        // throw manda o fluxo para o catch com uma mensagem simples.
        throw new Error('Erro ao carregar fila.')
      }

      // resposta.json converte o JSON da API para objeto JavaScript.
      const data = await resposta.json()
      // Atualiza o estado fila com a lista normalizada.
      setFila(normalizeQueue(data))
      // Atualiza o estado isOpen com o valor normalizado.
      setIsOpen(normalizeIsOpen(data))
      // Limpa erro anterior quando a chamada dá certo.
      setErro('')
    } catch {
      // Mostra uma mensagem amigável em vez de detalhes técnicos.
      setErro('Não foi possível atualizar a fila.')
    } finally {
      // Finaliza o estado de carregamento mesmo quando a chamada falha.
      setCarregando(false)
    }
  }, [])

  // useEffect executa código após a tela renderizar, ideal para buscar dados iniciais.
  useEffect(() => {
    // Carrega a fila imediatamente quando o painel abre.
    carregarFila(true)
    // setInterval repete a função a cada 5000ms, ou seja, a cada 5 segundos.
    const intervalo = setInterval(() => carregarFila(false), 5000)
    // cleanup é a limpeza do efeito; evita intervalos duplicados quando a tela sai do ar.
    return () => clearInterval(intervalo)
  }, [carregarFila])

  // sair remove o token e manda o usuário para a tela de login.
  function sair() {
    // localStorage.removeItem apaga o token salvo no navegador.
    localStorage.removeItem('nextcut_token')
    // navigate('/login') troca para a rota pública de login.
    navigate('/login')
  }

  // chamarProximo aciona o endpoint que chama o próximo cliente da fila.
  async function chamarProximo() {
    // Lê o token atual do localStorage para enviar autorização.
    const token = getToken()
    // Limpa erro antigo antes da ação.
    setErro('')

    // try/catch trata falhas de backend ou rede.
    try {
      // fetch POST envia a ação /admin/next para o backend.
      const resposta = await fetch(`${API_BASE}/admin/next`, {
        // method POST indica uma ação que altera o estado da fila.
        method: 'POST',
        // Authorization Bearer envia o token do login no cabeçalho.
        headers: { Authorization: `Bearer ${token}` },
      })

      // Se o backend devolver erro, interrompe a função.
      if (!resposta.ok) {
        // throw leva a mensagem para o catch.
        throw new Error('Erro ao chamar próximo.')
      }

      // Atualiza a lista depois da ação para refletir o novo estado.
      await carregarFila(false)
    } catch {
      // Mostra erro simples quando a ação falha.
      setErro('Não foi possível chamar o próximo cliente.')
    }
  }

  // alternarAtendimento abre ou fecha o atendimento no backend.
  async function alternarAtendimento() {
    // Lê o token salvo no login.
    const token = getToken()
    // Limpa erro antigo antes de tentar alternar.
    setErro('')

    // try/catch mantém a tela funcional mesmo com falha na API.
    try {
      // fetch POST chama /admin/toggle para alternar is_open no backend.
      const resposta = await fetch(`${API_BASE}/admin/toggle`, {
        // method POST indica que estamos alterando o estado do atendimento.
        method: 'POST',
        // Authorization Bearer envia o token para a rota protegida.
        headers: { Authorization: `Bearer ${token}` },
      })

      // Se a resposta falhar, manda o fluxo para o catch.
      if (!resposta.ok) {
        // throw padroniza o tratamento de erro.
        throw new Error('Erro ao alternar atendimento.')
      }

      // Atualiza a fila e o isOpen depois da alteração.
      await carregarFila(false)
    } catch {
      // Exibe mensagem amigável quando a ação não completa.
      setErro('Não foi possível alterar o atendimento.')
    }
  }

  // removerCliente remove um cliente específico da fila usando o id dele.
  async function removerCliente(id) {
    // Lê o token salvo no navegador para autorizar a remoção.
    const token = getToken()
    // Limpa erro antigo antes da nova tentativa.
    setErro('')

    // try/catch trata falhas sem quebrar a interface.
    try {
      // fetch POST chama o endpoint dinâmico com o id do cliente.
      const resposta = await fetch(`${API_BASE}/admin/remove/${id}`, {
        // method POST segue o contrato informado na issue #14.
        method: 'POST',
        // Authorization Bearer envia o token da sessão.
        headers: { Authorization: `Bearer ${token}` },
      })

      // Se o backend não aceitar a remoção, cai no catch.
      if (!resposta.ok) {
        // throw interrompe o fluxo de sucesso.
        throw new Error('Erro ao remover cliente.')
      }

      // Recarrega a fila depois de remover para atualizar os cards.
      await carregarFila(false)
    } catch {
      // Mostra mensagem de erro discreta para o barbeiro.
      setErro('Não foi possível remover o cliente.')
    }
  }

  // O return abaixo desenha toda a página do painel.
  return (
    // main é o contêiner principal com fundo escuro radial e texto claro.
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white" style={{ background: 'var(--gradient-dark)' }}>
      {/* Barra decorativa esquerda: absolute fixa no fundo, w-1 define largura pequena, h-full cobre a altura, e o background usa vinho. */}
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />
      {/* Barra decorativa direita: replica a lateral vinho para manter identidade visual. */}
      <div className="absolute right-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />
      {/* Camada z-10 mantém o conteúdo acima das barras e do fundo. */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8">
        {/* Header do topo com marca, subtítulo e botão de saída. */}
        <header className="flex flex-col gap-4 border-b border-[oklch(0.42_0.14_17_/_0.3)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Bloco da marca e nome da tela. */}
          <div>
            {/* Título NextCut usa a fonte display Cinzel definida em --font-display. */}
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>NextCut</h1>
            {/* Texto auxiliar usa o brilho vinho para destacar o painel do barbeiro. */}
            <p className="mt-1 text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--wine-glow)' }}>Painel do Barbeiro</p>
          </div>
          {/* Botão Sair remove o token e volta para /login. */}
          <button type="button" onClick={sair} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] bg-transparent px-5 text-sm font-semibold uppercase tracking-widest text-white transition hover:border-[var(--wine-glow)]">
            {/* Ícone LogOut segue o padrão de vinho brilhante com tamanho h-4 w-4. */}
            <LogOut className="h-4 w-4 text-[var(--wine-glow)]" />
            {/* Texto do botão de logout. */}
            Sair
          </button>
        </header>

        {/* Área de controles principais do barbeiro. */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* Botão grande que abre ou fecha o atendimento. */}
          <button type="button" onClick={alternarAtendimento} className="h-12 rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] px-5 text-sm font-semibold uppercase tracking-widest text-white shadow-[var(--shadow-wine)] transition" style={{ background: isOpen ? 'var(--gradient-wine)' : 'oklch(0.3 0.02 20)' }}>
            {/* Bolinha indica o estado e o texto muda conforme isOpen. */}
            {isOpen ? '● FECHAR ATENDIMENTO' : '● ABRIR ATENDIMENTO'}
          </button>
          {/* Botão que chama o próximo cliente da fila. */}
          <button type="button" onClick={chamarProximo} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold uppercase tracking-widest text-white shadow-[var(--shadow-wine)] transition" style={{ background: 'var(--gradient-wine)' }}>
            {/* Ícone Scissors identifica a ação do barbeiro e segue o padrão h-4 w-4. */}
            <Scissors className="h-4 w-4 text-[var(--wine-glow)]" />
            {/* Texto do botão principal da fila. */}
            CHAMAR PRÓXIMO
          </button>
        </section>

        {/* Mensagem de erro aparece somente quando erro não está vazio. */}
        {erro !== '' && <p className="text-sm font-medium text-red-400">{erro}</p>}

        {/* Conteúdo principal da fila. */}
        <section className="space-y-4">
          {/* Título da lista usando fonte de exibição e cor clara. */}
          <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Fila atual</h2>
          {/* Estado de carregamento substitui os cards enquanto a primeira busca roda. */}
          {carregando ? (
            // Texto centralizado com brilho vinho para mostrar que a fila está sendo carregada.
            <p className="py-12 text-center text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--wine-glow)' }}>Carregando fila...</p>
          ) : fila.length === 0 ? (
            // Card vazio aparece quando não há clientes na fila.
            <div className="rounded-2xl border border-[oklch(0.42_0.14_17_/_0.3)] p-8 text-center backdrop-blur-sm" style={{ background: 'oklch(0.16 0.01 20 / 0.7)' }}>
              {/* Texto auxiliar usa a cor oklch definida para textos secundários. */}
              <p style={{ color: 'oklch(0.65 0.01 20)' }}>Nenhum cliente na fila no momento</p>
            </div>
          ) : (
            // Lista de cards renderizada quando existem clientes na fila.
            <div className="grid gap-4">
              {/* map percorre cada cliente e transforma os dados em um card visual. */}
              {fila.map((cliente, index) => {
                // id é usado como key do React e também no endpoint de remover.
                const id = getClientId(cliente)
                // senha é o número destacado no card.
                const senha = getClientTicket(cliente, index)
                // nome é exibido como informação principal do cliente.
                const nome = getClientName(cliente)
                // telefone é exibido como informação auxiliar do cliente.
                const telefone = getClientPhone(cliente)

                // Retorna um card para o cliente atual.
                return (
                  // Card com rounded-2xl, borda vinho translúcida, fundo escuro translúcido e blur.
                  <article key={`${id}-${index}`} className="rounded-2xl border border-[oklch(0.42_0.14_17_/_0.3)] p-5 backdrop-blur-sm" style={{ background: 'oklch(0.16 0.01 20 / 0.7)' }}>
                    {/* Linha interna organiza senha, dados e ação remover. */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      {/* Bloco esquerdo com senha e dados do cliente. */}
                      <div className="flex items-center gap-4">
                        {/* Número da senha em destaque com fonte Cinzel e vinho brilhante. */}
                        <span className="text-4xl font-bold" style={{ color: 'var(--wine-glow)', fontFamily: 'var(--font-display)' }}>{senha}</span>
                        {/* Bloco textual com nome, telefone e posição. */}
                        <div>
                          {/* Nome do cliente em branco para leitura principal. */}
                          <h3 className="text-lg font-semibold text-white">{nome}</h3>
                          {/* Telefone com ícone e cor auxiliar oklch. */}
                          <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: 'oklch(0.65 0.01 20)' }}>
                            {/* Ícone Phone segue a regra de vinho e tamanho h-4 w-4. */}
                            <Phone className="h-4 w-4 text-[var(--wine-glow)]" />
                            {/* Texto do telefone vindo da API. */}
                            {telefone}
                          </p>
                          {/* Tag de posição mostra a ordem do cliente na fila. */}
                          <span className="mt-2 inline-flex rounded-full border border-[oklch(0.42_0.14_17_/_0.3)] px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.65 0.01 20)' }}>Posição {index + 1}</span>
                        </div>
                      </div>
                      {/* Botão vermelho discreto para remover o cliente atual. */}
                      <button type="button" onClick={() => removerCliente(id)} className="h-10 rounded-lg border border-red-400/40 bg-transparent px-4 text-xs font-semibold uppercase tracking-widest text-red-400 transition hover:border-red-400 hover:text-white">
                        {/* Texto da ação de remoção. */}
                        Remover
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
