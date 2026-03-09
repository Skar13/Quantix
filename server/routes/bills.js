const express = require('express')
const db = require('../db/schema')
const { authMiddleware, superuserOnly } = require('../middleware/auth')
const router = express.Router()
router.get('/:projectId', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM bills WHERE project_id=? ORDER BY bill_no DESC').all(req.params.projectId))
})
router.post('/', authMiddleware, superuserOnly, (req, res) => {
  const { project_id, bill_type='RA', bill_date } = req.body
  const last = db.prepare('SELECT MAX(bill_no) as max FROM bills WHERE project_id=?').get(project_id)
  const bill_no = (last?.max||0)+1
  const r = db.prepare('INSERT INTO bills (project_id,bill_no,bill_type,status,bill_date,created_by) VALUES (?,?,?,"draft",?,?)').run(project_id,bill_no,bill_type,bill_date||new Date().toISOString().split('T')[0],req.user.id)
  res.status(201).json({ id:r.lastInsertRowid, bill_no, status:'draft' })
})
router.get('/:billId/measurements', authMiddleware, (req, res) => {
  const rows = req.user.role==='superuser'
    ? db.prepare(`SELECT m.*,bi.item_no,bi.description as item_desc,bi.unit,bp.name as part_name FROM measurements m JOIN boq_items bi ON bi.id=m.item_id JOIN boq_parts bp ON bp.id=bi.part_id WHERE m.bill_id=? ORDER BY m.sort_order`).all(req.params.billId)
    : db.prepare(`SELECT m.*,bi.item_no,bi.description as item_desc,bi.unit,bp.name as part_name FROM measurements m JOIN boq_items bi ON bi.id=m.item_id JOIN boq_parts bp ON bp.id=bi.part_id INNER JOIN user_item_access uia ON uia.item_id=m.item_id AND uia.user_id=? WHERE m.bill_id=? ORDER BY m.sort_order`).all(req.user.id,req.params.billId)
  res.json(rows)
})
router.post('/:billId/measurements', authMiddleware, (req, res) => {
  const { item_id, zone, floor_level, member, no, length, width, depth, qty, is_group } = req.body
  if (req.user.role!=='superuser') {
    const access = db.prepare('SELECT * FROM user_item_access WHERE user_id=? AND item_id=? AND access_level="edit"').get(req.user.id,item_id)
    if (!access) return res.status(403).json({ error:'No edit access for this item' })
  }
  const r = db.prepare(`INSERT INTO measurements (bill_id,item_id,zone,floor_level,member,no,length,width,depth,qty,is_group,entered_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(req.params.billId,item_id||null,zone||'',floor_level||'',member||'',no||'1',length||'0',width||'0',depth||'0',qty||0,is_group?1:0,req.user.id)
  if (item_id && !is_group) db.prepare(`UPDATE boq_items SET billed_qty=(SELECT COALESCE(SUM(qty),0) FROM measurements WHERE item_id=?) WHERE id=?`).run(item_id,item_id)
  res.status(201).json({ id:r.lastInsertRowid })
})
router.delete('/measurements/:id', authMiddleware, (req, res) => {
  const m = db.prepare('SELECT * FROM measurements WHERE id=?').get(req.params.id)
  db.prepare('DELETE FROM measurements WHERE id=?').run(req.params.id)
  if (m?.item_id) db.prepare(`UPDATE boq_items SET billed_qty=(SELECT COALESCE(SUM(qty),0) FROM measurements WHERE item_id=?) WHERE id=?`).run(m.item_id,m.item_id)
  res.json({ success:true })
})
module.exports = router
