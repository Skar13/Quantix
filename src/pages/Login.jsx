import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { authAPI } from '@/utils/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    if (!username || !password) return toast.error('Enter username and password')
    setLoading(true)
    try {
      const { token, user } = await authAPI.login(username, password)
      login(user, token)
      toast.success(`Welcome, ${user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="slide-up" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'44px 38px', width:380 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:44, height:44, background:'linear-gradient(135deg, #f0a500, #e07b00)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏗️</div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800 }}>
              <span style={{ color:'var(--accent)' }}>Quantix</span>
            </div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Civil Billing Solutions</div>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Enter username" autoComplete="username"
              style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" autoComplete="current-password"
              style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:'linear-gradient(135deg, #f0a500, #e07b00)', color:'#000', border:'none', borderRadius:8, padding:12, fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>
        <div style={{ marginTop:16, padding:12, background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)', fontSize:11, color:'var(--text3)', textAlign:'center' }}>
          Contact your administrator for credentials
        </div>
      </div>
    </div>
  )
}
