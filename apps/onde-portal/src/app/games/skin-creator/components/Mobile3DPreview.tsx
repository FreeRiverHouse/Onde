'use client';

import dynamic from 'next/dynamic';
import type { Pose } from './types';

const SkinPreview3D = dynamic(() => import('../../components/SkinPreview3D'), { ssr: false });

interface Mobile3DPreviewProps {
  show: boolean;
  onClose: () => void;
  skinCanvas: HTMLCanvasElement | null;
  skinVersion: number;
  selectedPose: string;
  setSelectedPose: (pose: string) => void;
  poses: Pose[];
}

export default function Mobile3DPreview({
  show, onClose, skinCanvas, skinVersion,
  selectedPose, setSelectedPose, poses,
}: Mobile3DPreviewProps) {
  if (!show) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[100] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20">
        <h2 className="text-xl font-bold text-white">🎮 3D Preview</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl"
        >
          ✕
        </button>
      </div>
      
      {/* 3D Preview */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 w-full max-w-sm aspect-square flex items-center justify-center">
          <SkinPreview3D skinCanvas={skinCanvas} textureVersion={skinVersion} />
        </div>
      </div>
      
      {/* Pose Selector */}
      <div className="p-4 bg-black/20">
        <p className="text-white/80 text-sm text-center mb-2">🕹️ Drag to rotate • Pinch to zoom</p>
        <div className="flex flex-wrap justify-center gap-2">
          {poses.map(pose => (
            <button
              key={pose.id}
              onClick={() => setSelectedPose(pose.id)}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedPose === pose.id
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {pose.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Back to Editor Button */}
      <div className="p-4 pb-8">
        <button
          onClick={onClose}
          className="w-full py-4 bg-white rounded-2xl font-bold text-lg text-purple-600 shadow-lg"
        >
          ✏️ Back to Editor
        </button>
      </div>
    </div>
  );
}
