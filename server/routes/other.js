const express = require('express')
const db = require('../db/schema')
const { authMiddleware, superuserOnly } = require('../middleware/auth')
const reportsRouter   = express.Router()
const materialsRouter = express.Router()
const usersRouter     = express.Router()
const projectsRouter  = express.Router()
reportsRouter.get('/variation/:projectId', authMiddleware, (req, res) => {
  const items = db.prepare(`SELECT bi.*,bp.name as part_name FROM boq_items bi JOIN boq_parts bp ON bp.id=bi.part_id WHERE bi.project_id=? AND bi.billed_qty>bi.boq_qty ORDER BY bp.sort_order,bi.sort_order`).all(req.params.projectId)
  res.json(items.map(i => ({ ...i, excess_qty:parseFloat((i.billed_qty-i.boq_qty).toFixed(4)), excess_value:parseFloat(((i.billed_qty-i.boq_qty)*i.rate).toFixed(2)), variation_pct:parseFloat(((i.billed_qty-i.boq_qty)/i.boq_qty*100).toFixed(2)) })))
})
reportsRouter.get('/cement/:projectId', authMiddleware, (req, res) => {
  const entries = db.prepare('SELECT * FROM cement_entries WHERE project_id=? ORDER BY date DESC').all(req.params.projectId)
  res.json(entries.map(e => ({ ...e, norm_qty:parseFloat((e.work_qty*e.norm).toFixed(2)), variance:parseFloat((e.actual_bags-e.work_qty*e.norm).toFixed(2)) })))
})
reportsRouter.get('/dashboard/:projectId', authMiddleware, (req, res) => {
  const items   = db.prepare('SELECT boq_qty,rate,billed_qty FROM boq_items WHERE project_id=?').all(req.params.projectId)
  const bills   = db.prepare('SELECT * FROM bills WHERE project_id=? ORDER BY bill_no DESC').all(req.params.projectId)
  const parts   = db.prepare('SELECT * FROM boq_parts WHERE project_id=? ORDER BY sort_order').all(req.params.projectId)
  const totalContract = items.reduce((s,i)=>s+i.boq_qty*i.rate,0)
  const totalBilled   = items.reduce((s,i)=>s+i.billed_qty*i.rate,0)
  const partsProgress = parts.map(part => {
    const pi = db.prepare('SELECT boq_qty,billed_qty FROM boq_items WHERE part_id=?').all(part.id)
    const tq = pi.reduce((s,i)=>s+i.boq_qty,0)
    const bq = pi.reduce((s,i)=>s+i.billed_qty,0)
    return { ...part, total_qty:tq, billed_qty:bq, pct:tq>0?parseFloat(((bq/tq)*100).toFixed(1)):0 }
  })
  res.json({ totalContract, totalBilled, balance:totalContract-totalBilled, variations:items.filter(i=>i.billed_qty>i.boq_qty).length, bills, partsProgress })
})
materialsRouter.get('/receipts/:projectId', authMiddleware, (req, res) => res.json(db.prepare('SELECT * FROM material_receipts WHERE project_id=? ORDER BY date DESC').all(req.params.projectId)))
materialsRouter.post('/receipts', authMiddleware, (req, res) => {
  const { project_id, receipt_no, date, material, supplier, qty, unit, rate } = req.body
  const r = db.prepare('INSERT INTO material_receipts (project_id,receipt_no,date,material,supplier,qty,unit,rate) VALUES (?,?,?,?,?,?,?,?)').run(project_id,receipt_no,date,material,supplier,qty,unit,rate||0)
  res.status(201).json({ id:r.lastInsertRowid })
})
materialsRouter.get('/cement/:projectId', authMiddleware, (req, res) => {
  const entries = db.prepare('SELECT * FROM cement_entries WHERE project_id=? ORDER BY date DESC').all(req.params.projectId)
  res.json(entries.map(e => ({ ...e, norm_qty:e.work_qty*e.norm, variance:e.actual_bags-e.work_qty*e.norm })))
})
materialsRouter.post('/cement', authMiddleware, (req, res) => {
  const { project_id, bill_id, week_label, item_name, work_qty, norm, actual_bags, date } = req.body
  const r = db.prepare('INSERT INTO cement_entries (project_id,bill_id,week_label,item_name,work_qty,norm,actual_bags,date) VALUES (?,?,?,?,?,?,?,?)').run(project_id,bill_id||null,week_label,item_name,work_qty,norm,actual_bags,date)
  res.status(201).json({ id:r.lastInsertRowid })
})
usersRouter.get('/', authMiddleware, superuserOnly, (req, res) => {
  const users = db.prepare('SELECT id,username,name,email,role,active,created_at FROM users WHERE role="subuser" ORDER BY name').all()
  res.json(users.map(u => ({ ...u, assigned_items:db.prepare('SELECT COUNT(*) as c FROM user_item_access WHERE user_id=?').get(u.id)?.c||0 })))
})
usersRouter.post('/:id/toggle', authMiddleware, superuserOnly, (req, res) => {
  db.prepare('UPDATE users SET active=1-active WHERE id=?').run(req.params.id)
  res.json({ success:true })
})
usersRouter.put('/:id/access', authMiddleware, superuserOnly, (req, res) => {
  const { items } = req.body
  db.prepare('DELETE FROM user_item_access WHERE user_id=?').run(req.params.id)
  const insert = db.prepare('INSERT INTO user_item_access (user_id,item_id,access_level) VALUES (?,?,?)')
  items.forEach(({ item_id, access_level }) => insert.run(req.params.id,item_id,access_level||'edit'))
  res.json({ success:true, count:items.length })
})
projectsRouter.get('/', authMiddleware, (req, res) => {
  const projects = req.user.role==='superuser'
    ? db.prepare('SELECT * FROM projects WHERE owner_id=? ORDER BY id DESC').all(req.user.id)
    : db.prepare(`SELECT DISTINCT p.* FROM projects p JOIN boq_items bi ON bi.project_id=p.id JOIN user_item_access uia ON uia.item_id=bi.id AND uia.user_id=?`).all(req.user.id)
  res.json(projects)
})
projectsRouter.post('/', authMiddleware, superuserOnly, (req, res) => {
  const { name, contract_no, contractor, contract_value, start_date, end_date } = req.body
  const r = db.prepare('INSERT INTO projects (owner_id,name,contract_no,contractor,contract_value,start_date,end_date) VALUES (?,?,?,?,?,?,?)').run(req.user.id,name,contract_no||'',contractor||'',contract_value||0,start_date||'',end_date||'')
  res.status(201).json({ id:r.lastInsertRowid, name })
})
module.exports = { reportsRouter, materialsRouter, usersRouter, projectsRouter }
