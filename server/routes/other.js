const express = require('express')
const pool = require('../db/schema')
const { authMiddleware, superuserOnly } = require('../middleware/auth')

const reportsRouter   = express.Router()
const materialsRouter = express.Router()
const usersRouter     = express.Router()
const projectsRouter  = express.Router()

// ── REPORTS ──
reportsRouter.get('/variation/:projectId', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(`SELECT bi.*,bp.name as part_name FROM boq_items bi JOIN boq_parts bp ON bp.id=bi.part_id WHERE bi.project_id=$1 AND bi.billed_qty>bi.boq_qty ORDER BY bp.sort_order,bi.sort_order`, [req.params.projectId])
    res.json(r.rows.map(i => ({ ...i, excess_qty:parseFloat((i.billed_qty-i.boq_qty).toFixed(4)), excess_value:parseFloat(((i.billed_qty-i.boq_qty)*i.rate).toFixed(2)), variation_pct:parseFloat(((i.billed_qty-i.boq_qty)/i.boq_qty*100).toFixed(2)) })))
  } catch(err) { res.status(500).json({ error: err.message }) }
})

reportsRouter.get('/cement/:projectId', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM cement_entries WHERE project_id=$1 ORDER BY date DESC', [req.params.projectId])
    res.json(r.rows.map(e => ({ ...e, norm_qty:parseFloat((e.work_qty*e.norm).toFixed(2)), variance:parseFloat((e.actual_bags-e.work_qty*e.norm).toFixed(2)) })))
  } catch(err) { res.status(500).json({ error: err.message }) }
})

reportsRouter.get('/dashboard/:projectId', authMiddleware, async (req, res) => {
  try {
    const items  = await pool.query('SELECT boq_qty,rate,billed_qty FROM boq_items WHERE project_id=$1', [req.params.projectId])
    const bills  = await pool.query('SELECT * FROM bills WHERE project_id=$1 ORDER BY bill_no DESC', [req.params.projectId])
    const parts  = await pool.query('SELECT * FROM boq_parts WHERE project_id=$1 ORDER BY sort_order', [req.params.projectId])
    const rows   = items.rows
    const totalContract = rows.reduce((s,i)=>s+i.boq_qty*i.rate,0)
    const totalBilled   = rows.reduce((s,i)=>s+i.billed_qty*i.rate,0)
    const partsProgress = []
    for (const part of parts.rows) {
      const pi = await pool.query('SELECT boq_qty,billed_qty FROM boq_items WHERE part_id=$1', [part.id])
      const tq = pi.rows.reduce((s,i)=>s+i.boq_qty,0)
      const bq = pi.rows.reduce((s,i)=>s+i.billed_qty,0)
      partsProgress.push({ ...part, total_qty:tq, billed_qty:bq, pct:tq>0?parseFloat(((bq/tq)*100).toFixed(1)):0 })
    }
    res.json({ totalContract, totalBilled, balance:totalContract-totalBilled, variations:rows.filter(i=>i.billed_qty>i.boq_qty).length, bills:bills.rows, partsProgress })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

reportsRouter.get('/advances/:projectId', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM advances WHERE project_id=$1 ORDER BY id DESC', [req.params.projectId])
    res.json(r.rows.map(a => ({ ...a, balance:parseFloat((a.given-a.recovered).toFixed(2)) })))
  } catch(err) { res.status(500).json({ error: err.message }) }
})

// ── MATERIALS ──
materialsRouter.get('/receipts/:projectId', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM material_receipts WHERE project_id=$1 ORDER BY date DESC', [req.params.projectId])
    res.json(r.rows)
  } catch(err) { res.status(500).json({ error: err.message }) }
})

materialsRouter.post('/receipts', authMiddleware, async (req, res) => {
  try {
    const { project_id, receipt_no, date, material, supplier, qty, unit, rate } = req.body
    const r = await pool.query('INSERT INTO material_receipts (project_id,receipt_no,date,material,supplier,qty,unit,rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [project_id,receipt_no,date,material,supplier,qty,unit,rate||0])
    res.status(201).json({ id: r.rows[0].id })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

materialsRouter.get('/cement/:projectId', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM cement_entries WHERE project_id=$1 ORDER BY date DESC', [req.params.projectId])
    res.json(r.rows.map(e => ({ ...e, norm_qty:e.work_qty*e.norm, variance:e.actual_bags-e.work_qty*e.norm })))
  } catch(err) { res.status(500).json({ error: err.message }) }
})

materialsRouter.post('/cement', authMiddleware, async (req, res) => {
  try {
    const { project_id, bill_id, week_label, item_name, work_qty, norm, actual_bags, date } = req.body
    const r = await pool.query('INSERT INTO cement_entries (project_id,bill_id,week_label,item_name,work_qty,norm,actual_bags,date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [project_id,bill_id||null,week_label,item_name,work_qty,norm,actual_bags,date])
    res.status(201).json({ id: r.rows[0].id })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

// ── USERS ──
usersRouter.get('/', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const users = await pool.query('SELECT id,username,name,email,role,active,created_at FROM users WHERE role=$1 ORDER BY name', ['subuser'])
    const result = []
    for (const u of users.rows) {
      const count = await pool.query('SELECT COUNT(*) as c FROM user_item_access WHERE user_id=$1', [u.id])
      result.push({ ...u, assigned_items: parseInt(count.rows[0].c)||0 })
    }
    res.json(result)
  } catch(err) { res.status(500).json({ error: err.message }) }
})

usersRouter.post('/:id/toggle', authMiddleware, superuserOnly, async (req, res) => {
  try {
    await pool.query('UPDATE users SET active=1-active WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

usersRouter.put('/:id/access', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const { items } = req.body
    await pool.query('DELETE FROM user_item_access WHERE user_id=$1', [req.params.id])
    for (const { item_id, access_level } of items) {
      await pool.query('INSERT INTO user_item_access (user_id,item_id,access_level) VALUES ($1,$2,$3)', [req.params.id, item_id, access_level||'edit'])
    }
    res.json({ success: true, count: items.length })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

// ── PROJECTS ──
projectsRouter.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = req.user.role === 'superuser'
      ? await pool.query('SELECT * FROM projects WHERE owner_id=$1 ORDER BY id DESC', [req.user.id])
      : await pool.query(`SELECT DISTINCT p.* FROM projects p JOIN boq_items bi ON bi.project_id=p.id JOIN user_item_access uia ON uia.item_id=bi.id AND uia.user_id=$1`, [req.user.id])
    res.json(projects.rows)
  } catch(err) { res.status(500).json({ error: err.message }) }
})

projectsRouter.post('/', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const { name, contract_no, contractor, contract_value, start_date, end_date } = req.body
    const r = await pool.query('INSERT INTO projects (owner_id,name,contract_no,contractor,contract_value,start_date,end_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [req.user.id,name,contract_no||'',contractor||'',contract_value||0,start_date||'',end_date||''])
    res.status(201).json({ id: r.rows[0].id, name })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

module.exports = { reportsRouter, materialsRouter, usersRouter, projectsRouter }
