import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import Cameras from './pages/Cameras'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import AppLayout from './components/layout/AppLayout'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
    
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Register />} />

        
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="cameras" element={<Cameras />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
