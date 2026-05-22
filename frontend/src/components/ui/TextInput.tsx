// Só tipos do React para descrever props do input HTML sem importar valores em runtime.
import type { InputHTMLAttributes } from 'react'

// TextInputProps = tudo que <input> aceita + obrigatório: label (texto amigável acima do campo).
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  // label aparece dentro do <span>; é separado de placeholder (dica dentro da caixa).
  label: string
}

/**
 * TextInput — campo com rótulo.
 * Você controla value/onChange na página pai (LoginPage) para ler o que foi digitado.
 * Dica: se não passar id, usamos o name como id para ligar label ao input via htmlFor.
 */
export function TextInput({ label, id, ...props }: TextInputProps) {
  // ?? é “nullish coalescing”: se id for undefined ou null, tentamos props.name como string.
  // Se nem id nem name existirem, inputId fica undefined (evite: sempre passe name ou id na página).
  const inputId = id ?? (props.name ? String(props.name) : undefined)

  // <label> com htmlFor aponta para o id do <input> — clique no texto foca o campo.
  return (
    <label className="form-field" htmlFor={inputId}>
      {/* Texto do rótulo; vem da prop label */}
      <span>{label}</span>
      {/* ...props inclui name, type, value, onChange, placeholder etc. passados pelo pai */}
      <input className="form-input" id={inputId} {...props} />
    </label>
  )
}
