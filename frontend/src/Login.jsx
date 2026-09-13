import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const navigate = useNavigate()

    const handleLogin = (e) => {
        e.preventDefault()
        // abhi ke liye koi bhi email/pass se login ho jayega
        navigate("/dashboard")
    }

    return (
        <div style={{ background: '#050a14', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
            <div style={{ background: '#0e1a30', border: '1px solid #1e345c', padding: '40px', borderRadius: '16px', width: '380px', textAlign: 'center' }}>
                <div style={{ fontSize: '30px' }}>👁️</div>
                <h1 style={{ color: 'white', margin: '10px 0 0 0' }}>WatchTowerAI</h1>
                <p style={{ color: '#a3b1c9', fontSize: '13px', marginBottom: '30px' }}>AI Surveillance System</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="email"
                        placeholder="Email - admin@watchtower.ai"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', background: '#11213d', border: '1px solid #1e345c', color: 'white' }}
                    />
                    <input
                        type="password"
                        placeholder="Password - 123456"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', background: '#11213d', border: '1px solid #1e345c', color: 'white' }}
                    />
                    <button type="submit" style={{ background: '#ff6a3d', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        Login to Command Center
                    </button>
                </form>

                <p style={{ color: '#556a85', fontSize: '11px', marginTop: '20px' }}>Demo: koi bhi email/pass daal ke login karo</p>
            </div>
        </div>
    )
}