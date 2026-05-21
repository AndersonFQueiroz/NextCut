// Importa só o tipo TypeScript de atributos de <button>; não gera código em JavaScript, some no build.
import type { ButtonHTMLAttributes } from 'react'

// Interface descreve as props aceitas por este componente. extends = herda tudo que um <button> HTML aceita (onClick, disabled, type...).
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
}

/**
 * Button — botão estilizado do projeto.
 * Como usar: <Button type="button">Cancelar</Button> ou type="submit" dentro de um <form>.
 * Tudo que você passar além de variant/className vai parar no ...props e cair no <button> nativo.
 */
export function Button({ variant = 'primary', fullWidth = false, className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-amber-400 text-stone-950 hover:bg-amber-500',
    danger: 'bg-[#9f1d35] text-stone-100 hover:bg-[#b42640]',
    secondary: 'border border-[#333] bg-transparent text-stone-100 hover:border-[#8b1a1a] hover:bg-[#1e1e1e]',
  }

  const baseClass = [
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Retorna um elemento <button> nativo com as classes calculadas e todas as outras props espalhadas (...props).
  return <button className={baseClass} {...props} />
}
