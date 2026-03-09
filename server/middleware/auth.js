const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'cbs-secret-2025'
function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' })
  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch { return res.status(401).json({ error: 'Invalid token' }) }
}
function superuserOnly(req, res, next) {
  if (req.user?.role !== 'superuser') return res.status(403).json({ error: 'Superuser access required' })
  next()
}
module.exports = { authMiddleware, superuserOnly, JWT_SECRET }
