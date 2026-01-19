import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

function VideoNode({ data, isConnectable }: NodeProps) {
  const [model, setModel] = useState(data.model || 'svd')
  const [fps, setFps] = useState(data.fps || 8)
  const [frames, setFrames] = useState(data.frames || 25)
  const [motionBucket, setMotionBucket] = useState(data.motionBucket || 127)

  return (
    <div className="corde-node node-process">
      <div className="corde-node-header">
        <span className="text-corde-accent">V</span>
        <span>Video Generate</span>
      </div>

      <div className="corde-node-body space-y-3">
        <div>
          <label className="corde-node-label">Model</label>
          <select
            className="corde-node-input"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="svd">SVD (Stable Video Diffusion)</option>
            <option value="ltx">LTX-Video 2</option>
            <option value="animate">AnimateDiff</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="corde-node-label">FPS</label>
            <input
              type="number"
              className="corde-node-input"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              min={1}
              max={30}
            />
          </div>
          <div>
            <label className="corde-node-label">Frames</label>
            <input
              type="number"
              className="corde-node-input"
              value={frames}
              onChange={(e) => setFrames(parseInt(e.target.value))}
              min={8}
              max={100}
            />
          </div>
        </div>

        <div>
          <label className="corde-node-label">Motion Bucket (1-255)</label>
          <input
            type="range"
            className="w-full"
            value={motionBucket}
            onChange={(e) => setMotionBucket(parseInt(e.target.value))}
            min={1}
            max={255}
          />
          <div className="text-xs text-corde-muted text-right">{motionBucket}</div>
        </div>
      </div>

      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="image"
        isConnectable={isConnectable}
        style={{ background: '#00bfff' }}
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="video"
        isConnectable={isConnectable}
        style={{ background: '#ff6b35' }}
      />
    </div>
  )
}

export default memo(VideoNode)
