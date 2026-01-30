import { create } from 'zustand'
import { Node, Edge } from 'reactflow'

interface Job {
  id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
}

interface CordeState {
  // Workflow state
  nodes: Node[]
  edges: Edge[]
  setWorkflow: (nodes: Node[], edges: Edge[]) => void

  // Execution state
  isExecuting: boolean
  currentJob: Job | null
  jobs: Job[]

  // Actions
  executeWorkflow: (workflow: any) => Promise<void>
  cancelExecution: () => void

  // Templates & Authors (loaded from API)
  templates: Record<string, any>
  authors: Record<string, any>
  loadConfig: () => Promise<void>
}

export const useCordeStore = create<CordeState>((set) => ({
  nodes: [],
  edges: [],
  setWorkflow: (nodes, edges) => set({ nodes, edges }),

  isExecuting: false,
  currentJob: null,
  jobs: [],

  templates: {},
  authors: {},

  executeWorkflow: async (workflow) => {
    set({ isExecuting: true })

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      })

      const { jobId } = await response.json()

      // Connect to WebSocket for progress updates
      const ws = new WebSocket(`ws://localhost:3700/ws?job=${jobId}`)

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'progress') {
          set({
            currentJob: {
              id: jobId,
              status: 'running',
              progress: data.progress,
            },
          })
        } else if (data.type === 'complete') {
          set({
            isExecuting: false,
            currentJob: {
              id: jobId,
              status: 'completed',
              progress: 100,
              result: data.result,
            },
          })
          ws.close()
        } else if (data.type === 'error') {
          set({
            isExecuting: false,
            currentJob: {
              id: jobId,
              status: 'failed',
              progress: 0,
              error: data.error,
            },
          })
          ws.close()
        }
      }

      ws.onerror = () => {
        set({ isExecuting: false })
        ws.close()
      }

    } catch (error) {
      console.error('Execution failed:', error)
      set({ isExecuting: false })
    }
  },

  cancelExecution: () => {
    set({ isExecuting: false, currentJob: null })
  },

  loadConfig: async () => {
    try {
      const [templatesRes, authorsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/authors'),
      ])

      const templates = await templatesRes.json()
      const authors = await authorsRes.json()

      set({ templates, authors })
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  },
}))
