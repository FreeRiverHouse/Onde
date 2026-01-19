import { useCallback, useRef, useState, useEffect } from 'react'
import ReactFlow, {
  Controls,
  Background,
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

import Sidebar from './components/Sidebar'
import PromptNode from './components/nodes/PromptNode'
import SDXLNode from './components/nodes/SDXLNode'
import VideoNode from './components/nodes/VideoNode'
import PreviewNode from './components/nodes/PreviewNode'
import QualityNode from './components/nodes/QualityNode'
import { useCordeStore } from './store/cordeStore'

const nodeTypes = {
  prompt: PromptNode,
  sdxl: SDXLNode,
  video: VideoNode,
  preview: PreviewNode,
  quality: QualityNode,
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

  const { isExecuting, executeWorkflow, setWorkflow } = useCordeStore()

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
          </div>

          <div className="flex items-center gap-2">
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
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3a" />
          </ReactFlow>
        </div>
      </div>
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
