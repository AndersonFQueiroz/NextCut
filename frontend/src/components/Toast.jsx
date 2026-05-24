// Importa React e useEffect para controlar o ciclo de vida do toast
import React, { useEffect } from 'react'

// Componente Toast exibe uma mensagem temporária no canto inferior direito
export default function Toast({ mensagem, tipo = 'sucesso', visivel = false, onFechar }) {
  // useEffect aciona o timer que fecha automaticamente o toast após 3 segundos
  useEffect(() => {
    // Se não estiver visível, não cria timer
    if (!visivel) return undefined

    // Cria timer para chamar onFechar após 3000ms
    const timer = setTimeout(() => {
      // Chama a função de fechar quando o tempo expira
      onFechar && onFechar()
    }, 3000)

    // Limpa o timer quando o componente desmonta ou quando visivel muda
    return () => clearTimeout(timer)
  }, [visivel, onFechar])

  // Se não estiver visível, não renderiza nada
  if (!visivel) return null

  // Define classes e estilos diferentes para tipo 'sucesso' e 'erro'
  const background = tipo === 'sucesso' ? 'oklch(0.2 0.05 145 / 0.9)' : 'oklch(0.16 0.01 20 / 0.9)'
  const borderColor = tipo === 'sucesso' ? 'oklch(0.45 0.18 145 / 0.8)' : 'oklch(0.42 0.14 17 / 0.6)'

  // Renderiza o toast fixo no canto inferior direito com visual coerente ao projeto
  return (
    <div
      // Container fixo posicionando o toast no canto inferior direito
      style={{
        position: 'fixed', // fixa em relação à viewport
        right: 20, // distância da borda direita
        bottom: 20, // distância da borda inferior
        zIndex: 60, // acima do conteúdo
      }}
    >
      <div
        // Caixa do toast com aparência de card: fundo, borda e cantos arredondados
        role="status" // role acessível indicando feedback para o usuário
        className="rounded-xl p-4 shadow-lg" // rounded-xl → cantos arredondados; p-4 → padding; shadow-lg → sombra suave
        style={{
          background, // cor de fundo dependendo do tipo
          border: `1px solid ${borderColor}`, // borda com cor apropriada
          minWidth: 240, // largura mínima para legibilidade
        }}
      >
        <div className="flex items-center justify-between gap-4">{/* flex → organiza ícone e texto em linha */}
          <div className="flex items-center gap-3">{/* icone+texto agrupados */}
            <span
              // Indicador visual pequeno à esquerda do texto
              className="inline-block h-3 w-3 rounded-full"
              style={{
                 background: tipo === 'sucesso' ? 'oklch(0.45 0.18 145 / 1)': 'oklch(0.42 0.14 17 / 1)',
              }}
            />
            <div className="text-sm font-medium">{/* texto principal do toast */}
              {mensagem}
            </div>
          </div>
          <button
            // Botão de fechar que chama a função onFechar quando clicado
            onClick={() => onFechar && onFechar()}
            className="ml-2 text-sm font-semibold opacity-80"
            aria-label="Fechar"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
