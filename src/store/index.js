import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── AUTH STORE ──
export const useAuthStore = create(persist((set) => ({
  user: null, token: null, isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}), { name: 'cbs-auth' }))

// ── PROJECT STORE ──
export const useProjectStore = create(persist((set, get) => ({
  projects: [
    {
      id: 'p1',
      name: 'NH-44 Road Widening Package 3',
      contract_no: 'NHAI/NH44/PKG3/2024',
      contractor: 'M/s Patel Constructions Pvt. Ltd.',
      contract_value: 42000000,
      start_date: '2024-04-01',
      end_date: '2026-03-31',
      currentBill: 7
    }
  ],
  activeProjectId: 'p1',
  getActiveProject: () => get().projects.find(p => p.id === get().activeProjectId),
  setActiveProject: (id) => set({ activeProjectId: id }),
  addProject: (project) => set(s => ({ projects: [...s.projects, { ...project, id: Date.now().toString() }] })),
  updateProject: (id, data) => set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p) })),
  deleteProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id) })),
}), { name: 'cbs-projects' }))

// ── BOQ STORE ──
export const useBOQStore = create(persist((set, get) => ({
  parts: [
    { id: 'partA', projectId: 'p1', name: 'Part A', description: 'Earthwork', order: 1 },
    { id: 'partB', projectId: 'p1', name: 'Part B', description: 'Subbase & Base Course', order: 2 },
    { id: 'partC', projectId: 'p1', name: 'Part C', description: 'Bituminous Work', order: 3 },
    { id: 'partD', projectId: 'p1', name: 'Part D', description: 'Cross-Drainage Structures', order: 4 },
    { id: 'partE', projectId: 'p1', name: 'Part E', description: 'Drainage & Protection Works', order: 5 },
  ],
  items: [
    { id: 'i1',  projectId: 'p1', partId: 'partA', no: 'A-1', description: 'Clearing & grubbing including uprooting of trees', unit: 'Ha',  boqQty: 12.50, rate: 18500, billedQty: 12.50 },
    { id: 'i2',  projectId: 'p1', partId: 'partA', no: 'A-2', description: 'Excavation in ordinary soil for roadway', unit: 'm³', boqQty: 48200, rate: 85, billedQty: 45840 },
    { id: 'i3',  projectId: 'p1', partId: 'partA', no: 'A-3', description: 'Embankment construction from borrowed earth', unit: 'm³', boqQty: 62400, rate: 120, billedQty: 58100 },
    { id: 'i4',  projectId: 'p1', partId: 'partB', no: 'B-1', description: 'Granular Sub Base (GSB) compacted t=200mm', unit: 'm³', boqQty: 8420, rate: 540, billedQty: 5980 },
    { id: 'i5',  projectId: 'p1', partId: 'partB', no: 'B-2', description: 'Wet Mix Macadam (WMM) t=250mm', unit: 'm³', boqQty: 6240, rate: 720, billedQty: 4428 },
    { id: 'i6',  projectId: 'p1', partId: 'partB', no: 'B-3', description: 'Shoulder construction with earthwork', unit: 'm³', boqQty: 2840, rate: 180, billedQty: 1420 },
    { id: 'i7',  projectId: 'p1', partId: 'partC', no: 'C-1', description: 'Dense Bituminous Macadam (DBM) t=50mm', unit: 'T', boqQty: 4820, rate: 6400, billedQty: 2314 },
    { id: 'i8',  projectId: 'p1', partId: 'partC', no: 'C-2', description: 'Bituminous Concrete (BC) t=40mm', unit: 'T', boqQty: 2840, rate: 7200, billedQty: 0 },
    { id: 'i9',  projectId: 'p1', partId: 'partD', no: 'D-1', description: 'RCC M20 for foundations & footings', unit: 'm³', boqQty: 284, rate: 9800, billedQty: 84 },
    { id: 'i10', projectId: 'p1', partId: 'partD', no: 'D-7', description: 'RCC M25 Box Culvert deck slab', unit: 'm³', boqQty: 84, rate: 12800, billedQty: 97.4 },
    { id: 'i11', projectId: 'p1', partId: 'partE', no: 'E-1', description: 'Rubble masonry retaining wall CM 1:6', unit: 'm³', boqQty: 640, rate: 2800, billedQty: 420 },
    { id: 'i12', projectId: 'p1', partId: 'partE', no: 'E-3', description: 'Catch water drain construction', unit: 'm', boqQty: 1200, rate: 840, billedQty: 1382 },
  ],
  // Get parts for active project only
  getPartsForProject: (projectId) => get().parts.filter(p => p.projectId === projectId),
  // Get items for active project only
  getItemsForProject: (projectId) => get().items.filter(i => i.projectId === projectId),
  addPart: (part, projectId) => set(s => ({ parts: [...s.parts, { ...part, id: Date.now().toString(), projectId }] })),
  addItem: (item, projectId) => set(s => ({ items: [...s.items, { ...item, id: Date.now().toString(), projectId }] })),
  updateItem: (id, data) => set(s => ({ items: s.items.map(i => i.id === id ? { ...i, ...data } : i) })),
  deleteItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
}), { name: 'cbs-boq' }))

