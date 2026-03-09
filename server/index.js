const express = require('express')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')
require('./db/schema')
const authRoutes    = require('./routes/auth')
const boqRoutes     = require('./routes/boq')
const billsRoutes   = require('./routes/bills')
const { reportsRouter, materialsRouter, usersRouter, projectsRouter } = require('./routes/other')
const app  = express()
const PORT = process.env.PORT || 3001
app.use(cors({ origin:['http://localhost:5173','http://localhost:4173','http://127.0.0.1:5173'] }))
app.use(express.json({ limit:'10mb' }))
app.use('/api/auth',      authRoutes)
app.use('/api/projects',  projectsRouter)
app.use('/api/boq',       boqRoutes)
app.use('/api/bills',     billsRoutes)
app.use('/api/reports',   reportsRouter)
app.use('/api/materials', materialsRouter)
app.use('/api/users',     usersRouter)
app.get('/api/health', (req, res) => res.json({ status:'ok', app:'Online CBS API', time:new Date().toISOString() }))
app.get('/api/seed', async (req, res) => {
  try {
    const seed = require('./db/seed')
    res.json({ success: true, message: 'Database seeded!' })
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
})
const distPath = path.join(__dirname, '../dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => { if (!req.path.startsWith('/api')) res.sendFile(path.join(distPath,'index.html')) })
}
app.use((err, req, res, next) => res.status(500).json({ error:err.message }))
app.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('🏗️  Online CBS Server running!')
  console.log(`   API:    http://localhost:${PORT}/api`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
  console.log('')
})
module.exports = app
