// frontend/src/components/Card.jsx
export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-100 ${className}`}>
      {children}
    </div>
  )
}
