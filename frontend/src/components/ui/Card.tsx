// HTMLAttributes = props comuns de elemento HTML (className, style, aria-*, onClick...). ReactNode = qualquer conteúdo React filho.
import type { HTMLAttributes, ReactNode } from 'react'

// CardProps: tudo que uma <section> aceita no React + obrigatório: children (conteúdo interno).
interface CardProps extends HTMLAttributes<HTMLElement> {
  // children é o que você coloca entre <Card>...</Card> (títulos, forms, links).
  children: ReactNode
}

/**
 * Card — “caixa” visual (borda + fundo + sombra definidos na classe .login-card no CSS).
 * Usamos <section> por ser um agrupador semântico de um bloco da página.
 * className extra (ex.: admin-shell) soma estilos sem remover o visual base do cartão.
 */
export function Card({ children, className = '', ...rest }: CardProps) {
  // Array com a classe base do cartão e a className opcional; filter(Boolean) remove string vazia.
  // join(' ') vira uma única string de classes separadas por espaço.
  const classes = ['login-card', className].filter(Boolean).join(' ').trim()

  // ...rest leva aria-labelledby, role, data-* etc. se você passar do componente pai.
  return (
    <section className={classes} {...rest}>
      {/* children desenha o que veio de fora entre as tags <Card>...</Card> */}
      {children}
    </section>
  )
}
