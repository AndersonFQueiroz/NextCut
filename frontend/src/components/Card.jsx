// frontend/src/components/Card.jsx
export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-[#242424] bg-[#111111] p-6 shadow-2xl shadow-black/70 ${className}`}>
      {children}
    </div>
  )
}
