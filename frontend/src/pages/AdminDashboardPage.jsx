// useCallback memoriza funções usadas pelo polling; useEffect roda efeitos como buscar dados; useState guarda estados da tela.
import { useCallback, useEffect, useState } from 'react'
// LogOut, Phone e Scissors são ícones da lucide-react usados nos botões e informações do painel.
import { LogOut, Phone, Scissors } from 'lucide-react'
// useNavigate permite sair do painel e voltar para /login pelo React Router.
import { useNavigate } from 'react-router-dom'
// Componente de feedback visual que aparece no canto inferior direito
import Toast from '../components/Toast'
import logoLogin from '../assets/logo_login.png'

// API_BASE centraliza o endereço do backend para facilitar manutenção.
const API_BASE = import.meta.env.VITE_API_URL

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

/**
 * @component AdminDashboardPage
 * @description
 * Painel administrativo do barbeiro para gerenciar a fila (tarefa #14).
 * 
 * Lógica de Negócio e Arquitetura:
 * - Realiza polling (setInterval) a cada 5 segundos para garantir que a fila
 *   esteja sempre sincronizada com o backend, mesmo que o WebSocket falhe.
 * - Gerencia os status `WAITING` (Fila atual) e `IN_SERVICE` (Cliente na cadeira).
 * - Todas as ações sensíveis (chamar próximo, remover, alternar atendimento)
 *   exigem um token Bearer, validado pelo backend via `AuthService`.
 */
