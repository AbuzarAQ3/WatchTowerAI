import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #1e3a8a 0%, #0f172a 60%, #020617 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      {/* Navbar */}
      <nav style={{display:'flex', justifyContent:'space-between', padding:'20px 40px', alignItems:'center'}}>
        <h2 style={{fontWeight:'900', letterSpacing:'1px'}}>WATCH TOWER AI</h2>
        <div>
          <button onClick={()=>navigate('/login')} style={{background:'transparent', color:'white', border:'1px solid #334155', padding:'8px 18px', borderRadius:'6px', marginRight:'10px', cursor:'pointer'}}>Login</button>
          <button onClick={()=>navigate('/register')} style={{background:'#facc15', color:'black', border:'none', padding:'8px 18px', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>Sign Up</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 40px', maxWidth:'700px'}}>
        <div style={{background:'rgba(250,204,21,0.1)', border:'1px solid rgba(250,204,21,0.3)', color:'#facc15', padding:'6px 12px', borderRadius:'20px', width:'fit-content', fontSize:'12px', marginBottom:'20px'}}>
          ● Real-time AI Threat Detection Live
        </div>
        <h1 style={{fontSize:'56px', fontWeight:'900', lineHeight:'1.1', margin:'0'}}>AI Powered<br/>Surveillance</h1>
        <p style={{color:'#94a3b8', fontSize:'18px', marginTop:'20px', lineHeight:'1.6'}}>
          Real-time threat detection, smart alerts, and complete control over your security infrastructure. Built for 7th Sem Minor Project.
        </p>
        <div style={{marginTop:'30px', display:'flex', gap:'15px'}}>
          <button onClick={()=>navigate('/register')} style={{background:'#facc15', color:'black', padding:'14px 28px', borderRadius:'8px', fontWeight:'bold', border:'none', cursor:'pointer'}}>Get Started - Register Now</button>
          <button onClick={()=>navigate('/login')} style={{background:'rgba(255,255,255,0.05)', color:'white', padding:'14px 28px', borderRadius:'8px', border:'1px solid #334155', cursor:'pointer'}}>View Demo</button>
        </div>
      </div>
    </div>
  )
}