import { Link } from "react-router-dom"
export default function Incidents() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#070d1c', color: 'white', fontFamily: 'monospace' }}>
            <div style={{ width: '240px', background: '#0e1a33', borderRight: '1px solid #1e345c', padding: '15px', position: 'fixed', height: '100vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><div style={{ background: '#ff6a3d', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁️</div><b>WatchTower AI</b></div>
                <div style={{ color: '#ff4444', fontSize: '12px', marginBottom: '20px' }}>● LIVE <span style={{ color: '#22c55e' }}>System Active</span></div>
                <div style={{ fontSize: '10px', color: '#5a6d8a', marginBottom: '10px' }}>NAVIGATION</div>
                <Link to="/dashboard" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⊞ Dashboard</Link>
                <Link to="/cameras" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>◎ Cameras</Link>
                <div style={{ background: '#ffaa0020', borderLeft: '3px solid #ffaa00', padding: '10px 12px', borderRadius: '8px', color: '#ffaa00' }}>🛡️ Incidents</div>
                <Link to="/alerts" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🔔 Alerts</Link>
                <Link to="/settings" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⚙️ Settings</Link>
                <div style={{ position: 'absolute', bottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: '#ffaa00', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>A</div><div><div style={{ fontSize: '12px' }}>Anuj</div><div style={{ fontSize: '10px', color: '#888' }}>Frontend Lead</div></div></div>
            </div>
            <div style={{ marginLeft: '250px', padding: '20px', flex: 1 }}>
                <h1 style={{ margin: 0 }}>Incidents Log</h1>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { id: 'INC-017', t: 'Restricted Area Intrusion', loc: 'Main Gate', time: '14 mins ago', level: 'HIGH', color: '#ff4444' },
                        { id: 'INC-016', t: 'Unattended Object', loc: 'Parking Lot B', time: '1h 02m ago', level: 'MEDIUM', color: '#ffaa00' },
                        { id: 'INC-015', t: 'Perimeter Breach', loc: 'North Fence', time: '2h 18m ago', level: 'HIGH', color: '#ff4444' },
                    ].map(i => (
                        <div key={i.id} style={{ background: '#11213d', border: '1px solid #1e345c', borderLeft: `3px solid ${i.color}`, borderRadius: '12px', padding: '15px', display: 'flex', justifyContent: 'space-between' }}>
                            <div><div style={{ fontSize: '10px', color: '#5a6d8a' }}>{i.id} • {i.loc} • {i.time}</div><div style={{ fontWeight: 'bold', marginTop: '5px' }}>{i.t}</div></div>
                            <div style={{ background: `${i.color}20`, color: i.color, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', height: 'fit-content' }}>{i.level}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}