export default function AdminDashboardPage() {
  // navigate muda de rota sem recarregar a página, usado no botão Sair.
  const navigate = useNavigate()
  const [fila, setFila] = useState([])
  const [inService, setInService] = useState(null)
  // isOpen informa se o atendimento está aberto; começa false até a API confirmar.
  const [isOpen, setIsOpen] = useState(false)
  // carregando controla o texto "Carregando fila..." no lugar da lista.
  const [carregando, setCarregando] = useState(false)
  // erro guarda uma mensagem para mostrar quando alguma chamada da API falha.
  const [erro, setErro] = useState('')
  // chamando indica se a ação de "chamar próximo" está em andamento
  const [chamando, setChamando] = useState(false)
  // removingId guarda o id do cliente que está sendo removido no momento
  const [removingId, setRemovingId] = useState(null)
  // toastVisivel controla se o Toast está visível
  const [toastVisivel, setToastVisivel] = useState(false)
  // toastMensagem guarda o texto a ser mostrado no Toast
  const [toastMensagem, setToastMensagem] = useState('')
  // toastTipo define se o toast é 'sucesso' ou 'erro'
  const [toastTipo, setToastTipo] = useState('sucesso')

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
      // Atualiza o estado inService com o valor que veio da API
      setInService(data?.data?.inServiceEntry || data?.inServiceEntry || null)
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
    // Marca que a ação de chamar está em andamento para desabilitar o botão
    setChamando(true)

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
      // Mostra toast de sucesso curto quando a chamada conclui
      setToastMensagem('Cliente chamado!')
      setToastTipo('sucesso')
      setToastVisivel(true)
    } catch {
      // Mostra erro simples quando a ação falha.
      setErro('Não foi possível chamar o próximo cliente.')
      // Mostra toast de erro com mensagem amigável
      setToastMensagem('Erro ao chamar próximo')
      setToastTipo('erro')
      setToastVisivel(true)
    } finally {
      // Libera o botão de chamar após terminar (sucesso ou erro).
      setChamando(false)
    }
  }

  // finalizarAtual chama o endpoint /admin/finish para concluir o atendimento de quem está na cadeira
  async function finalizarAtual() {
    setChamando(true)
    setErro('')
    try {
      const token = getToken()
      const resposta = await fetch(`${API_BASE}/admin/finish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resposta.ok) {
        throw new Error('Erro ao finalizar atendimento.')
      }
      await carregarFila(false)
      setToastMensagem('Atendimento finalizado')
      setToastTipo('sucesso')
      setToastVisivel(true)
    } catch {
      setErro('Não foi possível finalizar o atendimento.')
      setToastMensagem('Erro ao finalizar')
      setToastTipo('erro')
      setToastVisivel(true)
    } finally {
      setChamando(false)
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
    // Marca qual id está sendo removido para desabilitar apenas aquele botão
    setRemovingId(id)

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
      // Mostra toast de sucesso após remover o cliente
      setToastMensagem('Cliente removido')
      setToastTipo('sucesso')
      setToastVisivel(true)
    } catch {
      // Mostra mensagem de erro discreta para o barbeiro.
      setErro('Não foi possível remover o cliente.')
      // Mostra toast de erro quando não for possível remover
      setToastMensagem('Erro ao remover cliente')
      setToastTipo('erro')
      setToastVisivel(true)
    } finally {
      // Limpa o estado de remoção para reabilitar o botão
      setRemovingId(null)
    }
  }

  // O return abaixo desenha toda a página do painel.
  return (
   <main className="relative min-h-screen overflow-x-hidden px-4 py-6 text-white sm:py-8" style={{ background: 'var(--gradient-dark)' }}>
      {/* Barra decorativa esquerda */}
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />
      {/* Barra decorativa direita */}
      <div className="absolute right-0 top-0 h-full w-1" style={{ background: 'var(--gradient-wine)' }} />

      {/* ✅ ADICIONA AQUI — Luz vermelha que emana de trás do conteúdo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(110,8,18,0.55),transparent_75%)]" />

      {/* ✅ ADICIONA AQUI — Escurecimento nas bordas para dar profundidade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />

      {/* Camada z-10 mantém o conteúdo acima das barras e do fundo. */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        {/* Header do topo com marca, subtítulo e botão de saída. */}
        <header className="flex flex-col gap-4 border-b border-[oklch(0.42_0.14_17_/_0.3)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Bloco da marca e nome da tela. */}
          <div className="min-w-0">
            {/* Título NextCut usa a fonte display Cinzel definida em --font-display. */}
            <div className="flex min-w-0 items-center gap-3">
              <img src={logoLogin} alt="NextCut Logo" className="h-10 flex-none object-contain" />
              <h1 className="min-w-0 text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>NextCut</h1>
            </div>
            {/* Texto auxiliar usa o brilho vinho para destacar o painel do barbeiro. */}
            <p className="mt-1 break-words text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm sm:tracking-widest" style={{ color: 'var(--wine-glow)' }}>
              Painel do Barbeiro {localStorage.getItem('nextcut_adminName') ? `- Olá, ${localStorage.getItem('nextcut_adminName')}` : ''}
            </p>
          </div>
          {/* Botão Sair remove o token e volta para /login. */}
          <button type="button" onClick={sair} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] bg-transparent px-5 text-sm font-semibold uppercase tracking-widest text-white transition hover:border-[var(--wine-glow)] sm:h-12">
            {/* Ícone LogOut segue o padrão de vinho brilhante com tamanho h-4 w-4. */}
            <LogOut className="h-4 w-4 text-[var(--wine-glow)]" />
            {/* Texto do botão de logout. */}
            Sair
          </button>
        </header>

        {/* Área de controles principais do barbeiro. */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* Botão grande que abre ou fecha o atendimento. */}
          <button
            type="button"
            onClick={alternarAtendimento}
            // h-12 → altura do botão; rounded-lg → cantos arredondados; border → borda fina
            className="min-h-11 rounded-lg border border-[oklch(0.42_0.14_17_/_0.3)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[var(--shadow-wine)] transition sm:h-12 sm:px-5 sm:tracking-widest"
            // Altera o fundo inline conforme isOpen para seguir o padrão visual do projeto
            style={{ background: isOpen ? 'var(--gradient-wine)' : 'oklch(0.3 0.02 20)' }}
          >
            {/* Indicador colorido à esquerda que segue a especificação (verde quando aberto) */}
            {/* Texto do botão muda conforme isOpen; ● indica o estado visual */}
            {isOpen ? '● FECHAR ATENDIMENTO' : '● ABRIR ATENDIMENTO'}
          </button>
          {/* Botão que chama o próximo cliente da fila com estado de loading */}
          <button
            type="button"
            onClick={chamarProximo}
            // inline-flex → mantém ícone e texto alinhados; h-12 → altura do botão
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[var(--shadow-wine)] transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:px-5 sm:tracking-widest"
            // Mantém o visual principal do botão com o gradiente vinho do projeto
            style={{ background: 'var(--gradient-wine)' }}
            // Desabilita o botão enquanto a ação de chamar está em andamento, ou se houver cliente em atendimento
            disabled={chamando || inService != null}
          >
            {/* Spinner simples e icone quando chamando; segue cor variável do projeto */}
            {chamando ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                CHAMANDO...
              </span>
            ) : (
              'CHAMAR PRÓXIMO'
            )}
          </button>
        </section>

        {/* MENSAGEM DE ERRO (se houver) */}
        {erro !== '' && <p className="text-sm font-medium text-red-400">{erro}</p>}

        {/* BLOCO DE EM ATENDIMENTO */}
        {inService && (
          <section className="relative overflow-hidden rounded-2xl border border-[var(--wine-glow)] bg-black/40 p-5 shadow-[var(--shadow-wine)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(110,8,18,0.3),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-widest text-white sm:text-xl">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Em Atendimento
              </h2>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="break-words text-xl font-light text-stone-100 sm:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {inService.clientName}
                  </div>
                  <div className="mt-1 break-words text-sm font-semibold tracking-widest text-[var(--wine-glow)]">
                    {getClientPhone(inService)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={finalizarAtual}
                  disabled={chamando}
                  className="min-h-11 w-full rounded-lg border border-green-600/50 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-green-500 disabled:opacity-50 sm:w-auto sm:px-6 sm:tracking-widest"
                  style={{ background: 'linear-gradient(135deg, rgba(22,101,52,0.8), rgba(21,128,61,0.8))' }}
                >
                  Finalizar Atendimento
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Toast de feedback global, mostra sucesso/erro nas ações administrativas */}
        <Toast
          mensagem={toastMensagem}
          tipo={toastTipo}
          visivel={toastVisivel}
          onFechar={() => setToastVisivel(false)}
        />

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

                // Retorna um card para o cliente atual com possíveis badges para os 3 primeiros.
                return (
                  // Card com rounded-2xl, borda vinho translúcida, fundo escuro translúcido e blur.
                  <article
                    key={`${id}-${index}`}
                    // Ajusta a borda do primeiro cliente para ficar mais brilhante conforme a especificação
                    className="rounded-2xl border p-5 backdrop-blur-sm"
                    style={{
                      background: 'oklch(0.16 0.01 20 / 0.7)',
                      borderColor: index === 0 ? 'oklch(0.55 0.18 18 / 0.8)' : 'oklch(0.42 0.14 17 / 0.3)',
                    }}
                  >
                    {/* Linha interna organiza senha, dados e ação remover. */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      {/* Bloco esquerdo com senha e dados do cliente. */}
                      <div className="flex min-w-0 items-center gap-4">
                        {/* Número da senha em destaque com fonte Cinzel e vinho brilhante. */}
                        <span className="flex-none text-4xl font-bold" style={{ color: 'var(--wine-glow)', fontFamily: 'var(--font-display)' }}>{senha}</span>
                        {/* Bloco textual com nome, telefone e posição. */}
                        <div className="min-w-0">
                          {/* Nome do cliente em branco para leitura principal. */}
                          <h3 className="break-words text-lg font-semibold text-white">{nome}</h3>
                          {/* Telefone com ícone e cor auxiliar oklch. */}
                          <p className="mt-1 flex min-w-0 items-center gap-2 text-sm" style={{ color: 'oklch(0.65 0.01 20)' }}>
                            {/* Ícone Phone segue a regra de vinho e tamanho h-4 w-4. */}
                            <Phone className="h-4 w-4 flex-none text-[var(--wine-glow)]" />
                            {/* Texto do telefone vindo da API. */}
                            <span className="min-w-0 break-words">{telefone}</span>
                          </p>
                          {/* Tag de posição mostra a ordem do cliente na fila. */}
                          <span className="mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.65 0.01 20)', borderColor: 'oklch(0.42 0.14 17 / 0.3)' }}>Posição {index + 1}</span>

                          {/* Badges especiais para os 3 primeiros: index 0 => PRÓXIMO ; index 1-2 => EM BREVE */}
                          {index === 0 ? (
                            <span className="ml-2 mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ background: 'var(--gradient-wine)', color: 'white' }}>PRÓXIMO</span>
                          ) : index === 1 || index === 2 ? (
                            <span className="ml-2 mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ border: '1px solid oklch(0.42 0.14 17 / 0.5)', color: 'var(--wine-glow)' }}>EM BREVE</span>
                          ) : null}
                        </div>
                      </div>
                      {/* Botão vermelho discreto para remover o cliente atual, com estado por linha. */}
                      <button
                        type="button"
                        onClick={() => removerCliente(id)}
                        // Apenas o botão da linha removida fica desabilitado enquanto a requisição está em andamento
                        disabled={removingId === id}
                        className="min-h-11 w-full rounded-lg border border-red-400/40 bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-widest text-red-400 transition hover:border-red-400 hover:text-white disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                      >
                        {/* Texto muda para indicar remoção quando a ação estiver em progresso */}
                        {removingId === id ? 'Removendo...' : 'Remover'}
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
