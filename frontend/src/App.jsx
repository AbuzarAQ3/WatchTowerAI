import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./Login"
import Dashboard from "./Dashboard"
import Cameras from "./Cameras"
import Incidents from "./Incidents"
import Alerts from "./Alerts"
import Settings from "./Settings"
import './App.css'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cameras" element={<Cameras />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App