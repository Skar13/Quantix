const express = require('express')
const db = require('../db/schema')
const { authMiddleware, superuserOnly } = require('../middleware/auth')
const router = express.Router()
router.get('/:projectId', authMiddleware, (req, res) => {
  const parts = db.prepare('SELECT * FROM boq_parts WHERE project_id=? ORDER BY sort_order').all(req.params.projectId)
  res.json(parts.map(part => {
    const items = req.user.role==='superuser'
      ? db.prepare('SELECT * FROM boq_items WHERE part_id=? ORDER BY sort_order').all(part.id)
      : db.prepare(`SELECT bi.* FROM boq_items bi INNER JOIN user_item_access uia ON uia.item_id=bi.id AND uia.user_id=? WHERE bi.part_id=? ORDER BY bi.sort_order`).all(req.user.id, part.id)
    return { ...part, items }
  }))
})
router.post('/item', authMiddleware, superuserOnly, (req, res) => {
  const { part_id, project_id, item_no, description, unit, boq_qty, rate } = req.body
  if (!part_id || !item_no || !description) return res.status(400).json({ error: 'part_id, item_no, description required' })
  const r = db.prepare('INSERT INTO boq_items (part_id,project_id,item_no,description,unit,boq_qty,rate,billed_qty) VALUES (?,?,?,?,?,?,?,0)').run(part_id,project_id,item_no,description,unit,boq_qty||0,rate||0)
  res.status(201).json({ id:r.lastInsertRowid })
})
router.put('/item/:id', authMiddleware, superuserOnly, (req, res) => {
  const { description, unit, boq_qty, rate } = req.body
  db.prepare('UPDATE boq_items SET description=?,unit=?,boq_qty=?,rate=? WHERE id=?').run(description,unit,boq_qty,rate,req.params.id)
  res.json({ success:true })
})
router.delete('/item/:id', authMiddleware, superuserOnly, (req, res) => {
  db.prepare('DELETE FROM boq_items WHERE id=?').run(req.params.id)
  res.json({ success:true })
})
router.post('/part', authMiddleware, superuserOnly, (req, res) => {
  const { project_id, name, description } = req.body
  const r = db.prepare('INSERT INTO boq_parts (project_id,name,description,sort_order) VALUES (?,?,?,(SELECT COALESCE(MAX(sort_order),0)+1 FROM boq_parts WHERE project_id=?))').run(project_id,name,description||'',project_id)
  res.status(201).json({ id:r.lastInsertRowid, name })
})
router.get('/summary/:projectId', authMiddleware, (req, res) => {
  const items = db.prepare('SELECT boq_qty,rate,billed_qty FROM boq_items WHERE project_id=?').all(req.params.projectId)
  res.json({ totalContract:items.reduce((s,i)=>s+i.boq_qty*i.rate,0), totalBilled:items.reduce((s,i)=>s+i.billed_qty*i.rate,0), variations:items.filter(i=>i.billed_qty>i.boq_qty).length, totalItems:items.length })
})
module.exports = router