// ── BILLING STORE ──
export const useBillingStore = create(persist((set, get) => ({
  bills: [
    { id: 'b1', projectId: 'p1', billNo: 7, type: 'RA', status: 'draft', date: '2025-01-14', amount: 3840000 },
    { id: 'b2', projectId: 'p1', billNo: 6, type: 'RA', status: 'passed', date: '2024-12-10', amount: 4120000 },
    { id: 'b3', projectId: 'p1', billNo: 5, type: 'RA', status: 'passed', date: '2024-11-08', amount: 3580000 },
  ],
  measurements: [],
  activeBillId: 'b1',
  // Get bills for active project only
  getBillsForProject: (projectId) => get().bills.filter(b => b.projectId === projectId),
  getActiveBill: () => get().bills.find(b => b.id === get().activeBillId),
  addBill: (bill, projectId) => set(s => ({ bills: [...s.bills, { ...bill, id: Date.now().toString(), projectId }] })),
  addMeasurement: (m) => set(s => ({ measurements: [...s.measurements, { ...m, id: Date.now().toString() }] })),
  deleteMeasurement: (id) => set(s => ({ measurements: s.measurements.filter(m => m.id !== id) })),
}), { name: 'cbs-billing' }))

// ── USERS STORE ──
export const useUsersStore = create(persist((set) => ({
  subUsers: [
    { id: 'u1', name: 'Raj Kumar',    role: 'Site Engineer', active: true,  assignedItems: ['i5','i4'], color: '#58a6ff' },
    { id: 'u2', name: 'Mohan Patil',  role: 'Billing Clerk', active: true,  assignedItems: ['i1','i2','i3'], color: '#3fb950' },
    { id: 'u3', name: 'Suresh Verma', role: 'Sub-Engineer',  active: false, assignedItems: ['i9','i10'], color: '#bc8cff' },
    { id: 'u4', name: 'Anita Sharma', role: 'Data Entry',    active: false, assignedItems: ['i11','i12'], color: '#f0a500' },
  ],
  toggleUser: (id) => set(s => ({ subUsers: s.subUsers.map(u => u.id === id ? { ...u, active: !u.active } : u) })),
  addUser: (u) => set(s => ({ subUsers: [...s.subUsers, { ...u, id: Date.now().toString() }] })),
}), { name: 'cbs-users' }))

// ── MATERIALS STORE ──
export const useMaterialsStore = create(persist((set) => ({
  cementEntries: [
    { id: 'c1', projectId: 'p1', week: 'Dec W4', item: 'PCC M15',    workQty: 142.5, norm: 6.0, actual: 872 },
    { id: 'c2', projectId: 'p1', week: 'Dec W3', item: 'RCC M25',    workQty: 84.2,  norm: 8.5, actual: 709 },
    { id: 'c3', projectId: 'p1', week: 'Dec W2', item: 'Brickwork',  workQty: 210.0, norm: 1.8, actual: 401 },
    { id: 'c4', projectId: 'p1', week: 'Dec W1', item: 'Plastering', workQty: 480.0, norm: 0.9, actual: 428 },
  ],
  receipts: [
    { id: 'r1', projectId: 'p1', receiptNo: 'MR-142', date: '2025-01-14', material: 'Cement OPC 53',  supplier: 'ACC Ltd.', qty: 200,  unit: 'T', rate: 380,   status: 'verified' },
    { id: 'r2', projectId: 'p1', receiptNo: 'MR-141', date: '2025-01-10', material: 'Steel TMT Fe500', supplier: 'SAIL',    qty: 18.4, unit: 'T', rate: 58500, status: 'verified' },
    { id: 'r3', projectId: 'p1', receiptNo: 'MR-140', date: '2025-01-08', material: 'Bitumen VG-30',  supplier: 'HPCL',    qty: 14.2, unit: 'T', rate: 52000, status: 'pending'  },
  ],
  // Get entries for active project only
  getEntriesForProject: (projectId) => get().cementEntries.filter(e => e.projectId === projectId),
  getReceiptsForProject: (projectId) => get().receipts.filter(r => r.projectId === projectId),
  addCementEntry: (e, projectId) => set(s => ({ cementEntries: [...s.cementEntries, { ...e, id: Date.now().toString(), projectId }] })),
  addReceipt: (r, projectId) => set(s => ({ receipts: [...s.receipts, { ...r, id: Date.now().toString(), projectId }] })),
}), { name: 'cbs-materials' }))
