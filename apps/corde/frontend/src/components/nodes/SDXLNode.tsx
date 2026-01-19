import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

function SDXLNode({ data, isConnectable }: NodeProps) {
  const [steps, setSteps] = useState(data.steps || 25)
  const [cfg, setCfg] = useState(data.cfg || 7.5)
  const [width, setWidth] = useState(data.width || 1024)
  const [height, setHeight] = useState(data.height || 1024)
  const [useIpAdapter, setUseIpAdapter] = useState(data.useIpAdapter || false)

  return (
    <div className="corde-node node-process">
      <div className="corde-node-header">
        <span className="text-corde-accent">S</span>
        <span>SDXL Generate</span>
      </div>

      <div className="corde-node-body space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="corde-node-label">Steps</label>
            <input
              type="number"
              className="corde-node-input"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              min={1}
              max={100}
            />
          </div>
          <div>
            <label className="corde-node-label">CFG</label>
            <input
              type="number"
              className="corde-node-input"
              value={cfg}
              onChange={(e) => setCfg(parseFloat(e.target.value))}
              min={1}
              max={20}
              step={0.5}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="corde-node-label">Width</label>
            <select
              className="corde-node-input"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
            >
              <option value={512}>512</option>
              <option value={768}>768</option>
              <option value={1024}>1024</option>
              <option value={1280}>1280</option>
            </select>
          </div>
          <div>
            <label className="corde-node-label">Height</label>
            <select
              className="corde-node-input"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
            >
              <option value={512}>512</option>
              <option value={768}>768</option>
              <option value={1024}>1024</option>
              <option value={1280}>1280</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ip-adapter"
            checked={useIpAdapter}
            onChange={(e) => setUseIpAdapter(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="ip-adapter" className="text-xs">
            Use IP-Adapter (character consistency)
          </label>
        </div>
      </div>

      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt"
        isConnectable={isConnectable}
        style={{ top: '30%', background: '#10b981' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="reference"
        isConnectable={isConnectable}
        style={{ top: '70%', background: '#a855f7' }}
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="image"
        isConnectable={isConnectable}
        style={{ background: '#00bfff' }}
      />
    </div>
  )
}

export default memo(SDXLNode)
