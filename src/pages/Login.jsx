import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
const DEMO = [
  { username:'demo',  password:'password', name:'Admin User', role:'superuser' },
  { username:'raj',   password:'raj123',   name:'Raj Kumar',  role:'subuser' },
  { username:'mohan', password:'mohan123', name:'Mohan Patil',role:'subuser' },
]
export default function LoginPage() {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const demo = DEMO.find(u => u.username===username && u.password===password)
    if (demo) { login(demo, 'demo-token'); toast.success(`Welcome, ${demo.name}!`); navigate('/') }
    else toast.error('Invalid credentials. Try demo / password')
    setLoading(false)
  }
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="slide-up" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'44px 38px', width:380 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:44, height:44, background:'linear-gradient(135deg, #f0a500, #e07b00)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏗️</div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800 }}>Online <span style={{ color:'var(--accent)' }}>CBS</span></div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Civil Billing Solutions</div>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:'linear-gradient(135deg, #f0a500, #e07b00)', color:'#000', border:'none', borderRadius:8, padding:12, fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>
        <div style={{ marginTop:16, padding:14, background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)' }}>
          <div style={{ fontSize:10, color:'var(--text3)', marginBottom:8, textTransform:'uppercase' }}>Test Accounts</div>
          {DEMO.map(u => (
            <div key={u.username} onClick={() => { setUsername(u.username); setPassword(u.password) }}
              style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text2)', padding:'3px 0', cursor:'pointer' }}>
              <span>{u.name}</span><span style={{ color:'var(--text3)', fontFamily:'var(--font-mono)' }}>{u.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
