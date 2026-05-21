// Só tipos do React para descrever props do input HTML sem importar valores em runtime.
import type { InputHTMLAttributes, ReactNode } from 'react'

// TextInputProps = tudo que <input> aceita + obrigatório: label (texto amigável acima do campo).
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  admin?: boolean
  icon?: ReactNode
}

/**
 * TextInput — campo com rótulo.
 * Você controla value/onChange na página pai (LoginPage) para ler o que foi digitado.
 * Dica: se não passar id, usamos o name como id para ligar label ao input via htmlFor.
 */
export function TextInput({ label, id, admin = false, icon, ...props }: TextInputProps) {
  // ?? é “nullish coalescing”: se id for undefined ou null, tentamos props.name como string.
  // Se nem id nem name existirem, inputId fica undefined (evite: sempre passe name ou id na página).
  const inputId = id ?? (props.name ? String(props.name) : undefined)

  // <label> com htmlFor aponta para o id do <input> — clique no texto foca o campo.
  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-xs font-semibold tracking-widest uppercase text-[#aaa]">{label}</span>
      <span className="relative block">
        {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-600">{icon}</span> : null}
        <input
          className={[
            admin
              ? 'mt-2 h-12 w-full rounded-lg border border-[#333] bg-[#1e1e1e] px-4 py-3 text-sm text-white placeholder:text-[#555] transition focus:border-[#8b1a1a] focus:outline-none'
              : 'mt-2 h-12 w-full rounded-lg border border-[#333] bg-[#1e1e1e] px-4 py-3 text-sm text-stone-100 placeholder:text-stone-600 transition focus:border-[#8b1a1a] focus:outline-none',
            icon ? 'pl-10' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          id={inputId}
          {...props}
        />
      </span>
    </label>
  )
}
