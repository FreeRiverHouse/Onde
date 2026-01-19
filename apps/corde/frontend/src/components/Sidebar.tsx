import { useEffect } from 'react'
import { useCordeStore } from '../store/cordeStore'

interface NodeItem {
  type: string
  label: string
  description: string
  category: 'input' | 'process' | 'output' | 'quality'
}

const NODE_CATALOG: NodeItem[] = [
  // Input Nodes
  { type: 'prompt', label: 'Prompt', description: 'Text input for generation', category: 'input' },

  // Process Nodes
  { type: 'sdxl', label: 'SDXL Generate', description: 'Generate image with SDXL', category: 'process' },
  { type: 'video', label: 'Video', description: 'Image to video (SVD/LTX)', category: 'process' },

  // Output Nodes
  { type: 'preview', label: 'Preview', description: 'Preview result', category: 'output' },

  // Quality Nodes
  { type: 'quality', label: 'Quality Check', description: 'Anti-slop & anatomy check', category: 'quality' },
]

const categoryColors = {
  input: 'border-green-500',
  process: 'border-corde-accent',
  output: 'border-corde-accent-warm',
  quality: 'border-purple-500',
}

const categoryLabels = {
  input: 'Input',
  process: 'Process',
  output: 'Output',
  quality: 'Quality',
}

function NodeItem({ item }: { item: NodeItem }) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className={`p-3 bg-corde-surface border-l-4 ${categoryColors[item.category]} rounded-r cursor-grab hover:bg-corde-border/50 transition-colors`}
      draggable
      onDragStart={(e) => onDragStart(e, item.type)}
    >
      <div className="font-medium text-sm">{item.label}</div>
      <div className="text-xs text-corde-muted mt-1">{item.description}</div>
    </div>
  )
}

export default function Sidebar() {
  const { templates, authors, loadConfig } = useCordeStore()

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Group nodes by category
  const groupedNodes = NODE_CATALOG.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = []
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, NodeItem[]>)

  return (
    <div className="w-64 bg-corde-surface border-r border-corde-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-corde-border">
        <h2 className="text-lg font-bold">Nodes</h2>
        <p className="text-xs text-corde-muted mt-1">Drag to canvas</p>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-corde-muted uppercase tracking-wider mb-2">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <NodeItem key={node.type} item={node} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Templates Section */}
      <div className="border-t border-corde-border p-3">
        <h3 className="text-xs font-semibold text-corde-muted uppercase tracking-wider mb-2">
          Templates
        </h3>
        <div className="space-y-1">
          {Object.entries(templates).map(([key, template]: [string, any]) => (
            <button
              key={key}
              className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-corde-border/50 transition-colors"
            >
              {template.name || key}
            </button>
          ))}
          {Object.keys(templates).length === 0 && (
            <p className="text-xs text-corde-muted">Loading...</p>
          )}
        </div>
      </div>

      {/* Authors Section */}
      <div className="border-t border-corde-border p-3">
        <h3 className="text-xs font-semibold text-corde-muted uppercase tracking-wider mb-2">
          Authors
        </h3>
        <div className="flex flex-wrap gap-1">
          {Object.entries(authors).map(([key, author]: [string, any]) => (
            <span
              key={key}
              className="px-2 py-0.5 text-xs rounded-full bg-corde-border text-corde-muted"
            >
              {author.name || key}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
