import { useCallback, useRef, useState, useEffect } from 'react'
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Settings, Undo2, Redo2, Trash2, Copy, Clipboard } from 'lucide-react'

import Sidebar from './components/Sidebar'
import SettingsPanel from './components/SettingsPanel'
import PromptNode from './components/nodes/PromptNode'
import SDXLNode from './components/nodes/SDXLNode'
import VideoNode from './components/nodes/VideoNode'
import PreviewNode from './components/nodes/PreviewNode'
import QualityNode from './components/nodes/QualityNode'
import ModelLoaderNode from './components/nodes/ModelLoaderNode'
import { useCordeStore } from './store/cordeStore'

const nodeTypes = {
  prompt: PromptNode,
  sdxl: SDXLNode,
  video: VideoNode,
  preview: PreviewNode,
  quality: QualityNode,
  modelLoader: ModelLoaderNode,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

let id = 0
const getId = () => `node_${id++}`

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [clipboard, setClipboard] = useState<Node[]>([])
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const { isExecuting, executeWorkflow, setWorkflow, currentJob } = useCordeStore()

  // Sync with store
  useEffect(() => {
    setWorkflow(nodes, edges)
  }, [nodes, edges, setWorkflow])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const handleExecute = async () => {
    const workflow = {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        data: n.data,
      })),
      edges: edges.map(e => ({
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
    }
    await executeWorkflow(workflow)
  }

  const handleSave = () => {
    const workflow = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `corde-workflow-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const workflow = JSON.parse(text)
      setNodes(workflow.nodes || [])
      setEdges(workflow.edges || [])
    }
    input.click()
  }

  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ nodes: [...nodes], edges: [...edges] })
    // Keep only last 50 states
    if (newHistory.length > 50) newHistory.shift()
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [nodes, edges, history, historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex, setNodes, setEdges])

  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected)
    if (selectedNodes.length > 0) {
      setClipboard(selectedNodes)
    }
  }, [nodes])

  const handlePaste = useCallback(() => {
    if (clipboard.length > 0) {
      const newNodes = clipboard.map((n) => ({
        ...n,
        id: getId(),
        position: { x: n.position.x + 50, y: n.position.y + 50 },
        selected: true,
      }))
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(newNodes))
      saveToHistory()
    }
  }, [clipboard, setNodes, saveToHistory])

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected))
    setEdges((eds) => eds.filter((e) => !e.selected))
    saveToHistory()
  }, [setNodes, setEdges, saveToHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) handleRedo()
            else handleUndo()
            e.preventDefault()
            break
          case 'c':
            handleCopy()
            e.preventDefault()
            break
          case 'v':
            handlePaste()
            e.preventDefault()
            break
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, handleCopy, handlePaste, handleDelete])

  return (
    <div className="flex h-screen bg-corde-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 bg-corde-surface border-b border-corde-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-corde-accent">CORDE</h1>
            <span className="text-corde-muted text-sm">Content Orchestration</span>
            
            {/* Execution Progress */}
            {isExecuting && currentJob && (
              <div className="flex items-center gap-2 ml-4">
                <div className="w-32 h-2 bg-corde-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-corde-accent to-cyan-400 transition-all duration-300"
                    style={{ width: `${currentJob.progress}%` }}
                  />
                </div>
                <span className="text-xs text-corde-muted">{currentJob.progress}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Undo/Redo */}
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-corde-border rounded transition-colors disabled:opacity-30"
              title="Undo (⌘Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-corde-border rounded transition-colors disabled:opacity-30"
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-corde-border mx-1" />

            {/* Copy/Paste/Delete */}
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-corde-border rounded transition-colors"
              title="Copy (⌘C)"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handlePaste}
              disabled={clipboard.length === 0}
              className="p-2 hover:bg-corde-border rounded transition-colors disabled:opacity-30"
              title="Paste (⌘V)"
            >
              <Clipboard className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-corde-border rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-corde-border mx-1" />

            {/* File Operations */}
            <button
              onClick={handleLoad}
              className="px-3 py-1.5 text-sm bg-corde-border hover:bg-corde-muted/30 rounded transition-colors"
            >
              Load
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-corde-border hover:bg-corde-muted/30 rounded transition-colors"
            >
              Save
            </button>

            <div className="w-px h-6 bg-corde-border mx-1" />

            {/* Execute */}
            <button
              onClick={handleExecute}
              disabled={isExecuting || nodes.length === 0}
              className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
                isExecuting || nodes.length === 0
                  ? 'bg-corde-border text-corde-muted cursor-not-allowed'
                  : 'bg-corde-accent text-black hover:bg-corde-accent/80'
              }`}
            >
              {isExecuting ? 'Executing...' : 'Execute'}
            </button>

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`p-2 rounded transition-colors ${settingsOpen ? 'bg-corde-accent text-black' : 'hover:bg-corde-border'}`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'prompt': return '#10b981'
                  case 'sdxl': return '#00bfff'
                  case 'video': return '#00bfff'
                  case 'preview': return '#ff6b35'
                  case 'quality': return '#a855f7'
                  case 'modelLoader': return '#f59e0b'
                  default: return '#2a2a3a'
                }
              }}
              style={{ 
                backgroundColor: '#1a1a24',
                border: '1px solid #2a2a3a',
                borderRadius: '8px',
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3a" />
          </ReactFlow>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
