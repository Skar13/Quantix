const express = require('express')
const pool = require('../db/schema')
const { authMiddleware, superuserOnly } = require('../middleware/auth')
const router = express.Router()

router.get('/:projectId', authMiddleware, async (req, res) => {
  try {
    const parts = await pool.query('SELECT * FROM boq_parts WHERE project_id=$1 ORDER BY sort_order', [req.params.projectId])
    const result = []
    for (const part of parts.rows) {
      const items = req.user.role === 'superuser'
        ? await pool.query('SELECT * FROM boq_items WHERE part_id=$1 ORDER BY sort_order', [part.id])
        : await pool.query(`SELECT bi.* FROM boq_items bi INNER JOIN user_item_access uia ON uia.item_id=bi.id AND uia.user_id=$1 WHERE bi.part_id=$2 ORDER BY bi.sort_order`, [req.user.id, part.id])
      result.push({ ...part, items: items.rows })
    }
    res.json(result)
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.post('/item', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const { part_id, project_id, item_no, description, unit, boq_qty, rate } = req.body
    if (!part_id || !item_no || !description) return res.status(400).json({ error: 'part_id, item_no, description required' })
    const r = await pool.query('INSERT INTO boq_items (part_id,project_id,item_no,description,unit,boq_qty,rate,billed_qty) VALUES ($1,$2,$3,$4,$5,$6,$7,0) RETURNING id', [part_id,project_id,item_no,description,unit,boq_qty||0,rate||0])
    res.status(201).json({ id: r.rows[0].id })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.put('/item/:id', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const { description, unit, boq_qty, rate } = req.body
    await pool.query('UPDATE boq_items SET description=$1,unit=$2,boq_qty=$3,rate=$4 WHERE id=$5', [description,unit,boq_qty,rate,req.params.id])
    res.json({ success: true })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.delete('/item/:id', authMiddleware, superuserOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM boq_items WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.post('/part', authMiddleware, superuserOnly, async (req, res) => {
  try {
    const { project_id, name, description } = req.body
    const r = await pool.query('INSERT INTO boq_parts (project_id,name,description,sort_order) VALUES ($1,$2,$3,(SELECT COALESCE(MAX(sort_order),0)+1 FROM boq_parts WHERE project_id=$1)) RETURNING id', [project_id,name,description||''])
    res.status(201).json({ id: r.rows[0].id, name })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

router.get('/summary/:projectId', authMiddleware, async (req, res) => {
  try {
    const items = await pool.query('SELECT boq_qty,rate,billed_qty FROM boq_items WHERE project_id=$1', [req.params.projectId])
    const rows = items.rows
    res.json({
      totalContract: rows.reduce((s,i) => s+i.boq_qty*i.rate, 0),
      totalBilled:   rows.reduce((s,i) => s+i.billed_qty*i.rate, 0),
      variations:    rows.filter(i => i.billed_qty>i.boq_qty).length,
      totalItems:    rows.length
    })
  } catch(err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
