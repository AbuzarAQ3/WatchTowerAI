import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [role, setRole] = useState('ADMIN');

  return (
    <div className="min-h-screen bg-[#070E1C] text-white flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 grid grid-cols-3 opacity-10 gap-1">
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} className="bg-[#13263E] border border-white/5"></div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl flex rounded-2xl overflow-hidden border border-white/10 bg-[#0B1426]">
        {/* Left */}
        <div className="hidden md:flex w-[45%] bg-[#0B1426] p-8 flex-col">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-[#FF8C42] rounded flex items-center justify-center text-black font-black">W</div>
            <span className="font-bold text-sm tracking-widest">WATCHTOWER AI</span>
          </div>
          <h1 className="text-4xl font-black">SECURE<br/><span className="text-[#FF8C42]">ACCESS</span></h1>
          <p className="text-white/40 text-xs mt-4 font-mono">12 CAMS • 7 INTRUSIONS • 98.4% UPTIME</p>
          <div className="mt-auto text-[10px] font-mono text-white/20">Anuj • Frontend Lead • Kanpur</div>
        </div>

        {/* Right */}
        <div className="w-full md:w-[55%] bg-[#13263E]/60 p-8">
          <div className="max-w-sm mx-auto">
            <p className="text-[11px] font-mono text-white/40 mb-6 tracking-widest">AUTHENTICATION REQUIRED</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-white/40">EMAIL</label>
                <input defaultValue="anuj@watchtower.ai" className="w-full mt-2 bg-[#0B1426] border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-[#FF8C42] outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/40">PASSWORD</label>
                <input type="password" defaultValue="123456" className="w-full mt-2 bg-[#0B1426] border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-[#FF8C42] outline-none" />
              </div>

              <div className="flex gap-2 pt-2">
                {['ADMIN','OPERATOR','VIEWER'].map(r=>(
                  <button key={r} onClick={()=>setRole(r)} className={`text-[10px] font-mono px-3 py-1.5 rounded-full border ${role===r? 'bg-[#FF8C42] text-black border-[#FF8C42] font-bold' : 'border-white/10 text-white/30'}`}>{r}</button>
                ))}
              </div>

              <button onClick={()=>navigate('/dashboard')} className="w-full mt-4 bg-[#FF8C42] text-black font-black py-4 rounded-xl text-sm">
                AUTHORIZE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}