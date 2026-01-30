import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Download, Maximize2, X } from 'lucide-react'

interface PreviewData {
  previewUrl?: string
  status?: 'idle' | 'generating' | 'complete' | 'error'
  progress?: number
  filename?: string
}

function PreviewNode({ data, isConnectable }: NodeProps<PreviewData>) {
  const [fullscreen, setFullscreen] = useState(false)
  const previewUrl = data.previewUrl || null
  const status = data.status || 'idle'
  const progress = data.progress || 0

  const isVideo = previewUrl?.endsWith('.mp4') || previewUrl?.endsWith('.webm')

  const handleDownload = () => {
    if (previewUrl) {
      const a = document.createElement('a')
      a.href = previewUrl
      a.download = data.filename || 'output'
      a.click()
    }
  }

  return (
    <>
      <div className={`corde-node node-output ${status === 'generating' ? 'executing' : ''} ${status === 'complete' ? 'completed' : ''}`}>
        <div className="corde-node-header">
          <span className="text-corde-accent-warm">📷</span>
          <span>Preview</span>
          
          {/* Action buttons */}
          {previewUrl && (
            <div className="ml-auto flex gap-1">
              <button 
                onClick={() => setFullscreen(true)}
                className="p-1 hover:bg-corde-border rounded"
                title="Fullscreen"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button 
                onClick={handleDownload}
                className="p-1 hover:bg-corde-border rounded"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="corde-node-body">
          <div className="corde-node-preview">
            {status === 'generating' ? (
              <div className="text-center p-4">
                <div className="w-8 h-8 border-2 border-corde-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-corde-muted">Generating...</span>
                {progress > 0 && (
                  <div className="mt-2">
                    <div className="corde-node-progress">
                      <div 
                        className="corde-node-progress-bar animated"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-corde-muted">{progress}%</span>
                  </div>
                )}
              </div>
            ) : previewUrl ? (
              isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-contain rounded"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="corde-node-preview-placeholder">
                Connect input<br/>to preview
              </div>
            )}
          </div>

          {/* Filename */}
          {data.filename && (
            <div className="text-[10px] text-corde-muted mt-2 truncate">
              {data.filename}
            </div>
          )}
        </div>

        {/* Input handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="image"
          isConnectable={isConnectable}
          style={{ top: '40%', background: '#00bfff' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="video"
          isConnectable={isConnectable}
          style={{ top: '60%', background: '#ff6b35' }}
        />
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && previewUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={() => setFullscreen(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded"
            onClick={() => setFullscreen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          {isVideo ? (
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full"
              autoPlay
              muted
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}
    </>
  )
}

export default memo(PreviewNode)
