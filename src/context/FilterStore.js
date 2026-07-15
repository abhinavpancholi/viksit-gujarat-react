import { create } from 'zustand'

export const useFilterStore = create((set, get) => ({
  macroGoals: [],
  trendData: null,
  loading: true,
  error: null,

  // Filter States
  pillar: 'All',
  theme: 'All',
  status2030: 'All',
  status2047: 'All',
  searchQuery: '',

  // Initialize and Fetch Data
  initData: async () => {
    try {
      set({ loading: true })

      const [goalsRes, trendRes] = await Promise.all([
        fetch('/data/macroGoals.json'),
        fetch('/data/trendData.json')
      ])

      if (!goalsRes.ok || !trendRes.ok) {
        throw new Error('Failed to fetch dashboard data files.')
      }

      const macroGoals = await goalsRes.json()
      const trendData = await trendRes.json()

      set({ macroGoals, trendData, loading: false })
    } catch (err) {
      console.error(err)
      set({ error: err.message, loading: false })
    }
  },

  // Setters
  setPillar: (pillar) => {
    // When pillar changes, reset theme if the selected theme is not in the new pillar's themes
    const currentTheme = get().theme
    const goals = get().macroGoals

    let newTheme = currentTheme
    if (pillar !== 'All' && currentTheme !== 'All') {
      const themeBelongsToPillar = goals.some(g => g.pillar === pillar && g.theme === currentTheme)
      if (!themeBelongsToPillar) {
        newTheme = 'All'
      }
    }

    set({ pillar, theme: newTheme })
  },

  setTheme: (theme) => {
    // If a specific theme is selected, auto-select its pillar
    const goals = get().macroGoals
    let newPillar = get().pillar

    if (theme !== 'All') {
      const match = goals.find(g => g.theme === theme)
      if (match) {
        newPillar = match.pillar
      }
    }

    set({ theme, pillar: newPillar })
  },

  setStatus2030: (status2030) => set({ status2030 }),
  setStatus2047: (status2047) => set({ status2047 }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  resetFilters: () => set({
    pillar: 'All',
    theme: 'All',
    status2030: 'All',
    status2047: 'All',
    searchQuery: ''
  }),

  // Selectors/Getters
  getFilteredGoals: () => {
    const { macroGoals, pillar, theme, status2030, status2047, searchQuery } = get()

    return macroGoals.filter(goal => {
      const matchesPillar = pillar === 'All' || goal.pillar === pillar
      const matchesTheme = theme === 'All' || goal.theme === theme
      const matchesStatus2030 = status2030 === 'All' || goal.status2030 === status2030
      const matchesStatus2047 = status2047 === 'All' || goal.status2047 === status2047

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch = query === '' ||
        goal.macroGoal.toLowerCase().includes(query) ||
        goal.mgCode.toLowerCase().includes(query)

      return matchesPillar && matchesTheme && matchesStatus2030 && matchesStatus2047 && matchesSearch
    })
  },

  // Helper lists for dropdown selectors
  getPillars: () => {
    const goals = get().macroGoals
    const pillars = new Set(goals.map(g => g.pillar))
    return ['All', ...Array.from(pillars)]
  },

  getThemes: () => {
    const { macroGoals, pillar } = get()
    // If a pillar is selected, only show themes belonging to that pillar
    const filtered = pillar === 'All'
      ? macroGoals
      : macroGoals.filter(g => g.pillar === pillar)
    const themes = new Set(filtered.map(g => g.theme))
    return ['All', ...Array.from(themes)]
  },

  getStatuses2030: () => {
    const goals = get().macroGoals
    const statuses = new Set(goals.map(g => g.status2030))
    return ['All', ...Array.from(statuses)]
  },

  getStatuses2047: () => {
    const goals = get().macroGoals
    const statuses = new Set(goals.map(g => g.status2047))
    return ['All', ...Array.from(statuses)]
  }
}))
