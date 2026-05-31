// useEffect atualiza o relógio e busca a fila pública quando a landing monta.
import { useEffect, useMemo, useState } from 'react'
// Ticket e UserCircle identificam visualmente os dois caminhos principais da landing.
import { Ticket, UserCircle } from 'lucide-react'
// useNavigate permite aplicar a mesma navegação dos botões públicos existentes.
import { useNavigate } from 'react-router-dom'
// nextCutLogo usa a logo disponível nos assets do projeto para evitar caminho quebrado.
import nextCutLogo from '../assets/nextcut-logo.png'

// getQueueList aceita formatos diferentes da API pública de fila sem quebrar a tela.
function getQueueList(payload) {
  // source normaliza ApiResponse, resposta direta e objetos com entries.
  const source = payload?.data ?? payload
  // Retorna data.data quando o backend responder a lista diretamente dentro de data.
  if (Array.isArray(payload?.data)) return payload.data
  // Retorna a resposta direta quando o backend devolver um array na raiz.
  if (Array.isArray(payload)) return payload
  // Retorna entries dentro de data quando existir esse envelope.
  if (Array.isArray(source?.entries)) return source.entries
  // Retorna entries na raiz quando a API usar esse formato.
  if (Array.isArray(payload?.entries)) return payload.entries
  // Fallback vazio mantém a landing renderizável em caso de formato inesperado.
  return []
}

// getAverageMinutes aceita os nomes camelCase e snake_case previstos na tarefa.
function getAverageMinutes(payload) {
  // source normaliza campos que podem vir dentro de data.
  const source = payload?.data ?? payload
  // value tenta todos os aliases documentados para avgServiceMinutes.
  const value = payload?.avgServiceMinutes ?? payload?.avg_service_minutes ?? source?.avgServiceMinutes ?? source?.avg_service_minutes
  // Retorna número somente quando o backend envia um valor numérico válido.
  return Number.isFinite(Number(value)) ? Number(value) : null
}

// getTodayTotal lê total_today quando disponível ou conta entradas com entered_date de hoje.
function getTodayTotal(payload, entries) {
  // source normaliza campos que podem vir dentro de data.
  const source = payload?.data ?? payload
  // explicitTotal aceita total_today tanto na raiz quanto dentro de data.
  const explicitTotal = payload?.total_today ?? source?.total_today
  // Retorna total explícito quando a API envia esse campo.
  if (Number.isFinite(Number(explicitTotal))) return Number(explicitTotal)
  // todayIso calcula a data local atual no formato YYYY-MM-DD.
  const todayIso = new Date().toISOString().slice(0, 10)
  // counted soma entradas que possuem entered_date exatamente no dia atual.
  const counted = entries.filter((entry) => String(entry.entered_date ?? '').slice(0, 10) === todayIso).length
  // Retorna null quando não há campo explícito nem entradas datadas para não inventar métrica.
  return counted > 0 ? counted : null
}

// formatClock cria o texto de dia e hora usado no painel ao vivo.
function formatClock(date) {
  // weekday formata o dia da semana em português e caixa alta.
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date).toUpperCase()
  // time formata hora e minuto com dois dígitos.
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
  // Retorna no padrão visual solicitado para o header do card.
  return `${weekday} · ${time}`
}

