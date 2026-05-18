// ============================================================
// IMPORTS
// ============================================================

// Importa o ícone CalendarCheck da biblioteca lucide-react para representar agenda e atendimentos.
import { CalendarCheck } from 'lucide-react'
// Importa o ícone Lock da biblioteca lucide-react para indicar visualmente o campo de senha.
import { Lock } from 'lucide-react'
// Importa o ícone Mail da biblioteca lucide-react para o botão visual de login com Google.
import { Mail } from 'lucide-react'
// Importa o ícone User da biblioteca lucide-react para indicar visualmente o campo de usuário.
import { User } from 'lucide-react'
// Importa useNavigate do React Router DOM para navegar entre páginas sem recarregar o navegador.
import { useNavigate } from 'react-router-dom'
// Importa a imagem da logo que será exibida no topo da tela.
import nextCutLogo from '../assets/nextcut-logo.png'

// ============================================================
// COMPONENTE LoginPage
// ============================================================

// Exporta a página de login para que o arquivo de rotas consiga renderizá-la em /login.
export default function LoginPage() {
  // Cria a função navigate, usada para trocar de rota programaticamente com React Router.
  const navigate = useNavigate()

  // Define a ação temporária do botão principal, sem validar usuário e senha nesta etapa.
  const handleLoginClick = () => {
    // Navega para /admin quando a pessoa clica em "Entrar no painel".
    navigate('/admin')
  }

  // Renderiza toda a estrutura visual da tela de login do painel do barbeiro.
  return (
    // main representa o conteúdo principal da página; min-h-screen deixa a altura mínima igual à tela inteira.
    <main
      // relative permite posicionar as barras laterais com absolute; overflow-hidden evita que elementos decorativos criem rolagem lateral.
      className="relative min-h-screen overflow-hidden px-4 py-10 text-[var(--foreground)]"
      // background usa --gradient-dark, o gradiente escuro radial definido no CSS global para o fundo da página.
      style={{ background: 'var(--gradient-dark)' }}
    >
      {/* Renderiza a barra vertical decorativa da esquerda; absolute tira a barra do fluxo normal da página. */}
      <div
        // left-0 cola na esquerda; top-0 cola no topo; h-full ocupa a altura toda; w-1 equivale a 4px.
        className="absolute left-0 top-0 h-full w-1"
        // background usa --gradient-wine, um gradiente vinho usado nos destaques da marca.
        style={{ background: 'var(--gradient-wine)' }}
      />

      {/* Renderiza a barra vertical decorativa da direita para equilibrar visualmente a página. */}
      <div
        // right-0 cola na direita; top-0 cola no topo; h-full ocupa a altura toda; w-1 equivale a 4px.
        className="absolute right-0 top-0 h-full w-1"
        // background repete --gradient-wine para manter as duas laterais com a mesma cor.
        style={{ background: 'var(--gradient-wine)' }}
      />

      {/* Coluna central da tela; z-10 mantém o conteúdo acima das barras decorativas. */}
      <section
        // mx-auto centraliza horizontalmente; max-w-md limita a largura a 448px; flex-col empilha os blocos verticalmente.
        className="relative z-10 mx-auto flex max-w-md flex-col items-center"
      >
        {/* Cabeçalho com a logo e o subtítulo do painel. */}
        <header
          // mb-8 cria espaço abaixo do cabeçalho; gap-3 separa a logo do texto; items-center centraliza os filhos.
          className="mb-8 flex flex-col items-center gap-3"
        >
          {/* Logo da NextCut importada de src/assets/nextcut-logo.png. */}
          <img
            // src recebe a imagem importada no topo do arquivo.
            src={nextCutLogo}
            // alt descreve a imagem para acessibilidade e leitores de tela.
            alt="Logo NextCut"
            // h-56 e w-56 equivalem a 224px; object-contain mantém a proporção sem cortar a logo.
            className="h-56 w-56 object-contain"
            // filter aplica drop-shadow; --shadow-wine é a sombra vinho definida no CSS global.
            style={{ filter: 'drop-shadow(var(--shadow-wine))' }}
          />

          {/* Texto pequeno abaixo da logo para identificar a área do sistema. */}
          <p
            // font-sans usa a fonte de texto; text-xs deixa pequeno; uppercase deixa maiúsculo; tracking-[0.4em] aumenta o espaçamento entre letras.
            className="font-sans text-xs uppercase tracking-[0.4em] text-[var(--wine-glow)]"
          >
            PAINEL DO BARBEIRO
          </p>
        </header>

        {/* Card principal do formulário de login. */}
        <section
          // w-full ocupa toda a largura da coluna; rounded-2xl arredonda cantos; border cria contorno; p-8 adiciona padding interno; backdrop-blur-sm aplica blur leve.
          className="w-full rounded-2xl border p-8 shadow-2xl backdrop-blur-sm"
          // background é o preto quente semitransparente; borderColor é vinho com transparência; boxShadow usa a sombra vinho global.
          style={{
            background: 'oklch(0.16 0.01 20 / 0.7)',
            borderColor: 'oklch(0.42 0.14 17 / 0.3)',
            boxShadow: 'var(--shadow-wine)',
          }}
        >
          {/* Título do card com fonte serifada para destacar a área restrita. */}
          <h1
            // text-xl define tamanho do título; font-medium deixa peso 500; text-[var(--foreground)] usa quase branco do tema.
            className="text-xl font-medium text-[var(--foreground)]"
            // fontFamily usa --font-display, variável que aponta para Cinzel no CSS global.
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Acesso restrito
          </h1>

          {/* Subtítulo com ícone de calendário e texto explicativo. */}
          <div
            // mt-2 adiciona margem superior; flex coloca ícone e texto lado a lado; gap-2 cria espaço entre eles; text-sm reduz o texto.
            className="mt-2 flex items-center gap-2 text-sm"
            // color usa um cinza quente para deixar o subtítulo menos forte que o título.
            style={{ color: 'oklch(0.65 0.01 20)' }}
          >
            {/* Ícone do calendário; h-4 e w-4 são 16px; flex-none evita encolhimento; text-[var(--wine-glow)] usa vinho vivo. */}
            <CalendarCheck className="h-4 w-4 flex-none text-[var(--wine-glow)]" />
            {/* Texto do subtítulo que explica a utilidade do painel. */}
            <span>Veja a agenda e os atendimentos do dia</span>
          </div>

          {/* Agrupamento dos campos do formulário; space-y-5 cria espaçamento vertical entre os campos. */}
          <div className="mt-8 space-y-5">
            {/* Campo de usuário, com label e input no mesmo bloco clicável. */}
            <label className="block space-y-2">
              {/* Label pequena e maiúscula para identificar o campo usuário. */}
              <span
                // block ocupa a linha inteira; text-xs deixa pequeno; uppercase deixa maiúsculo; tracking-widest espaça as letras.
                className="block text-xs uppercase tracking-widest"
                // color usa cinza quente para a label ficar legível sem competir com o título.
                style={{ color: 'oklch(0.65 0.01 20)' }}
              >
                USUÁRIO
              </span>
              {/* Wrapper relative permite posicionar o ícone dentro do input. */}
              <span className="relative block">
                {/* Ícone de usuário dentro do input; pointer-events-none impede que ele capture cliques. */}
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--wine-glow)]" />
                {/* Input de usuário; name="username" prepara acessibilidade e integração futura com autenticação. */}
                <input
                  // type text permite digitar nome de usuário comum.
                  type="text"
                  // name identifica o campo para formulários, testes e futura integração.
                  name="username"
                  // placeholder mostra um exemplo de preenchimento antes da digitação.
                  placeholder="seu.usuario"
                  // h-12 define altura; w-full ocupa largura total; pl-10 abre espaço para o ícone; focus:border muda a borda no foco.
                  className="h-12 w-full rounded-lg border bg-transparent pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-slate-500 transition-colors focus:border-[oklch(0.55_0.18_18)]"
                  // borderColor define a borda sutil do campo quando ele não está em foco.
                  style={{ borderColor: 'oklch(0.3 0.02 20)' }}
                />
              </span>
            </label>

            {/* Campo de senha, visualmente igual ao campo usuário para manter consistência. */}
            <label className="block space-y-2">
              {/* Label pequena e maiúscula para identificar o campo senha. */}
              <span
                // block ocupa a linha inteira; text-xs deixa pequeno; uppercase deixa maiúsculo; tracking-widest espaça as letras.
                className="block text-xs uppercase tracking-widest"
                // color repete o cinza quente usado na label de usuário.
                style={{ color: 'oklch(0.65 0.01 20)' }}
              >
                SENHA
              </span>
              {/* Wrapper relative para o ícone Lock ficar posicionado dentro do input. */}
              <span className="relative block">
                {/* Ícone de cadeado; left-3 posiciona à esquerda e top-1/2 centraliza verticalmente. */}
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--wine-glow)]" />
                {/* Input de senha; type password oculta os caracteres digitados. */}
                <input
                  // type password protege visualmente a senha durante a digitação.
                  type="password"
                  // name identifica o campo para acessibilidade, testes e integração futura.
                  name="password"
                  // placeholder com bolinhas comunica que o campo espera senha.
                  placeholder="••••••••"
                  // h-12 define altura; bg-transparent deixa ver o fundo do card; pl-10 evita sobreposição com o ícone.
                  className="h-12 w-full rounded-lg border bg-transparent pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-slate-500 transition-colors focus:border-[oklch(0.55_0.18_18)]"
                  // borderColor mantém uma borda discreta antes do foco.
                  style={{ borderColor: 'oklch(0.3 0.02 20)' }}
                />
              </span>
            </label>
          </div>

          {/* Linha com opção de manter conectado à esquerda e link de recuperação à direita. */}
          <div
            // mt-5 cria distância dos campos; flex alinha os itens; justify-between empurra cada item para um lado; gap-4 evita colisão em telas menores.
            className="mt-5 flex items-center justify-between gap-4 text-sm"
          >
            {/* Label do checkbox; cursor-pointer mostra que o texto também pode ser clicado. */}
            <label
              // flex alinha checkbox e texto na mesma linha; gap-2 separa os dois elementos.
              className="flex cursor-pointer items-center gap-2"
              // color usa cinza quente para texto auxiliar.
              style={{ color: 'oklch(0.65 0.01 20)' }}
            >
              {/* Checkbox visual para futura opção de manter sessão ativa. */}
              <input
                // type checkbox cria uma caixa marcável.
                type="checkbox"
                // h-4 e w-4 deixam o checkbox com 16px; accent define a cor quando marcado.
                className="h-4 w-4 rounded border-slate-700 accent-[var(--wine-glow)]"
              />
              {/* Texto do checkbox. */}
              <span>Manter conectado</span>
            </label>

            {/* Link visual de recuperação de senha; ainda sem fluxo real implementado. */}
            <a
              // href="#" mantém aparência de link sem navegar para uma tela real; hover:underline sublinha no hover.
              href="#"
              // text-[var(--wine-glow)] usa vinho vivo para indicar elemento clicável.
              className="text-[var(--wine-glow)] hover:underline"
            >
              Esqueci minha senha
            </a>
          </div>

          {/* Botão principal da tela, responsável por navegar para /admin. */}
          <button
            // type button evita submit porque ainda não existe autenticação nem action de formulário.
            type="button"
            // onClick chama a função que usa navigate('/admin').
            onClick={handleLoginClick}
            // mt-6 cria margem; w-full ocupa toda a largura; uppercase deixa maiúsculo; hover e active alteram a escala no clique.
            className="mt-6 h-12 w-full rounded-lg font-semibold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            // background usa --gradient-wine; boxShadow usa --shadow-wine para destacar a ação principal.
            style={{ background: 'var(--gradient-wine)', boxShadow: 'var(--shadow-wine)' }}
          >
            ENTRAR NO PAINEL
          </button>

          {/* Divisor visual com a palavra "ou" no centro. */}
          <div
            // my-7 cria margem vertical; flex monta linha esquerda, texto e linha direita; items-center centraliza verticalmente.
            className="my-7 flex items-center gap-3"
          >
            {/* Linha horizontal esquerda; h-px equivale a 1px de altura; flex-1 ocupa o espaço disponível. */}
            <span className="h-px flex-1" style={{ background: 'oklch(0.3 0.02 20)' }} />
            {/* Texto central do divisor; text-[10px] deixa pequeno; uppercase e tracking-widest deixam com aparência de separador. */}
            <span className="text-[10px] uppercase tracking-widest" style={{ color: 'oklch(0.5 0.01 20)' }}>
              ou
            </span>
            {/* Linha horizontal direita; repete a mesma cor para simetria. */}
            <span className="h-px flex-1" style={{ background: 'oklch(0.3 0.02 20)' }} />
          </div>

          {/* Botão visual de login com Google, sem lógica OAuth nesta etapa. */}
          <button
            // type button evita submit e mantém o botão apenas visual.
            type="button"
            // flex centraliza ícone e texto; gap-3 separa; hover:bg clareia um pouco o fundo ao passar o mouse.
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[oklch(0.22_0.01_20_/_0.8)]"
            // background cria fundo semitransparente; borderColor aplica borda vinho suave.
            style={{ background: 'oklch(0.18 0.01 20 / 0.6)', borderColor: 'oklch(0.42 0.14 17 / 0.5)' }}
          >
            {/* Ícone Mail usado como símbolo simples para entrada externa. */}
            <Mail className="h-4 w-4 text-[var(--wine-glow)]" />
            {/* Texto do botão secundário. */}
            <span>Entrar com Google</span>
          </button>

          {/* Texto de rodapé dentro do card com orientação para profissionais. */}
          <p
            // mt-6 cria distância do botão; text-center centraliza; text-xs deixa discreto.
            className="mt-6 text-center text-xs"
            // color usa cinza mais escuro para baixa hierarquia visual.
            style={{ color: 'oklch(0.5 0.01 20)' }}
          >
            Acesso exclusivo para profissionais. Solicite credenciais ao gerente.
          </p>
        </section>

        {/* Rodapé da página exibido abaixo do card. */}
        <footer
          // mt-7 cria distância do card; text-center centraliza; text-xs mantém o rodapé discreto.
          className="mt-7 text-center text-xs"
          // color usa cinza escuro para não competir com o conteúdo principal.
          style={{ color: 'oklch(0.45 0.01 20)' }}
        >
          © 2026 NextCut · Painel interno
        </footer>
      </section>
    </main>
  )
}
