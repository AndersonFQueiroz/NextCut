import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminDashboard } from './pages/AdminDashboard'
import ClientEntryPage from './pages/ClientEntryPage'
import LoginPage from './pages/LoginPage'
import QueueStatusPage from './pages/QueueStatusPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/entrada" element={<ClientEntryPage />} />
      <Route path="/fila" element={<QueueStatusPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}
