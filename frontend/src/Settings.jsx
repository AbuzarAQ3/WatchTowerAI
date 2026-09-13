import { Link } from "react-router-dom"
export default function Settings() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#070d1c', color: 'white', fontFamily: 'monospace' }}>
            <div style={{ width: '240px', background: '#0e1a33', borderRight: '1px solid #1e345c', padding: '15px', position: 'fixed', height: '100vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><div style={{ background: '#ff6a3d', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁️</div><b>WatchTower AI</b></div>
                <div style={{ color: '#ff4444', fontSize: '12px', marginBottom: '20px' }}>● LIVE <span style={{ color: '#22c55e' }}>System Active</span></div>
                <div style={{ fontSize: '10px', color: '#5a6d8a', marginBottom: '10px' }}>NAVIGATION</div>
                <Link to="/dashboard" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⊞ Dashboard</Link>
                <Link to="/cameras" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>◎ Cameras</Link>
                <Link to="/incidents" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🛡️ Incidents</Link>
                <Link to="/alerts" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🔔 Alerts</Link>
                <div style={{ background: '#ffaa0020', borderLeft: '3px solid #ffaa00', padding: '10px 12px', borderRadius: '8px', color: '#ffaa00' }}>⚙️ Settings</div>
                <div style={{ position: 'absolute', bottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: '#ffaa00', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>A</div><div><div style={{ fontSize: '12px' }}>Anuj</div><div style={{ fontSize: '10px', color: '#888' }}>Frontend Lead</div></div></div>
            </div>
            <div style={{ marginLeft: '250px', padding: '20px', flex: 1 }}>
                <h1>Settings</h1>
                <div style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}><b>System Mode:</b> <span style={{ color: '#22c55e' }}> Active Monitoring</span></div>
                    <div style={{ marginBottom: '15px' }}><b>Notifications:</b> Enabled</div>
                    <div style={{ marginBottom: '15px' }}><b>Recording Quality:</b> 1080p</div>
                    <div><b>Storage:</b> 78% Used</div>
                </div>
            </div>
        </div>
    )
}