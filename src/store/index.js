import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { boqAPI, billsAPI, projectsAPI, materialsAPI, usersAPI } from '@/utils/api'

// ── AUTH STORE ───────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'quantix-auth' }
  )
)

// ── PROJECT STORE ────────────────────────────────────────
export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      fetchProjects: async () => {
        try {
          const data = await projectsAPI.list()
          set({ projects: data })
          if (!get().activeProjectId && data.length > 0) {
            set({ activeProjectId: data[0].id })
          }
        } catch (err) { console.error('Failed to fetch projects', err) }
      },
      getActiveProject: () => {
        const { projects, activeProjectId } = get()
        return projects.find(p => p.id === activeProjectId)
      },
      setActiveProject: (id) => set({ activeProjectId: id }),
      addProject: async (projectData) => {
        const newProject = await projectsAPI.create(projectData)
        set(s => ({ projects: [newProject, ...s.projects] }))
      },
    }),
    { name: 'quantix-projects' }
  )
)

// ── BOQ STORE ────────────────────────────────────────────
export const useBOQStore = create((set) => ({
  parts: [],
  items: [],
  loading: false,
  fetchBOQ: async (projectId) => {
    if (!projectId) return
    set({ loading: true })
    try {
      const partsData = await boqAPI.get(projectId)
      const parts = partsData.map(p => ({ id: p.id, name: p.name, description: p.description, order: p.sort_order }))
      const items = partsData.flatMap(p => p.items.map(i => ({
        id: i.id, partId: p.id, no: i.item_no, description: i.description,
        unit: i.unit, boqQty: i.boq_qty, rate: i.rate, billedQty: i.billed_qty
      })))
      set({ parts, items, loading: false })
    } catch (err) {
      console.error('Failed to fetch BOQ', err)
      set({ loading: false })
    }
  },
  addItem: (item) => set(s => ({ items: [...s.items, item] })),
  deleteItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
}))

// ── BILLING STORE ────────────────────────────────────────
export const useBillingStore = create((set, get) => ({
  bills: [],
  measurements: [],
  activeBillId: null,
  fetchBills: async (projectId) => {
    if (!projectId) return
    try {
      const data = await billsAPI.list(projectId)
      set({ bills: data })
      if (data.length > 0 && !get().activeBillId) {
        set({ activeBillId: data[0].id })
      }
    } catch (err) { console.error('Failed to fetch bills', err) }
  },
  fetchMeasurements: async (billId) => {
    if (!billId) return
    try {
      const data = await billsAPI.getMeasurements(billId)
      const formatted = data.map(m => ({
        id: m.id, billId: m.bill_id, itemId: m.item_id, partId: m.part_id,
        zone: m.zone, floor: m.floor_level, member: m.member, no: m.sequence_no,
        length: m.length, width: m.width, depth: m.depth, qty: m.qty, isGroup: m.is_group === 1
      }))
      set({ measurements: formatted })
    } catch (err) { console.error('Failed to fetch measurements', err) }
  },
  setActiveBillId: (id) => set({ activeBillId: id }),
}))

// ── MATERIALS & USERS ────────────────────────────────────
export const useMaterialsStore = create((set) => ({
  cementEntries: [],
  receipts: [],
}))

export const useUsersStore = create((set) => ({
  subUsers: [],
}))
