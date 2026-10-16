import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [mfa, setMfa] = useState('');
  const [role, setRole] = useState('ADMIN');

  return (
    <div style={{ minHeight: '100vh', background: '#05080F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'var(--font-mono)', position: 'relative' }}>
      
      {/* RED ALERT BORDER */}
      <div style={{ position: 'absolute', inset: '12px', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '24px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(800px at 20% 0%, rgba(245,158,11,0.08), transparent), radial-gradient(600px at 100% 100%, rgba(239,68,68,0.06), transparent)' }} />

      <div className="animate-fade-in" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1120px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', borderRadius: '20px', border: '1px solid var(--clr-border)', background: 'var(--clr-bg-surface)', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(245,158,11,0.1), 0 20px 80px rgba(0,0,0,0.8)' }}>
        
        {/* LEFT - SECURITY TERMINAL */}
        <div style={{ background: 'linear-gradient(180deg, #0F1624 0%, #090D14 100%)', padding: '28px', borderRight: '1px solid var(--clr-border)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '18px', borderBottom: '1px solid var(--clr-border)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444', animation: 'blink 1s infinite' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--clr-danger)' }}>CLASSIFICATION: TOP SECRET // NOFORN</span>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--clr-text-muted)', border: '1px solid var(--clr-border)', padding: '3px 8px', borderRadius: '99px' }}>TERMINAL ID: WT-KAN-07</span>
          </div>

          <div style={{ marginTop: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'var(--clr-amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: '18px' }}>W</div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.15em', fontFamily: 'var(--font-sans)' }}>WATCHTOWER AI</p>
              <p style={{ fontSize: '9px', color: 'var(--clr-text-muted)' }}>SECURE PERIMETER OS • BUILD 2.4.1-STABLE</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: '9px', color: 'var(--clr-text-muted)' }}>CLEARANCE REQUIRED</p>
              <p style={{ fontSize: '12px', color: 'var(--clr-amber)', fontWeight: 800 }}>LEVEL 4</p>
            </div>
          </div>

          <h1 style={{ marginTop: '28px', fontSize: '42px', fontWeight: 900, lineHeight: '0.9', letterSpacing: '-0.04em', fontFamily: 'var(--font-sans)' }}>
            HIGH SECURITY<br/>
            <span style={{ color: 'var(--clr-text-primary)', background: 'var(--clr-amber)', padding: '0 8px', color: '#000' }}>AUTHENTICATION</span><br/>
            GATEWAY
          </h1>

          {/* Security Checks */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'DEVICE FINGERPRINT', status: 'VERIFIED', color: 'var(--clr-success)' },
              { label: 'IP GEOFENCE (KANPUR)', status: 'VERIFIED', color: 'var(--clr-success)' },
              { label: 'BIOMETRIC VAULT', status: 'READY', color: 'var(--clr-amber)' },
              { label: 'ZERO-TRUST HANDSHAKE', status: 'AWAITING', color: 'var(--clr-text-muted)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--clr-bg-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '8px 12px', fontSize: '10px' }}>
                <span style={{ color: 'var(--clr-text-secondary)' }}>▶ {item.label}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>[{item.status}]</span>
              </div>
            ))}
          </div>

          {/* Live Threat Feed */}
          <div style={{ marginTop: '18px' }} className="card">
            <p style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'var(--clr-text-muted)', marginBottom: '10px' }}>LIVE THREAT FEED // ZONE-BRAVO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', maxHeight: '90px', overflow: 'hidden' }}>
              <p><span style={{ color: 'var(--clr-danger)' }}>[02:14:33]</span> <span style={{ color: 'var(--clr-text-muted)' }}>CAM-03</span> Motion detected - Sector 7</p>
              <p><span style={{ color: 'var(--clr-success)' }}>[02:14:21]</span> <span style={{ color: 'var(--clr-text-muted)' }}>CAM-01</span> Perimeter secure</p>
              <p><span style={{ color: 'var(--clr-amber)' }}>[02:13:55]</span> <span style={{ color: 'var(--clr-text-muted)' }}>CAM-04</span> Unauthorized attempt logged</p>
              <p><span style={{ color: 'var(--clr-text-muted)' }}>[02:13:12]</span> System heartbeat OK</p>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--clr-text-muted)', borderTop: '1px solid var(--clr-border)' }}>
            <span>Built by Anuj • Frontend Lead</span>
            <span>ENCRYPTION: AES-256-GCM • TLS 1.3</span>
          </div>
        </div>

        {/* RIGHT - AUTH FORM */}
        <div style={{ padding: '28px', background: '#0f1624' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.3em' }}>AUTHENTICATION_REQUIRED —</p>
            <span className="badge badge-danger">🔒 SECURE ENCLAVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--clr-text-muted)' }}>OPERATOR EMAIL • CLEARANCE ID</label>
              <input className="input" defaultValue="anuj@watchtower.mil" style={{ marginTop: '6px', fontFamily: 'var(--font-mono)' }} />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--clr-text-muted)' }}>PASSPHRASE • 16 CHAR MIN</label>
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <input className="input" type={showPass ? "text" : "password"} defaultValue="watchtower@DRDO2025" style={{ paddingRight: '40px', letterSpacing: showPass ? 'normal' : '2px' }} />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[1,2,3,4].map(i=> <div key={i} style={{ height: '3px', flex: 1, background: i<=3 ? 'var(--clr-success)' : 'var(--clr-border)', borderRadius: '99px' }} />)}
                <span style={{ fontSize: '9px', color: 'var(--clr-success)', marginLeft: '6px' }}>STRONG</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--clr-text-muted)' }}>ROLE • MISSION PROFILE</label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[
                  { id: 'ADMIN', desc: 'L4 • Full Control' },
                  { id: 'OPERATOR', desc: 'L2 • Monitor' },
                  { id: 'VIEWER', desc: 'L1 • Read Only' }
                ].map(r => (
                  <button key={r.id} onClick={()=>setRole(r.id)} style={{ flex: 1, textAlign: 'left', padding: '10px', borderRadius: '10px', border: role===r.id ? '1px solid var(--clr-amber)' : '1px solid var(--clr-border)', background: role===r.id ? 'var(--clr-amber-dim)' : 'transparent', cursor: 'pointer' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: role===r.id ? 'var(--clr-amber)' : 'var(--clr-text-primary)' }}>{r.id}</p>
                    <p style={{ fontSize: '8px', color: 'var(--clr-text-muted)' }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--clr-bg-elevated)', border: '1px dashed var(--clr-border-accent)', borderRadius: '10px', padding: '12px' }}>
              <label style={{ fontSize: '10px', color: 'var(--clr-amber)' }}>MFA CODE • AUTHENTICATOR APP (30s)</label>
              <input className="input" value={mfa} onChange={e=>setMfa(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" style={{ marginTop: '6px', letterSpacing: '8px', fontSize: '18px', textAlign: 'center', fontWeight: 800 }} />
              <p style={{ fontSize: '9px', color: 'var(--clr-text-muted)', marginTop: '6px', textAlign: 'center' }}>Code expires in 18s • Backup codes disabled</p>
            </div>

            <button onClick={()=>navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '12px', letterSpacing: '0.15em', marginTop: '4px' }}>
              ◆ AUTHORIZE & ENTER SECURE ZONE →
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '10px' }}>◍ Face ID</button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '10px' }}>◍ CAC Card</button>
            </div>

            <p style={{ fontSize: '8px', color: 'var(--clr-text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
              WARNING: Unauthorized access is a federal offense under IT Act 2000 Sec 66. All actions are logged and monitored. Session will auto-terminate after 5 min inactivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}