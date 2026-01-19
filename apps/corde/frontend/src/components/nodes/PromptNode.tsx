import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

function PromptNode({ data, isConnectable }: NodeProps) {
  const [prompt, setPrompt] = useState(data.prompt || '')
  const [negative, setNegative] = useState(data.negative || '')
  const [author, setAuthor] = useState(data.author || 'pina-pennello')

  return (
    <div className="corde-node node-input">
      <div className="corde-node-header">
        <span className="text-green-400">P</span>
        <span>Prompt</span>
      </div>

      <div className="corde-node-body space-y-3">
        <div>
          <label className="corde-node-label">Prompt</label>
          <textarea
            className="corde-node-input h-16 resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="European watercolor illustration..."
          />
        </div>

        <div>
          <label className="corde-node-label">Negative</label>
          <input
            className="corde-node-input"
            value={negative}
            onChange={(e) => setNegative(e.target.value)}
            placeholder="Pixar, 3D, cartoon..."
          />
        </div>

        <div>
          <label className="corde-node-label">Author Style</label>
          <select
            className="corde-node-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          >
            <option value="pina-pennello">Pina Pennello</option>
            <option value="magmatic">Magmatic</option>
            <option value="onde-futures">Onde Futures</option>
            <option value="onde-classics">Onde Classics</option>
            <option value="luzzati">Luzzati</option>
            <option value="kids">Kids</option>
          </select>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="prompt"
        isConnectable={isConnectable}
        style={{ background: '#10b981' }}
      />
    </div>
  )
}

export default memo(PromptNode)
