import { Link } from "react-router-dom"
export default function Alerts() {
    const alerts = [{ t: 'Restricted Area Intrusion', d: 'Person detected in Admin Block restricted zone.', time: '14 mins ago', c: '#ff4444' }, { t: 'Perimeter Breach Detected', d: 'Motion detected along North Fence boundary.', time: '2h 18m ago', c: '#ff4444' }, { t: 'Unattended Object — Parking', d: 'Stationary object detected in Parking Lot B.', time: '1h 02m ago', c: '#ffaa00' }, { t: 'Camera Offline — Canteen', d: 'Camera feed lost.', time: '3h ago', c: '#5a6d8a' }]
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#070d1c', color: 'white', fontFamily: 'monospace' }}>
            <div style={{ width: '240px', background: '#0e1a33', borderRight: '1px solid #1e345c', padding: '15px', position: 'fixed', height: '100vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><div style={{ background: '#ff6a3d', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁️</div><b>WatchTower AI</b></div>
                <div style={{ color: '#ff4444', fontSize: '12px', marginBottom: '20px' }}>● LIVE <span style={{ color: '#22c55e' }}>System Active</span></div>
                <div style={{ fontSize: '10px', color: '#5a6d8a', marginBottom: '10px' }}>NAVIGATION</div>
                <Link to="/dashboard" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⊞ Dashboard</Link>
                <Link to="/cameras" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>◎ Cameras</Link>
                <Link to="/incidents" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🛡️ Incidents</Link>
                <div style={{ background: '#ffaa0020', borderLeft: '3px solid #ffaa00', padding: '10px 12px', borderRadius: '8px', color: '#ffaa00' }}>🔔 Alerts</div>
                <Link to="/settings" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⚙️ Settings</Link>
                <div style={{ position: 'absolute', bottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: '#ffaa00', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>A</div><div><div style={{ fontSize: '12px' }}>Anuj</div><div style={{ fontSize: '10px', color: '#888' }}>Frontend Lead</div></div></div>
            </div>
            <div style={{ marginLeft: '250px', padding: '20px', flex: 1 }}>
                <b>Alerts</b>
                <div style={{ marginTop: '20px' }}>
                    {alerts.map(a => (
                        <div key={a.t} style={{ background: '#11213d', border: '1px solid #1e345c', borderLeft: `3px solid ${a.c}`, borderRadius: '12px', padding: '15px', marginBottom: '12px' }}><b style={{ fontSize: '12px' }}>{a.t}</b><div style={{ fontSize: '11px', color: '#a3b1c9', marginTop: '5px' }}>{a.d}</div><div style={{ fontSize: '10px', color: '#5a6d8a', marginTop: '5px' }}>{a.time}</div></div>
                    ))}
                </div>
            </div>
        </div>
    )
}