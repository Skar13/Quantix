const db = require('./schema')
const bcrypt = require('bcryptjs')
console.log('🌱 Seeding database...')
db.exec(`
  DELETE FROM cement_entries; DELETE FROM advances; DELETE FROM material_receipts;
  DELETE FROM measurements; DELETE FROM bills; DELETE FROM user_item_access;
  DELETE FROM boq_items; DELETE FROM boq_parts; DELETE FROM projects; DELETE FROM users;
`)
const insertUser = db.prepare(`INSERT INTO users (username,password,name,email,role,plan,plan_expiry) VALUES (@username,@password,@name,@email,@role,@plan,@plan_expiry)`)
const admin  = insertUser.run({ username:'demo',   password:bcrypt.hashSync('password',10), name:'Admin User',   email:'admin@cbs.in',  role:'superuser', plan:'pro',   plan_expiry:'2026-03-31' })
const raj    = insertUser.run({ username:'raj',    password:bcrypt.hashSync('raj123',10),   name:'Raj Kumar',    email:'raj@cbs.in',    role:'subuser',   plan:'basic', plan_expiry:'2026-03-31' })
const mohan  = insertUser.run({ username:'mohan',  password:bcrypt.hashSync('mohan123',10), name:'Mohan Patil',  email:'mohan@cbs.in',  role:'subuser',   plan:'basic', plan_expiry:'2026-03-31' })
const suresh = insertUser.run({ username:'suresh', password:bcrypt.hashSync('suresh123',10),name:'Suresh Verma', email:'suresh@cbs.in', role:'subuser',   plan:'basic', plan_expiry:'2026-03-31' })
const anita  = insertUser.run({ username:'anita',  password:bcrypt.hashSync('anita123',10), name:'Anita Sharma', email:'anita@cbs.in',  role:'subuser',   plan:'basic', plan_expiry:'2026-03-31' })
const project = db.prepare(`INSERT INTO projects (owner_id,name,contract_no,contractor,contract_value,start_date,end_date,current_bill) VALUES (?,?,?,?,?,?,?,?)`).run(admin.lastInsertRowid,'NH-44 Road Widening Package 3','NHAI/NH44/PKG3/2024','M/s Patel Constructions Pvt. Ltd.',42000000,'2024-04-01','2026-03-31',7)
const pid = project.lastInsertRowid
const insertPart = db.prepare(`INSERT INTO boq_parts (project_id,name,description,sort_order) VALUES (?,?,?,?)`)
const insertItem = db.prepare(`INSERT INTO boq_items (part_id,project_id,item_no,description,unit,boq_qty,rate,billed_qty,sort_order) VALUES (?,?,?,?,?,?,?,?,?)`)
const boq = [
  { name:'Part A', desc:'Earthwork', items:[
    { no:'A-1', desc:'Clearing & grubbing including uprooting of trees',     unit:'Ha',  qty:12.50,  rate:18500, billed:12.50 },
    { no:'A-2', desc:'Excavation in ordinary soil for roadway formation',     unit:'m³',  qty:48200,  rate:85,    billed:45840 },
    { no:'A-3', desc:'Embankment construction from borrowed earth compacted', unit:'m³',  qty:62400,  rate:120,   billed:58100 },
  ]},
  { name:'Part B', desc:'Subbase & Base Course', items:[
    { no:'B-1', desc:'Granular Sub Base (GSB) compacted t=200mm',            unit:'m³',  qty:8420,   rate:540,   billed:5980  },
    { no:'B-2', desc:'Wet Mix Macadam (WMM) t=250mm compacted',              unit:'m³',  qty:6240,   rate:720,   billed:4428  },
    { no:'B-3', desc:'Shoulder construction with earthwork compacted',       unit:'m³',  qty:2840,   rate:180,   billed:1420  },
  ]},
  { name:'Part C', desc:'Bituminous Work', items:[
    { no:'C-1', desc:'Dense Bituminous Macadam (DBM) Grade-II t=50mm',       unit:'T',   qty:4820,   rate:6400,  billed:2314  },
    { no:'C-2', desc:'Bituminous Concrete (BC) Grade-I t=40mm',              unit:'T',   qty:2840,   rate:7200,  billed:0     },
  ]},
  { name:'Part D', desc:'Cross-Drainage Structures', items:[
    { no:'D-1', desc:'RCC M20 for foundations & footings',                   unit:'m³',  qty:284,    rate:9800,  billed:84    },
    { no:'D-7', desc:'RCC M25 Box Culvert deck slab including formwork',      unit:'m³',  qty:84,     rate:12800, billed:97.4  },
  ]},
  { name:'Part E', desc:'Drainage & Protection Works', items:[
    { no:'E-1', desc:'Rubble masonry retaining wall in CM 1:6',              unit:'m³',  qty:640,    rate:2800,  billed:420   },
    { no:'E-3', desc:'Catch water drain construction with rubble masonry',    unit:'m',   qty:1200,   rate:840,   billed:1382  },
  ]},
]
const itemIds = {}
boq.forEach((part,pi) => {
  const p = insertPart.run(pid, part.name, part.desc, pi+1)
  part.items.forEach((item,ii) => {
    const it = insertItem.run(p.lastInsertRowid, pid, item.no, item.desc, item.unit, item.qty, item.rate, item.billed, ii+1)
    itemIds[item.no] = it.lastInsertRowid
  })
})
const insertAccess = db.prepare(`INSERT OR IGNORE INTO user_item_access (user_id,item_id,access_level) VALUES (?,?,?)`)
;['B-1','B-2'].forEach(no => insertAccess.run(raj.lastInsertRowid, itemIds[no], 'edit'))
;['A-1','A-2','A-3','C-1','C-2'].forEach(no => insertAccess.run(mohan.lastInsertRowid, itemIds[no], 'edit'))
;['D-1','D-7'].forEach(no => insertAccess.run(suresh.lastInsertRowid, itemIds[no], 'edit'))
;['E-1','E-3'].forEach(no => insertAccess.run(anita.lastInsertRowid, itemIds[no], 'edit'))
const insertBill = db.prepare(`INSERT INTO bills (project_id,bill_no,bill_type,status,bill_date,amount,created_by) VALUES (?,?,?,?,?,?,?)`)
const bills = [
  {no:1,status:'passed',date:'2024-06-10',amount:1820000},{no:2,status:'passed',date:'2024-07-12',amount:2140000},
  {no:3,status:'passed',date:'2024-08-08',amount:2210000},{no:4,status:'passed',date:'2024-09-15',amount:2940000},
  {no:5,status:'passed',date:'2024-10-10',amount:3580000},{no:6,status:'passed',date:'2024-11-08',amount:4120000},
  {no:7,status:'draft', date:'2025-01-14',amount:3840000},
]
const billIds = {}
bills.forEach(b => { const r = insertBill.run(pid,b.no,'RA',b.status,b.date,b.amount,admin.lastInsertRowid); billIds[b.no]=r.lastInsertRowid })
const insertMeas = db.prepare(`INSERT INTO measurements (bill_id,item_id,zone,floor_level,member,no,length,width,depth,qty,sort_order,entered_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
;[
  ['B-2','Zone 1','Sub-grade','LHS Carriageway',      '1','4*100','7.0', '0.25',700,  0],
  ['B-2','Zone 1','Sub-grade','RHS Carriageway',      '1','4*100','7.0', '0.25',700,  1],
  ['B-2','Zone 1','Sub-grade','Junction widening',    '1','(18+24)/2','0.25','',5.25,2],
  ['B-1','Zone 2','Formation','Full Carriageway',     '1','500',  '10.5','0.20',1050, 3],
  ['E-3','Zone 1','GL',       'LHS drain CH0-2km',   '1','182',  '',    '',   182,  4],
].forEach(([no,zone,floor,member,n,l,w,d,qty,ord]) => {
  if (itemIds[no]) insertMeas.run(billIds[7],itemIds[no],zone,floor,member,n,l,w,d,qty,ord,raj.lastInsertRowid)
})
;[['Dec W4','PCC M15',142.5,6.0,872,'2024-12-28'],['Dec W3','RCC M25',84.2,8.5,709,'2024-12-21'],['Dec W2','Brickwork',210.0,1.8,401,'2024-12-14'],['Dec W1','Plastering',480.0,0.9,428,'2024-12-07']].forEach(([week,item,wqty,norm,actual,date]) => {
  db.prepare(`INSERT INTO cement_entries (project_id,bill_id,week_label,item_name,work_qty,norm,actual_bags,date) VALUES (?,?,?,?,?,?,?,?)`).run(pid,billIds[7],week,item,wqty,norm,actual,date)
})
;[['MR-142','2025-01-14','Cement OPC 53','ACC Ltd.',200,'T',380,'verified'],['MR-141','2025-01-10','Steel TMT Fe500','SAIL',18.4,'T',58500,'verified'],['MR-140','2025-01-08','Bitumen VG-30','HPCL',14.2,'T',52000,'pending']].forEach(([rno,date,mat,sup,qty,unit,rate,status]) => {
  db.prepare(`INSERT INTO material_receipts (project_id,receipt_no,date,material,supplier,qty,unit,rate,status) VALUES (?,?,?,?,?,?,?,?,?)`).run(pid,rno,date,mat,sup,qty,unit,rate,status)
})
;[['SA-007','Dec 24','M/s Patel Const.','Cement',850000,637500,425000,'active'],['SA-006','Nov 24','M/s Patel Const.','Steel',584000,438000,438000,'closed'],['SA-005','Oct 24','M/s Kumar Works','Bitumen',742000,556500,371000,'active']].forEach(([no,date,cont,mat,val,given,rec,status]) => {
  db.prepare(`INSERT INTO advances (project_id,advance_no,date,contractor,material,total_value,given,recovered,status) VALUES (?,?,?,?,?,?,?,?,?)`).run(pid,no,date,cont,mat,val,given,rec,status)
})
console.log('✅ Database seeded! Users: 5, Items: 12, Bills: 7')
