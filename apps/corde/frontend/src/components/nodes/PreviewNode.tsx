import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

function PreviewNode({ data, isConnectable }: NodeProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(data.previewUrl || null)

  return (
    <div className="corde-node node-output">
      <div className="corde-node-header">
        <span className="text-corde-accent-warm">O</span>
        <span>Preview</span>
      </div>

      <div className="corde-node-body">
        <div
          className="w-40 h-40 bg-black/30 rounded flex items-center justify-center border border-corde-border"
        >
          {previewUrl ? (
            previewUrl.endsWith('.mp4') ? (
              <video
                src={previewUrl}
                controls
                className="max-w-full max-h-full rounded"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full rounded"
              />
            )
          ) : (
            <span className="text-xs text-corde-muted">
              Connect input to preview
            </span>
          )}
        </div>
      </div>

      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        style={{ background: '#ff6b35' }}
      />
    </div>
  )
}

export default memo(PreviewNode)
