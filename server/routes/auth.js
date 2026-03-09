const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const pool    = require('../db/schema')
const { JWT_SECRET } = require('../middleware/auth')
const router  = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' })
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND active = 1', [username])
    const user = result.rows[0]
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id:user.id, username:user.username, name:user.name, role:user.role, plan:user.plan }, JWT_SECRET, { expiresIn:'7d' })
    res.json({ token, user:{ id:user.id, username:user.username, name:user.name, role:user.role, plan:user.plan, plan_expiry:user.plan_expiry } })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.get('/me', async (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    const result = await pool.query('SELECT id,username,name,role,plan,plan_expiry FROM users WHERE id=$1', [decoded.id])
    res.json(result.rows[0])
  } catch { res.status(401).json({ error: 'Invalid token' }) }
})

router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, role='subuser' } = req.body
    if (!username || !password || !name) return res.status(400).json({ error: 'username, password, name required' })
    const exists = await pool.query('SELECT id FROM users WHERE username=$1', [username])
    if (exists.rows.length) return res.status(409).json({ error: 'Username taken' })
    const hash = bcrypt.hashSync(password, 10)
    const r = await pool.query('INSERT INTO users (username,password,name,email,role) VALUES ($1,$2,$3,$4,$5) RETURNING id', [username,hash,name,email||null,role])
    res.status(201).json({ id:r.rows[0].id, username, name, role })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
