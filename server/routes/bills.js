const express = require('express')
const pool = require('../db/schema')
const { authMiddleware, superuserOnly } = require('../middleware/auth')
const router = express.Router()

router.get('/:projectId', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM bills WHERE project_id=$1 ORDER BY bill_no DESC', [req.params.projectId])
    res.json(r.rows)
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.post('/', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const { project_id, bill_type='RA', bill_date } = req.body
    const last = await pool.query('SELECT MAX(bill_no) as max FROM bills WHERE project_id=$1', [project_id])
    const bill_no = (last.rows[0].max || 0) + 1
    const r = await pool.query(
      'INSERT INTO bills (project_id,bill_no,bill_type,status,bill_date,created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [project_id, bill_no, bill_type, 'draft', bill_date||new Date().toISOString().split('T')[0], req.user.id]
    )
    res.status(201).json({ id: r.rows[0].id, bill_no, status: 'draft' })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id/status', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const { status } = req.body
    if (!['draft','submitted','passed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
    await pool.query('UPDATE bills SET status=$1 WHERE id=$2', [status, req.params.id])
    res.json({ success: true })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.get('/:billId/measurements', authMiddleware, async (req, res) => {
  try {
    const rows = req.user.role === 'superuser'
      ? await pool.query(`SELECT m.*,bi.item_no,bi.description as item_desc,bi.unit,bp.name as part_name FROM measurements m JOIN boq_items bi ON bi.id=m.item_id JOIN boq_parts bp ON bp.id=bi.part_id WHERE m.bill_id=$1 ORDER BY m.sort_order`, [req.params.billId])
      : await pool.query(`SELECT m.*,bi.item_no,bi.description as item_desc,bi.unit,bp.name as part_name FROM measurements m JOIN boq_items bi ON bi.id=m.item_id JOIN boq_parts bp ON bp.id=bi.part_id INNER JOIN user_item_access uia ON uia.item_id=m.item_id AND uia.user_id=$1 WHERE m.bill_id=$2 ORDER BY m.sort_order`, [req.user.id, req.params.billId])
    res.json(rows.rows)
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.post('/:billId/measurements', authMiddleware, async (req, res) => {
  try {
    const { item_id, zone, floor_level, member, no, length, width, depth, qty, is_group } = req.body
    if (req.user.role !== 'superuser') {
      const access = await pool.query('SELECT * FROM user_item_access WHERE user_id=$1 AND item_id=$2 AND access_level=$3', [req.user.id, item_id, 'edit'])
      if (!access.rows.length) return res.status(403).json({ error: 'No edit access for this item' })
    }
    const r = await pool.query(
      `INSERT INTO measurements (bill_id,item_id,zone,floor_level,member,no,length,width,depth,qty,is_group,entered_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [req.params.billId, item_id||null, zone||'', floor_level||'', member||'', no||'1', length||'0', width||'0', depth||'0', qty||0, is_group?1:0, req.user.id]
    )
    if (item_id && !is_group) {
      await pool.query(`UPDATE boq_items SET billed_qty=(SELECT COALESCE(SUM(qty),0) FROM measurements WHERE item_id=$1) WHERE id=$1`, [item_id])
    }
    res.status(201).json({ id: r.rows[0].id })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.delete('/measurements/:id', authMiddleware, async (req, res) => {
  try {
    const m = await pool.query('SELECT * FROM measurements WHERE id=$1', [req.params.id])
    await pool.query('DELETE FROM measurements WHERE id=$1', [req.params.id])
    if (m.rows[0]?.item_id) {
      await pool.query(`UPDATE boq_items SET billed_qty=(SELECT COALESCE(SUM(qty),0) FROM measurements WHERE item_id=$1) WHERE id=$1`, [m.rows[0].item_id])
    }
    res.json({ success: true })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
