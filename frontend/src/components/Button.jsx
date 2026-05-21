// frontend/src/components/Button.jsx
export default function Button({
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  ...props
}) {
  const variants = {
    primary: 'bg-amber-400 text-stone-950 hover:bg-amber-500',
    danger: 'bg-[#9f1d35] text-stone-100 hover:bg-[#b42640]',
    secondary: 'border border-[#333] bg-transparent text-stone-100 hover:border-[#8b1a1a] hover:bg-[#1e1e1e]',
  }

  const classes = [
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-widest transition',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant] || variants.primary,
    fullWidth ? 'w-full' : '',
    props.className || '',
  ]
    .filter(Boolean)
    .join(' ')

  const { className, ...buttonProps } = props

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...buttonProps}>
      {children}
    </button>
  )
}
