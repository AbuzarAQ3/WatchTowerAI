import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function Signup(){
  const [form,setForm]=useState({name:"",email:"",password:""})
  const nav = useNavigate()
  const submit = (e) => {
    e.preventDefault()
    localStorage.setItem("watchtower_user", JSON.stringify(form))
    localStorage.setItem("isLoggedIn","true")
    nav("/register")
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <form onSubmit={submit} className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-xl space-y-4">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <input className="w-full p-3 border rounded-lg" placeholder="Full Name" required onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="w-full p-3 border rounded-lg" placeholder="Email" type="email" required onChange={e=>setForm({...form,email:e.target.value})} />
        <input className="w-full p-3 border rounded-lg" placeholder="Password" type="password" required onChange={e=>setForm({...form,password:e.target.value})} />
        <button className="w-full py-3 bg-black text-white rounded-lg font-bold">Sign Up</button>
        <p className="text-sm text-center">Already have account? <Link to="/login" className="text-red-600 font-bold">Login</Link></p>
      </form>
    </div>
  )
}