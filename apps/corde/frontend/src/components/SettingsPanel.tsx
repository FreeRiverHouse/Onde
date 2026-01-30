import { useState, useEffect } from 'react'
import { Settings, X, Cpu, HardDrive, Zap, RefreshCw } from 'lucide-react'

interface SystemInfo {
  device: 'metal' | 'cuda' | 'amd' | 'cpu'
  deviceName: string
  totalMemory: number
  usedMemory: number
  modelsLoaded: string[]
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [cacheDir, setCacheDir] = useState('/Volumes/DATI-SSD/onde-ai/corde/cache')
  const [outputDir, setOutputDir] = useState('/Volumes/DATI-SSD/onde-ai/corde/outputs')
  const [autoSave, setAutoSave] = useState(true)
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:3700')

  const refreshSystemInfo = async () => {
    setLoading(true)
    try {
      // Simulated - in real app would call backend
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Detect device based on platform
      const isMac = navigator.userAgent.includes('Mac')
      
      setSystemInfo({
        device: isMac ? 'metal' : 'cpu',
        deviceName: isMac ? 'Apple M1' : 'CPU',
        totalMemory: 16384, // MB
        usedMemory: 4096,
        modelsLoaded: ['SDXL Base 1.0'],
      })
    } catch (error) {
      console.error('Failed to get system info:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      refreshSystemInfo()
    }
  }, [isOpen])

  const getDeviceIcon = () => {
    if (!systemInfo) return <Cpu className="w-5 h-5" />
    switch (systemInfo.device) {
      case 'metal': return <Zap className="w-5 h-5 text-purple-400" />
      case 'cuda': return <Zap className="w-5 h-5 text-green-400" />
      case 'amd': return <Zap className="w-5 h-5 text-red-400" />
      default: return <HardDrive className="w-5 h-5 text-gray-400" />
    }
  }

  const getDeviceBadgeClass = () => {
    if (!systemInfo) return 'device-badge cpu'
    switch (systemInfo.device) {
      case 'metal': return 'device-badge metal'
      case 'cuda': return 'device-badge cuda'
      case 'amd': return 'device-badge amd'
      default: return 'device-badge cpu'
    }
  }

  const memoryPercent = systemInfo 
    ? Math.round((systemInfo.usedMemory / systemInfo.totalMemory) * 100)
    : 0

  const getMemoryClass = () => {
    if (memoryPercent < 50) return 'low'
    if (memoryPercent < 80) return 'medium'
    return 'high'
  }

  return (
    <div className={`corde-settings-panel ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-corde-border">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-corde-accent" />
          <h2 className="font-bold">Settings</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-corde-border rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* System Info Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-corde-muted">
              System
            </h3>
            <button
              onClick={refreshSystemInfo}
              disabled={loading}
              className="p-1 hover:bg-corde-border rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {systemInfo ? (
            <div className="bg-corde-bg rounded-lg p-3 space-y-3">
              {/* Device */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDeviceIcon()}
                  <span className="text-sm">{systemInfo.deviceName}</span>
                </div>
                <span className={getDeviceBadgeClass()}>
                  {systemInfo.device.toUpperCase()}
                </span>
              </div>

              {/* Memory */}
              <div>
                <div className="flex justify-between text-xs text-corde-muted mb-1">
                  <span>Memory</span>
                  <span>
                    {(systemInfo.usedMemory / 1024).toFixed(1)}GB / {(systemInfo.totalMemory / 1024).toFixed(0)}GB
                  </span>
                </div>
                <div className="memory-bar">
                  <div 
                    className={`memory-bar-fill ${getMemoryClass()}`}
                    style={{ width: `${memoryPercent}%` }}
                  />
                </div>
              </div>

              {/* Loaded Models */}
              <div>
                <div className="text-xs text-corde-muted mb-1">Loaded Models</div>
                {systemInfo.modelsLoaded.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {systemInfo.modelsLoaded.map((model) => (
                      <span 
                        key={model}
                        className="px-2 py-0.5 text-xs bg-corde-border rounded"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-corde-muted">None</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-corde-bg rounded-lg p-4 text-center text-corde-muted text-sm">
              {loading ? 'Loading...' : 'Click refresh to load system info'}
            </div>
          )}
        </section>

        {/* Paths Section */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-corde-muted mb-3">
            Paths
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="corde-node-label">Model Cache</label>
              <input
                type="text"
                className="corde-node-input mt-1"
                value={cacheDir}
                onChange={(e) => setCacheDir(e.target.value)}
              />
            </div>
            
            <div>
              <label className="corde-node-label">Output Directory</label>
              <input
                type="text"
                className="corde-node-input mt-1"
                value={outputDir}
                onChange={(e) => setOutputDir(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* API Section */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-corde-muted mb-3">
            API
          </h3>
          
          <div>
            <label className="corde-node-label">Endpoint</label>
            <input
              type="text"
              className="corde-node-input mt-1"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
            />
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-corde-muted mb-3">
            Preferences
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Auto-save workflows</label>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          className="w-full py-2 bg-corde-accent text-black font-medium rounded hover:bg-corde-accent/80 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
