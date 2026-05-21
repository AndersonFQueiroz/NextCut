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
  const classes = [
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variant === 'primary'
      ? 'bg-amber-400 text-slate-950 hover:bg-amber-500'
      : 'border border-amber-400 bg-transparent text-slate-900 hover:bg-amber-50',
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
