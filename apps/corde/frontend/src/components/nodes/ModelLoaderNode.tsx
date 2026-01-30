import { memo, useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Cpu, Zap, HardDrive } from 'lucide-react'

type DeviceType = 'auto' | 'metal' | 'cuda' | 'amd' | 'cpu'
type ModelType = 'sdxl' | 'flux' | 'sd15' | 'sd3' | 'kandinsky'

interface ModelInfo {
  name: string
  vram: string
  description: string
}

const MODELS: Record<ModelType, ModelInfo> = {
  sdxl: { name: 'SDXL 1.0', vram: '8GB+', description: 'Stable, well-documented' },
  flux: { name: 'Flux.1-dev', vram: '12GB+', description: 'Top tier quality 2024/2025' },
  sd15: { name: 'SD 1.5', vram: '4GB+', description: 'Fast, lower VRAM' },
  sd3: { name: 'SD 3', vram: '12GB+', description: 'Excellent text rendering' },
  kandinsky: { name: 'Kandinsky 3', vram: '8GB+', description: 'Open source Russian model' },
}

const DEVICES: { id: DeviceType; name: string; icon: typeof Cpu; available?: boolean }[] = [
  { id: 'auto', name: 'Auto Detect', icon: Zap },
  { id: 'metal', name: 'Apple Metal', icon: Cpu },
  { id: 'cuda', name: 'NVIDIA CUDA', icon: Cpu },
  { id: 'amd', name: 'AMD ROCm', icon: Cpu },
  { id: 'cpu', name: 'CPU Only', icon: HardDrive },
]

function ModelLoaderNode({ data, isConnectable }: NodeProps) {
  const [model, setModel] = useState<ModelType>(data.model || 'sdxl')
  const [device, setDevice] = useState<DeviceType>(data.device || 'auto')
  const [memoryUsage] = useState(45) // Simulated - would come from backend
  const [detectedDevice, setDetectedDevice] = useState<DeviceType | null>(null)

  // Simulate device detection
  useEffect(() => {
    // In real app, this would call the backend
    const detected = navigator.userAgent.includes('Mac') ? 'metal' : 'cpu'
    setDetectedDevice(detected as DeviceType)
  }, [])

  const getDeviceBadgeClass = (d: DeviceType) => {
    switch (d) {
      case 'metal': return 'device-badge metal'
      case 'cuda': return 'device-badge cuda'
      case 'amd': return 'device-badge amd'
      default: return 'device-badge cpu'
    }
  }

  const getMemoryClass = () => {
    if (memoryUsage < 50) return 'low'
    if (memoryUsage < 80) return 'medium'
    return 'high'
  }

  const activeDevice = device === 'auto' ? detectedDevice : device

  return (
    <div className="corde-node node-loader" style={{ minWidth: 240 }}>
      <div className="corde-node-header">
        <span className="text-amber-400">⚡</span>
        <span>Model Loader</span>
        {activeDevice && (
          <span className={getDeviceBadgeClass(activeDevice)} style={{ marginLeft: 'auto' }}>
            {activeDevice}
          </span>
        )}
      </div>

      <div className="corde-node-body space-y-3">
        {/* Model Selection */}
        <div>
          <label className="corde-node-label">Model</label>
          <select
            className="corde-node-input"
            value={model}
            onChange={(e) => setModel(e.target.value as ModelType)}
          >
            {Object.entries(MODELS).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name} ({info.vram})
              </option>
            ))}
          </select>
        </div>

        {/* Model Description */}
        <div className="text-[10px] text-corde-muted px-1">
          {MODELS[model].description}
        </div>

        {/* Device Selection */}
        <div>
          <label className="corde-node-label">Device</label>
          <select
            className="corde-node-input"
            value={device}
            onChange={(e) => setDevice(e.target.value as DeviceType)}
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.id === 'auto' && detectedDevice ? `(${detectedDevice})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="corde-node-label">VRAM Usage</label>
            <span className="text-[10px] text-corde-muted">{memoryUsage}%</span>
          </div>
          <div className="memory-bar">
            <div 
              className={`memory-bar-fill ${getMemoryClass()}`}
              style={{ width: `${memoryUsage}%` }}
            />
          </div>
        </div>

        {/* LoRA Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id={`lora-${data.id}`}
            className="rounded"
          />
          <label htmlFor={`lora-${data.id}`} className="text-xs text-corde-muted">
            Enable LoRA input
          </label>
        </div>
      </div>

      {/* Input handle for LoRA */}
      <Handle
        type="target"
        position={Position.Left}
        id="lora"
        isConnectable={isConnectable}
        style={{ top: '85%', background: '#a855f7' }}
      />

      {/* Output handle for model */}
      <Handle
        type="source"
        position={Position.Right}
        id="model"
        isConnectable={isConnectable}
        style={{ background: '#f59e0b' }}
      />
    </div>
  )
}

export default memo(ModelLoaderNode)
