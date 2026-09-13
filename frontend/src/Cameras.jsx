import { Link } from "react-router-dom"
export default function Cameras() {
    const cams = ["Main Gate", "North Fence", "Parking Lot A", "Parking Lot B", "Canteen", "Block A", "Block B", "Admin Block", "Library", "Lab 1", "Lab 2", "Entrance"]
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#070d1c', color: 'white', fontFamily: 'monospace' }}>
            <div style={{ width: '240px', background: '#0e1a33', borderRight: '1px solid #1e345c', padding: '15px', position: 'fixed', height: '100vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><div style={{ background: '#ff6a3d', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁️</div><b>WatchTower AI</b></div>
                <div style={{ color: '#ff4444', fontSize: '12px', marginBottom: '20px' }}>● LIVE <span style={{ color: '#22c55e' }}>System Active</span></div>
                <div style={{ fontSize: '10px', color: '#5a6d8a', marginBottom: '10px' }}>NAVIGATION</div>
                <Link to="/dashboard" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⊞ Dashboard</Link>
                <div style={{ background: '#ffaa0020', borderLeft: '3px solid #ffaa00', padding: '10px 12px', borderRadius: '8px', color: '#ffaa00' }}>◎ Cameras</div>
                <Link to="/incidents" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🛡️ Incidents</Link>
                <Link to="/alerts" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🔔 Alerts</Link>
                <Link to="/settings" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⚙️ Settings</Link>
                <div style={{ position: 'absolute', bottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: '#ffaa00', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>A</div><div><div style={{ fontSize: '12px' }}>Anuj</div><div style={{ fontSize: '10px', color: '#888' }}>Frontend Lead</div></div></div>
            </div>
            <div style={{ marginLeft: '250px', padding: '20px', flex: 1 }}>
                <h1 style={{ margin: 0 }}>Cameras - 12 Online</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '20px' }}>
                    {cams.map(n => (
                        <div key={n} style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ background: '#22c55e', color: 'black', fontSize: '10px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>● LIVE</div>
                            <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{n}</div>
                            <div style={{ fontSize: '10px', color: '#5a6d8a', marginTop: '5px' }}>CAM • 1080p</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}