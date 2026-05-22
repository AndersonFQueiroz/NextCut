// Importa só o tipo TypeScript de atributos de <button>; não gera código em JavaScript, some no build.
import type { ButtonHTMLAttributes } from 'react'

// Interface descreve as props aceitas por este componente. extends = herda tudo que um <button> HTML aceita (onClick, disabled, type...).
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // variant é opcional (?); se não passar, o código usa 'primary' como padrão mais abaixo.
  // 'secondary' troca o visual para o estilo de borda (ver classes .button-secondary no CSS).
  variant?: 'primary' | 'secondary'
}

/**
 * Button — botão estilizado do projeto.
 * Como usar: <Button type="button">Cancelar</Button> ou type="submit" dentro de um <form>.
 * Tudo que você passar além de variant/className vai parar no ...props e cair no <button> nativo.
 */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  // Template string monta a lista de classes CSS aplicadas ao elemento.
  // Se variant === 'secondary', usa a classe button-secondary; senão button-primary.
  // className vindo de fora permite somar classes (ex.: <Button className="minha-classe" />).
  // .trim() remove espaço extra se className vier vazio.
  const baseClass = `button-reset ${variant === 'secondary' ? 'button-secondary' : 'button-primary'} ${className}`.trim()

  // Retorna um elemento <button> nativo com as classes calculadas e todas as outras props espalhadas (...props).
  return <button className={baseClass} {...props} />
}
