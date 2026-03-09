const pool = require('./schema')
const bcrypt = require('bcryptjs')

async function seed() {
  const client = await pool.connect()
  try {
    console.log('🌱 Seeding database...')
    await client.query(`
      TRUNCATE advances, cement_entries, material_receipts,
      measurements, bills, user_item_access,
      boq_items, boq_parts, projects, users
      RESTART IDENTITY CASCADE
    `)
    const adminPwd = bcrypt.hashSync('password', 10)
    const rajPwd   = bcrypt.hashSync('raj123',   10)
    const mohanPwd = bcrypt.hashSync('mohan123', 10)
    const adminRes = await client.query(`INSERT INTO users (username,password,name,email,role,plan,plan_expiry) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,['demo',adminPwd,'Admin User','admin@quantix.in','superuser','pro','2026-03-31'])
    const rajRes   = await client.query(`INSERT INTO users (username,password,name,email,role,plan,plan_expiry) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,['raj',rajPwd,'Raj Kumar','raj@quantix.in','subuser','basic','2026-03-31'])
    const mohanRes = await client.query(`INSERT INTO users (username,password,name,email,role,plan,plan_expiry) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,['mohan',mohanPwd,'Mohan Patil','mohan@quantix.in','subuser','basic','2026-03-31'])
    const adminId = adminRes.rows[0].id
    const rajId   = rajRes.rows[0].id
    const mohanId = mohanRes.rows[0].id
    const projRes = await client.query(`INSERT INTO projects (owner_id,name,contract_no,contractor,contract_value,start_date,end_date,current_bill) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,[adminId,'NH-44 Road Widening Package 3','NHAI/NH44/PKG3/2024','M/s Patel Constructions',42000000,'2024-04-01','2026-03-31',7])
    const pid = projRes.rows[0].id
    const boq = [
      { name:'Part A', desc:'Earthwork', items:[
        { no:'A-1', desc:'Clearing & grubbing including uprooting of trees', unit:'Ha',  qty:12.50, rate:18500, billed:12.50 },
        { no:'A-2', desc:'Excavation in ordinary soil for roadway',          unit:'m³',  qty:48200, rate:85,    billed:45840 },
        { no:'A-3', desc:'Embankment construction from borrowed earth',      unit:'m³',  qty:62400, rate:120,   billed:58100 },
      ]},
      { name:'Part B', desc:'Subbase & Base Course', items:[
        { no:'B-1', desc:'Granular Sub Base (GSB) compacted t=200mm',        unit:'m³',  qty:8420,  rate:540,   billed:5980 },
        { no:'B-2', desc:'Wet Mix Macadam (WMM) t=250mm compacted',          unit:'m³',  qty:6240,  rate:720,   billed:4428 },
        { no:'B-3', desc:'Shoulder construction with earthwork',             unit:'m³',  qty:2840,  rate:180,   billed:1420 },
      ]},
      { name:'Part C', desc:'Bituminous Work', items:[
        { no:'C-1', desc:'Dense Bituminous Macadam (DBM) t=50mm',            unit:'T',   qty:4820,  rate:6400,  billed:2314 },
        { no:'C-2', desc:'Bituminous Concrete (BC) t=40mm',                  unit:'T',   qty:2840,  rate:7200,  billed:0    },
      ]},
      { name:'Part D', desc:'Cross-Drainage Structures', items:[
        { no:'D-1', desc:'RCC M20 for foundations & footings',               unit:'m³',  qty:284,   rate:9800,  billed:84   },
        { no:'D-7', desc:'RCC M25 Box Culvert deck slab',                    unit:'m³',  qty:84,    rate:12800, billed:97.4 },
      ]},
      { name:'Part E', desc:'Drainage & Protection Works', items:[
        { no:'E-1', desc:'Rubble masonry retaining wall CM 1:6',             unit:'m³',  qty:640,   rate:2800,  billed:420  },
        { no:'E-3', desc:'Catch water drain construction',                   unit:'m',   qty:1200,  rate:840,   billed:1382 },
      ]},
    ]
    const itemIds = {}
    for (const [pi, part] of boq.entries()) {
      const pRes = await client.query(`INSERT INTO boq_parts (project_id,name,description,sort_order) VALUES ($1,$2,$3,$4) RETURNING id`,[pid,part.name,part.desc,pi+1])
      const partId = pRes.rows[0].id
      for (const [ii, item] of part.items.entries()) {
        const iRes = await client.query(`INSERT INTO boq_items (part_id,project_id,item_no,description,unit,boq_qty,rate,billed_qty,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,[partId,pid,item.no,item.desc,item.unit,item.qty,item.rate,item.billed,ii+1])
        itemIds[item.no] = iRes.rows[0].id
      }
    }
    const bills = [
      {no:1,status:'passed',date:'2024-06-10',amount:1820000},
      {no:2,status:'passed',date:'2024-07-12',amount:2140000},
      {no:3,status:'passed',date:'2024-08-08',amount:2210000},
      {no:4,status:'passed',date:'2024-09-15',amount:2940000},
      {no:5,status:'passed',date:'2024-10-10',amount:3580000},
      {no:6,status:'passed',date:'2024-11-08',amount:4120000},
      {no:7,status:'draft', date:'2025-01-14',amount:3840000},
    ]
    const billIds = {}
    for (const b of bills) {
      const bRes = await client.query(`INSERT INTO bills (project_id,bill_no,bill_type,status,bill_date,amount,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,[pid,b.no,'RA',b.status,b.date,b.amount,adminId])
      billIds[b.no] = bRes.rows[0].id
    }
    for (const [week,item,wqty,norm,actual,date] of [
      ['Dec W4','PCC M15',   142.5,6.0,872,'2024-12-28'],
      ['Dec W3','RCC M25',   84.2, 8.5,709,'2024-12-21'],
      ['Dec W2','Brickwork', 210.0,1.8,401,'2024-12-14'],
      ['Dec W1','Plastering',480.0,0.9,428,'2024-12-07'],
    ]) {
      await client.query(`INSERT INTO cement_entries (project_id,bill_id,week_label,item_name,work_qty,norm,actual_bags,date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,[pid,billIds[7],week,item,wqty,norm,actual,date])
    }
    for (const [no,date,cont,mat,val,given,rec,status] of [
      ['SA-007','Dec 24','M/s Patel Const.','Cement', 850000,637500,425000,'active'],
      ['SA-006','Nov 24','M/s Patel Const.','Steel',  584000,438000,438000,'closed'],
      ['SA-005','Oct 24','M/s Kumar Works', 'Bitumen',742000,556500,371000,'active'],
    ]) {
      await client.query(`INSERT INTO advances (project_id,advance_no,date,contractor,material,total_value,given,recovered,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,[pid,no,date,cont,mat,val,given,rec,status])
    }
    console.log('✅ Seeded successfully!')
  } finally {
    client.release()
  }
}

seed().catch(console.error)
module.exports = seed
