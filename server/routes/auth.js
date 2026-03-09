const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const db      = require('../db/schema')
const { JWT_SECRET } = require('../middleware/auth')
const router  = express.Router()
router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username)
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ id:user.id, username:user.username, name:user.name, role:user.role, plan:user.plan }, JWT_SECRET, { expiresIn:'7d' })
  res.json({ token, user:{ id:user.id, username:user.username, name:user.name, role:user.role, plan:user.plan, plan_expiry:user.plan_expiry } })
})
router.get('/me', (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    const user = db.prepare('SELECT id,username,name,role,plan,plan_expiry FROM users WHERE id=?').get(decoded.id)
    res.json(user)
  } catch { res.status(401).json({ error: 'Invalid token' }) }
})
router.post('/register', (req, res) => {
  const { username, password, name, email, role='subuser' } = req.body
  if (!username || !password || !name) return res.status(400).json({ error: 'username, password, name required' })
  if (db.prepare('SELECT id FROM users WHERE username=?').get(username)) return res.status(409).json({ error: 'Username taken' })
  const r = db.prepare('INSERT INTO users (username,password,name,email,role) VALUES (?,?,?,?,?)').run(username, bcrypt.hashSync(password,10), name, email||null, role)
  res.status(201).json({ id:r.lastInsertRowid, username, name, role })
})
module.exports = router
