'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const VRScene = dynamic(() => import('@/components/VRScene'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading VR Reader...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-screen w-full">
      <VRScene />
    </main>
  );
}
