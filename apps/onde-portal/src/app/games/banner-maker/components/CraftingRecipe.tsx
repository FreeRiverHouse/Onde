'use client';

import { MC_COLORS, PATTERNS } from './BannerCanvas';

interface BannerLayer {
  pattern: string;
  color: string;
}

interface CraftingRecipeProps {
  baseColor: string;
  layers: BannerLayer[];
}

function colorLabel(color: string): string {
  return color.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CraftingRecipe({ baseColor, layers }: CraftingRecipeProps) {
  // Generate the /give command
  const generateCommand = () => {
    if (layers.length === 0) {
      return `/give @p ${baseColor}_banner 1`;
    }
    const patternTags = layers
      .map((l) => `{pattern:"${l.pattern}",color:"${l.color}"}`)
      .join(',');
    return `/give @p ${baseColor}_banner{BlockEntityTag:{Patterns:[${patternTags}]}} 1`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        📋 Crafting Steps
      </h3>

      {/* Base banner */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">1️⃣</span>
          <div>
            <p className="font-semibold text-sm">Base Banner</p>
            <p className="text-xs text-gray-500">
              6×{' '}
              <span
                className="inline-block w-3 h-3 rounded-sm border border-gray-300 align-middle"
                style={{ backgroundColor: MC_COLORS[baseColor] }}
              />{' '}
              {colorLabel(baseColor)} Wool + 1× Stick
            </p>
          </div>
        </div>
      </div>

      {/* Pattern layers */}
      {layers.map((layer, i) => {
        const patternDef = PATTERNS[layer.pattern];
        return (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{String.fromCodePoint(0x31 + i + 1, 0xfe0f, 0x20e3)}</span>
              <div>
                <p className="font-semibold text-sm">
                  {patternDef?.icon} {patternDef?.name || layer.pattern}
                </p>
                <p className="text-xs text-gray-500">
                  Banner +{' '}
                  <span
                    className="inline-block w-3 h-3 rounded-sm border border-gray-300 align-middle"
                    style={{ backgroundColor: MC_COLORS[layer.color] }}
                  />{' '}
                  {colorLabel(layer.color)} Dye
                  {['creeper', 'skull', 'flower', 'mojang', 'globe', 'piglin'].includes(layer.pattern)
                    ? ' + Special Pattern Item'
                    : ' in Loom'}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Command */}
      <div className="bg-gray-900 rounded-xl p-3 shadow-sm">
        <p className="text-xs text-gray-400 mb-1">Java Edition Command:</p>
        <code className="text-xs text-green-400 break-all select-all">{generateCommand()}</code>
      </div>

      {/* Layer count */}
      <p className="text-xs text-gray-400 text-center">
        {layers.length}/6 layers used {layers.length >= 6 && '(max!)'}
      </p>
    </div>
  );
}
