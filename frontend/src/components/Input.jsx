// frontend/src/components/Input.jsx
export default function Input({ label, error, className = '', admin = false, icon, ...props }) {
  const inputClasses = admin
    ? 'mt-2 h-12 w-full rounded-lg border border-[#333] bg-[#1e1e1e] px-4 py-3 text-sm text-white placeholder:text-[#555] transition focus:border-[#8b1a1a] focus:outline-none'
    : 'mt-2 h-12 w-full rounded-lg border border-stone-700 bg-[#1e1e1e] px-4 py-3 text-sm text-stone-100 placeholder:text-stone-600 transition focus:border-[#8b1a1a] focus:outline-none'

  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold tracking-widest uppercase text-[#aaa]">{label}</span>
      <span className="relative block">
        {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-600">{icon}</span> : null}
        <input className={`${inputClasses} ${icon ? 'pl-10' : ''}`} {...props} />
      </span>
      {error ? <span className="mt-2 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
