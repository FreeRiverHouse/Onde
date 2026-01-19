import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

function QualityNode({ data, isConnectable }: NodeProps) {
  const [checks, setChecks] = useState({
    antiSlop: data.antiSlop !== false,
    anatomy: data.anatomy !== false,
    styleConsistency: data.styleConsistency !== false,
    characterConsistency: data.characterConsistency || false,
  })

  const [threshold, setThreshold] = useState(data.threshold || 80)

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="corde-node node-quality">
      <div className="corde-node-header">
        <span className="text-purple-400">Q</span>
        <span>Quality Check</span>
      </div>

      <div className="corde-node-body space-y-3">
        <div className="space-y-2">
          <label className="corde-node-label">Checks Enabled</label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={checks.antiSlop}
              onChange={() => toggleCheck('antiSlop')}
              className="rounded"
            />
            Anti-Slop (text quality)
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={checks.anatomy}
              onChange={() => toggleCheck('anatomy')}
              className="rounded"
            />
            Anatomy Check (5 fingers, etc.)
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={checks.styleConsistency}
              onChange={() => toggleCheck('styleConsistency')}
              className="rounded"
            />
            Style Consistency (no Pixar)
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={checks.characterConsistency}
              onChange={() => toggleCheck('characterConsistency')}
              className="rounded"
            />
            Character Consistency
          </label>
        </div>

        <div>
          <label className="corde-node-label">Pass Threshold: {threshold}%</label>
          <input
            type="range"
            className="w-full"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            min={50}
            max={100}
          />
        </div>

        {/* Status indicator placeholder */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-corde-muted"></div>
          <span className="text-corde-muted">Waiting for input</span>
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="content"
        isConnectable={isConnectable}
        style={{ background: '#a855f7' }}
      />

      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="passed"
        isConnectable={isConnectable}
        style={{ top: '40%', background: '#10b981' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="failed"
        isConnectable={isConnectable}
        style={{ top: '60%', background: '#ef4444' }}
      />
    </div>
  )
}

export default memo(QualityNode)
