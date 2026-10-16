import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ org:'', phone:'', address:'' });

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify(form));
    navigate('/login');
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(circle at top, #1e3a8a 0%, #0f172a 60%, #020617 100%)',
      display:'flex', justifyContent:'center', alignItems:'center',
      fontFamily:'sans-serif'
    }}>
      <div style={{background:'rgba(15,23,42,0.8)', border:'1px solid #1e293b', padding:'35px', borderRadius:'16px', width:'400px', backdropFilter:'blur(10px)'}}>
        <h2 style={{color:'white', fontSize:'28px', fontWeight:'800', margin:'0 0 5px 0'}}>Organization Registration</h2>
        <p style={{color:'#64748b', fontSize:'14px', marginBottom:'25px'}}>Complete your profile to access WatchTower</p>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <div>
            <label style={{color:'#94a3b8', fontSize:'12px'}}>Organization Name</label>
            <input onChange={e=>setForm({...form, org:e.target.value})} placeholder="Enter org name" required
            style={{width:'100%', marginTop:'5px', padding:'12px', borderRadius:'8px', border:'1px solid #334155', background:'#020617', color:'white'}}/>
          </div>
          <div>
            <label style={{color:'#94a3b8', fontSize:'12px'}}>Phone Number</label>
            <input onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Enter phone" required
            style={{width:'100%', marginTop:'5px', padding:'12px', borderRadius:'8px', border:'1px solid #334155', background:'#020617', color:'white'}}/>
          </div>
          <div>
            <label style={{color:'#94a3b8', fontSize:'12px'}}>Address</label>
            <textarea onChange={e=>setForm({...form, address:e.target.value})} placeholder="Enter address" required
            style={{width:'100%', marginTop:'5px', padding:'12px', borderRadius:'8px', border:'1px solid #334155', background:'#020617', color:'white', height:'80px'}}/>
          </div>

          <button type="submit" style={{background:'#facc15', color:'black', padding:'12px', borderRadius:'8px', fontWeight:'bold', border:'none', marginTop:'10px', cursor:'pointer'}}>Complete Registration</button>
        </form>

        <p style={{color:'#64748b', fontSize:'13px', textAlign:'center', marginTop:'20px'}}>
          Already have an account? <span onClick={()=>navigate('/login')} style={{color:'#facc15', cursor:'pointer'}}>Login</span>
        </p>
      </div>
    </div>
  )
}