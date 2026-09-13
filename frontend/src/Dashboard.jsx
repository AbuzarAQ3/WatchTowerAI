import { Link } from "react-router-dom"
export default function Dashboard() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#070d1c', color: 'white', fontFamily: 'monospace' }}>
            <div style={{ width: '240px', background: '#0e1a33', borderRight: '1px solid #1e345c', padding: '15px', position: 'fixed', height: '100vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><div style={{ background: '#ff6a3d', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁️</div><b>WatchTower AI</b></div>
                <div style={{ color: '#ff4444', fontSize: '12px', marginBottom: '20px' }}>● LIVE <span style={{ color: '#22c55e' }}>System Active</span></div>
                <div style={{ fontSize: '10px', color: '#5a6d8a', marginBottom: '10px' }}>NAVIGATION</div>
                <div style={{ background: '#ffaa0020', borderLeft: '3px solid #ffaa00', padding: '10px 12px', borderRadius: '8px', color: '#ffaa00' }}>⊞ Dashboard</div>
                <Link to="/cameras" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>◎ Cameras</Link>
                <Link to="/incidents" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🛡️ Incidents</Link>
                <Link to="/alerts" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>🔔 Alerts</Link>
                <Link to="/settings" style={{ color: '#a3b1c9', textDecoration: 'none', padding: '10px 12px', display: 'block' }}>⚙️ Settings</Link>
                <div style={{ position: 'absolute', bottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: '#ffaa00', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>A</div><div><div style={{ fontSize: '12px' }}>Anuj</div><div style={{ fontSize: '10px', color: '#888' }}>Frontend Lead</div></div></div>
            </div>
            <div style={{ marginLeft: '250px', padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><div><b>Dashboard</b> <span style={{ color: '#5a6d8a', fontSize: '12px' }}> Overview of live security status</span></div><div style={{ fontSize: '12px' }}>● ONLINE</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '15px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📷</span><span style={{ color: '#22c55e', fontSize: '11px' }}>12/15</span></div><h2>12</h2><div style={{ fontSize: '12px' }}>Cameras Online</div></div>
                    <div style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '15px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🛡️</span><span style={{ color: '#22c55e', fontSize: '11px' }}>+3 vs yesterday</span></div><h2>7</h2><div style={{ fontSize: '12px' }}>Incidents Today</div></div>
                    <div style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '15px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🔔</span><span style={{ color: '#22c55e', fontSize: '11px' }}>↑ URGENT</span></div><h2>3</h2><div style={{ fontSize: '12px' }}>Active Alerts</div></div>
                    <div style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '15px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📈</span><span style={{ color: '#22c55e', fontSize: '11px' }}>Nominal</span></div><h2>98%</h2><div style={{ fontSize: '12px' }}>System Health</div></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                    <div style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '15px' }}><b>Camera Feeds</b> <span style={{ fontSize: '10px', color: '#888' }}>Live monitoring overview</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
                            {[{ n: 'Main Gate' }, { n: 'North Fence' }, { n: 'Parking Lot A' }, { n: 'Canteen' }, { n: 'Block A' }, { n: 'Admin Block' }].map(c => (
                                <div key={c.n} style={{ background: '#0a162d', border: '1px solid #1e345c', height: '110px', borderRadius: '8px', padding: '8px' }}><span style={{ background: '#ff4444', fontSize: '8px', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span><div style={{ textAlign: 'center', marginTop: '20px' }}>{c.n}</div></div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: '#11213d', border: '1px solid #1e345c', borderRadius: '12px', padding: '15px' }}><b>Recent Incidents</b><div style={{ marginTop: '15px', borderLeft: '2px solid #ff4444', paddingLeft: '10px', background: '#ff444410', padding: '10px', borderRadius: '8px' }}><b style={{ fontSize: '12px' }}>Restricted Area Intrusion</b><div style={{ fontSize: '10px', color: '#888' }}>Main Gate • 14 mins ago</div></div></div>
                </div>
            </div>
        </div>
    )
}