// LandingPage substitui a antiga entrada direta do cliente na rota raiz.
export default function LandingPage() {
  // navigate centraliza as ações dos botões de barbeiro e cliente.
  const navigate = useNavigate()
  // now guarda a hora atual para o painel ao vivo.
  const [now, setNow] = useState(new Date())
  // entries guarda a lista pública recebida de GET /queue.
  const [entries, setEntries] = useState([])
  // avgServiceMinutes guarda o tempo médio de atendimento do barbeiro quando a API envia.
  const [avgServiceMinutes, setAvgServiceMinutes] = useState(null)
  // totalToday guarda o total de atendimentos do dia quando disponível.
  const [totalToday, setTotalToday] = useState(null)
  // isLoading controla a exibição dos skeletons da fila atual.
  const [isLoading, setIsLoading] = useState(true)

  // waitingEntries filtra somente clientes aguardando e preserva a ordem recebida da API.
  const waitingEntries = useMemo(() => entries.filter((entry) => entry.status === 'WAITING'), [entries])
  // visibleEntries limita a lista visual aos quatro primeiros clientes aguardando.
  const visibleEntries = useMemo(() => waitingEntries.slice(0, 4), [waitingEntries])
  // clientButtonText alterna o texto do botão conforme telefone salvo na sessão.
  const clientButtonText = sessionStorage.getItem('nextcut.clientPhone') ? 'Acompanhar minha senha' : 'Pegue sua senha'

  // useEffect atualiza o relógio do painel ao vivo a cada segundo.
  useEffect(() => {
    // timer agenda a atualização contínua do horário exibido.
    const timer = setInterval(() => setNow(new Date()), 1000)
    // Cleanup evita interval ativo após desmontagem da landing.
    return () => clearInterval(timer)
  }, [])

  // useEffect busca a fila pública uma vez quando a landing é aberta.
  useEffect(() => {
    // mounted evita atualização de estado depois que o componente desmonta.
    let mounted = true
    // loadQueue encapsula a chamada assíncrona para manter o efeito simples.
    async function loadQueue() {
      // setIsLoading liga o estado visual de carregamento antes do fetch.
      setIsLoading(true)
      // try trata falhas de rede sem derrubar a landing.
      try {
        // baseUrl usa a variável do Vite quando existir ou caminho relativo em fallback.
        const baseUrl = import.meta.env.VITE_API_URL ?? ''
        // response chama /queue sem instância axios para evitar Authorization automático.
        const response = await fetch(`${baseUrl}/queue`)
        // payload converte o JSON da resposta pública.
        const payload = await response.json()
        // list extrai a lista nos formatos aceitos pela tarefa.
        const list = getQueueList(payload)
        // average extrai avgServiceMinutes nos aliases aceitos.
        const average = getAverageMinutes(payload)
        // today calcula ou lê o total do dia conforme dados disponíveis.
        const today = getTodayTotal(payload, list)
        // Só atualiza estados se a landing ainda estiver montada.
        if (mounted) {
          // Atualiza a lista pública da fila.
          setEntries(list)
          // Atualiza a média de atendimento do barbeiro.
          setAvgServiceMinutes(average)
          // Atualiza o total de atendimentos do dia.
          setTotalToday(today)
        }
      } catch {
        // Em falha, mantém valores vazios para renderizar o estado seguro.
        if (mounted) {
          // Limpa entradas para evitar dados inconsistentes.
          setEntries([])
          // Remove média quando a API não responde.
          setAvgServiceMinutes(null)
          // Remove total do dia quando a API não responde.
          setTotalToday(null)
        }
      } finally {
        // Desliga o skeleton se o componente ainda existir.
        if (mounted) setIsLoading(false)
      }
    }
    // Executa a busca pública inicial da fila.
    loadQueue()
    // Cleanup marca que o componente saiu da tela.
    return () => {
      // mounted falso bloqueia setState tardio.
      mounted = false
    }
  }, [])

  // handleBarberClick replica a lógica pedida para entrada do barbeiro.
  function handleBarberClick() {
    // token indica se o barbeiro já tem sessão salva.
    const token = localStorage.getItem('nextcut_token')
    // Navega para o painel com token ou para login sem token.
    navigate(token ? '/admin' : '/login')
  }

  // handleClientClick replica a lógica pedida para cliente com telefone salvo ou nova entrada.
  function handleClientClick() {
    // phone lê a sessão pública do cliente no navegador.
    const phone = sessionStorage.getItem('nextcut.clientPhone')
    // Se houver telefone, acompanha a fila com state; se não houver, abre entrada.
    if (phone) navigate('/fila', { state: { phone } })
    // Sem telefone salvo, manda o cliente pegar sua senha.
    else navigate('/entrada')
  }

  // Renderiza a landing pública com hero e painel ao vivo.
  return (
    // main usa o gradiente escuro padrão do projeto em toda a tela.
    <main className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-stone-100" style={{ background: 'var(--gradient-dark)' }}>
      {/* Luz vermelha centralizada que emana de trás do conteúdo principal. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_28%_42%,rgba(110,8,18,0.55),transparent_75%)]" />
      {/* Escurecimento radial nas bordas para manter o foco no conteúdo. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />

      {/* Navbar fixa com faixa vinho inferior. */}
      <nav className="fixed inset-x-0 top-0 z-30 border-b border-[oklch(0.42_0.14_17_/_0.35)] bg-black">
        {/* Faixa interna organiza marca e ações. */}
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4">
          {/* Marca NextCut com logo e tipografia display. */}
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3">
            {/* Logo pequena no topo da landing. */}
            <img src={nextCutLogo} alt="NextCut" className="h-12 w-12 object-contain" />
            {/* Nome da marca no padrão solicitado. */}
            <span className="text-2xl font-bold tracking-widest text-white" style={{ fontFamily: 'var(--font-display)' }}>NEXTCUT</span>
            {/* Assinatura da marca ao lado do nome principal na navbar. */}
            <span className="ml-3 text-sm font-display tracking-widest text-[var(--wine-glow)]"> | SUA VEZ, SEM ESPERAR.</span>
          </button>
          {/* Ações rápidas da navbar. */}
          <div className="flex items-center gap-2">
            {/* Botão do barbeiro reutiliza a mesma lógica do hero. */}
            <button type="button" onClick={handleBarberClick} className="hidden h-10 rounded-lg border border-white bg-transparent px-5 text-sm font-semibold uppercase tracking-widest text-white transition hover:text-[var(--wine-glow)] sm:inline-flex sm:items-center">ENTRAR COMO BARBEIRO</button>
            {/* Botão do cliente reutiliza a mesma lógica do hero. */}
            <button type="button" onClick={handleClientClick} className="inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold uppercase tracking-widest text-white shadow-[var(--shadow-wine)]" style={{ background: 'var(--gradient-wine)' }}>ENTRAR NA FILA</button>
          </div>
        </div>
        {/* Faixa vermelha listrada abaixo da navbar. */}
        <div className="h-1 bg-[repeating-linear-gradient(135deg,oklch(0.42_0.14_17)_0_10px,oklch(0.28_0.09_17)_10px_20px)]" />
      </nav>

      {/* Conteúdo principal em duas colunas no desktop e coluna única no mobile. */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Hero esquerdo com promessa e CTAs. */}
        <section className="max-w-xl">
          {/* Badge de categoria da landing. */}
          <p className="inline-flex rounded-full border border-[oklch(0.42_0.14_17_/_0.35)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--wine-glow)]">● FILA DIGITAL PARA BARBEARIAS</p>
          {/* Título principal em display com destaque vinho. */}
          <h1 className="mt-6 text-5xl font-black uppercase leading-none text-white sm:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>ORGANIZE SUA <span className="block text-[var(--wine-glow)]">FILA SEM PAPEL.</span></h1>
          {/* Subtítulo direto para clientes e barbeiros. */}
          <p className="mt-4 max-w-sm text-sm text-stone-400">Cliente acompanha a fila pelo celular. Barbeiro gerencia tudo em tempo real, direto do painel.</p>
          {/* Grupo de CTAs lado a lado quando houver espaço. */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {/* CTA do barbeiro com fundo vinho sólido. */}
            <button type="button" onClick={handleBarberClick} className="flex min-h-16 items-center justify-between gap-3 rounded-xl px-4 text-left text-white shadow-[var(--shadow-wine)] transition hover:scale-[1.01] active:scale-[0.99]" style={{ background: 'var(--gradient-wine)' }}>
              {/* Ícone do barbeiro no CTA principal. */}
              <UserCircle className="h-5 w-5 flex-none" />
              {/* Textos empilhados do CTA barbeiro. */}
              <span className="min-w-0 flex-1">
                {/* Label superior do CTA barbeiro. */}
                <span className="block text-[10px] tracking-widest opacity-70">BARBEIRO</span>
                {/* Texto principal do CTA barbeiro. */}
                <span className="block font-semibold">Entrar no painel</span>
              </span>
              {/* Seta visual do CTA barbeiro. */}
              <span aria-hidden="true">→</span>
            </button>
            {/* CTA do cliente com fundo escuro e borda discreta. */}
            <button type="button" onClick={handleClientClick} className="flex min-h-16 items-center justify-between gap-3 rounded-xl border px-4 text-left text-white transition hover:scale-[1.01] active:scale-[0.99]" style={{ background: 'oklch(0.14 0.01 20)', borderColor: 'oklch(0.3 0.02 20)' }}>
              {/* Ícone de senha do cliente. */}
              <Ticket className="h-5 w-5 flex-none text-[var(--wine-glow)]" />
              {/* Textos empilhados do CTA cliente. */}
              <span className="min-w-0 flex-1">
                {/* Label superior do CTA cliente. */}
                <span className="block text-[10px] tracking-widest opacity-70">CLIENTE</span>
                {/* Texto principal muda conforme sessão do cliente. */}
                <span className="block font-semibold">{clientButtonText}</span>
              </span>
              {/* Seta visual do CTA cliente. */}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {/* Rodapé textual do hero com prova simples. */}
          <p className="mt-8 text-xs text-stone-600">+100 senhas organizadas sem caderno · Fila digital simples para barbearias.</p>
        </section>

        {/* Painel ao vivo da coluna direita. */}
        <section className="rounded-2xl border p-5 shadow-[var(--shadow-wine)] backdrop-blur-sm" style={{ background: 'oklch(0.16 0.01 20 / 0.85)', borderColor: 'oklch(0.42 0.14 17 / 0.3)' }}>
          {/* Header superior do card ao vivo. */}
          <header className="mb-5 flex items-start justify-between gap-4">
            {/* Bloco de identidade do painel. */}
            <div className="flex items-center gap-3">
              {/* Logo compacta do painel. */}
              <img src={nextCutLogo} alt="NextCut" className="h-6 w-6 object-contain" />
              {/* Título e horário do painel. */}
              <div>
                {/* Nome do painel no padrão solicitado. */}
                <p className="text-xs font-bold uppercase tracking-widest text-white">PAINEL · NEXTCUT</p>
                {/* Dia e hora atualizados a cada segundo. */}
                <p className="mt-1 text-[10px] uppercase tracking-widest text-stone-500">{formatClock(now)}</p>
              </div>
            </div>
            {/* Badge pulsante de status ao vivo. */}
            <span className="text-[10px] text-red-400 animate-pulse">● AO VIVO</span>
          </header>

          {/* Métricas públicas da fila. */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[oklch(0.42_0.14_17_/_0.2)] bg-[oklch(0.42_0.14_17_/_0.2)]">
            {/* Métrica de clientes aguardando. */}
            <div className="p-4" style={{ background: 'oklch(0.13 0.01 20)' }}>
              {/* Valor total em espera. */}
              <p className="text-2xl font-bold text-white">{waitingEntries.length}</p>
              {/* Label da métrica de fila. */}
              <p className="mt-1 text-[10px] uppercase tracking-widest text-stone-500">NA FILA</p>
            </div>
            {/* Métrica de espera média. */}
            <div className="p-4" style={{ background: 'oklch(0.13 0.01 20)' }}>
              {/* Valor da espera média ou placeholder. */}
              <p className="text-2xl font-bold text-white">{avgServiceMinutes == null ? '--' : `${avgServiceMinutes}m`}</p>
              {/* Label da espera média. */}
              <p className="mt-1 text-[10px] uppercase tracking-widest text-stone-500">ESPERA MÉDIA</p>
            </div>
            {/* Métrica de atendimentos do dia. */}
            <div className="p-4" style={{ background: 'oklch(0.13 0.01 20)' }}>
              {/* Valor do total do dia ou placeholder. */}
              <p className="text-2xl font-bold text-white">{totalToday == null ? '--' : totalToday}</p>
              {/* Label do total do dia. */}
              <p className="mt-1 text-[10px] uppercase tracking-widest text-stone-500">HOJE</p>
            </div>
          </div>

          {/* Lista atual de clientes aguardando. */}
          <div className="mt-6">
            {/* Título da seção de fila atual. */}
            <p className="text-xs uppercase tracking-widest text-stone-500">FILA ATUAL</p>
            {/* Estado de loading com três linhas skeleton. */}
            {isLoading ? (
              // Skeleton visual enquanto a API pública responde.
              <div className="mt-3 space-y-3">
                {/* Primeira linha skeleton. */}
                <div className="h-11 animate-pulse rounded bg-[oklch(0.22_0.02_20_/_0.65)]" />
                {/* Segunda linha skeleton. */}
                <div className="h-11 animate-pulse rounded bg-[oklch(0.22_0.02_20_/_0.65)]" />
                {/* Terceira linha skeleton. */}
                <div className="h-11 animate-pulse rounded bg-[oklch(0.22_0.02_20_/_0.65)]" />
              </div>
            ) : visibleEntries.length === 0 ? (
              // Estado vazio quando não há clientes aguardando.
              <p className="py-4 text-center text-xs text-stone-600">Nenhum cliente aguardando</p>
            ) : (
              // Lista renderizada com até quatro clientes aguardando.
              <div className="mt-2">
                {/* Mapeia cada cliente visível para uma linha do painel. */}
                {visibleEntries.map((entry, index) => (
                  // Linha individual de cliente com separador discreto.
                  <div key={entry.id ?? entry.ticketNumber ?? `${entry.clientName}-${index}`} className="flex items-center justify-between border-b border-[oklch(0.42_0.14_17_/_0.15)] py-3 last:border-0">
                    {/* Bloco esquerdo com senha e nome. */}
                    <div className="flex min-w-0 items-center">
                      {/* Badge da senha do cliente. */}
                      <span className="mr-3 flex h-8 w-8 flex-none items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: 'var(--gradient-wine)' }}>{entry.ticketNumber ?? '--'}</span>
                      {/* Nome do cliente aguardando. */}
                      <span className="truncate text-sm font-medium text-white">{entry.clientName ?? 'Cliente'}</span>
                    </div>
                    {/* Status estimado à direita da linha. */}
                    <span className={index === 0 ? 'text-[10px] text-red-400' : 'text-[10px] text-stone-500'}>{index === 0 ? 'EM ATENDIMENTO' : avgServiceMinutes == null ? '--' : `~${index * avgServiceMinutes} MIN`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
