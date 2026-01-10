'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

export default function VRPage() {
  const [aframeLoaded, setAframeLoaded] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aframeLoaded && sceneRef.current && typeof window !== 'undefined') {
      // A-Frame is loaded, create the scene
      const scene = document.createElement('a-scene')
      scene.setAttribute('embedded', '')
      scene.setAttribute('vr-mode-ui', 'enabled: true')
      scene.style.width = '100%'
      scene.style.height = '100vh'

      // Sky with gradient
      const sky = document.createElement('a-sky')
      sky.setAttribute('color', '#87CEEB')
      sky.setAttribute('src', '')
      scene.appendChild(sky)

      // Ocean floor
      const ocean = document.createElement('a-plane')
      ocean.setAttribute('position', '0 0 0')
      ocean.setAttribute('rotation', '-90 0 0')
      ocean.setAttribute('width', '100')
      ocean.setAttribute('height', '100')
      ocean.setAttribute('color', '#1a5f7a')
      ocean.setAttribute('opacity', '0.8')
      scene.appendChild(ocean)

      // Onde Logo - Central floating panel
      const logoPanel = document.createElement('a-plane')
      logoPanel.setAttribute('position', '0 2 -4')
      logoPanel.setAttribute('width', '3')
      logoPanel.setAttribute('height', '1.5')
      logoPanel.setAttribute('color', '#fff')
      logoPanel.setAttribute('opacity', '0.9')
      logoPanel.setAttribute('class', 'clickable')
      scene.appendChild(logoPanel)

      // Title text
      const title = document.createElement('a-text')
      title.setAttribute('value', 'ONDE')
      title.setAttribute('position', '0 2.5 -3.9')
      title.setAttribute('align', 'center')
      title.setAttribute('color', '#1a365d')
      title.setAttribute('width', '6')
      title.setAttribute('font', 'mozillavr')
      scene.appendChild(title)

      const subtitle = document.createElement('a-text')
      subtitle.setAttribute('value', 'Benvenuto nel Portale VR')
      subtitle.setAttribute('position', '0 1.8 -3.9')
      subtitle.setAttribute('align', 'center')
      subtitle.setAttribute('color', '#4a5568')
      subtitle.setAttribute('width', '4')
      scene.appendChild(subtitle)

      // Navigation panels - Libri
      const libriPanel = document.createElement('a-box')
      libriPanel.setAttribute('position', '-2.5 1.5 -5')
      libriPanel.setAttribute('width', '1.5')
      libriPanel.setAttribute('height', '1.5')
      libriPanel.setAttribute('depth', '0.1')
      libriPanel.setAttribute('color', '#ed8936')
      libriPanel.setAttribute('class', 'clickable')
      libriPanel.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear')
      scene.appendChild(libriPanel)

      const libriText = document.createElement('a-text')
      libriText.setAttribute('value', '📚 LIBRI')
      libriText.setAttribute('position', '-2.5 1.5 -4.85')
      libriText.setAttribute('align', 'center')
      libriText.setAttribute('color', '#fff')
      libriText.setAttribute('width', '3')
      scene.appendChild(libriText)

      // Navigation panels - Giochi
      const giochiPanel = document.createElement('a-box')
      giochiPanel.setAttribute('position', '0 1.5 -6')
      giochiPanel.setAttribute('width', '1.5')
      giochiPanel.setAttribute('height', '1.5')
      giochiPanel.setAttribute('depth', '0.1')
      giochiPanel.setAttribute('color', '#ecc94b')
      giochiPanel.setAttribute('class', 'clickable')
      giochiPanel.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 12000; easing: linear')
      scene.appendChild(giochiPanel)

      const giochiText = document.createElement('a-text')
      giochiText.setAttribute('value', '🎮 GIOCHI')
      giochiText.setAttribute('position', '0 1.5 -5.85')
      giochiText.setAttribute('align', 'center')
      giochiText.setAttribute('color', '#1a365d')
      giochiText.setAttribute('width', '3')
      scene.appendChild(giochiText)

      // Navigation panels - App
      const appPanel = document.createElement('a-box')
      appPanel.setAttribute('position', '2.5 1.5 -5')
      appPanel.setAttribute('width', '1.5')
      appPanel.setAttribute('height', '1.5')
      appPanel.setAttribute('depth', '0.1')
      appPanel.setAttribute('color', '#38b2ac')
      appPanel.setAttribute('class', 'clickable')
      appPanel.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear')
      scene.appendChild(appPanel)

      const appText = document.createElement('a-text')
      appText.setAttribute('value', '📱 APP')
      appText.setAttribute('position', '2.5 1.5 -4.85')
      appText.setAttribute('align', 'center')
      appText.setAttribute('color', '#fff')
      appText.setAttribute('width', '3')
      scene.appendChild(appText)

      // Floating particles (waves effect)
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('a-sphere')
        const x = (Math.random() - 0.5) * 20
        const y = Math.random() * 3 + 0.5
        const z = (Math.random() - 0.5) * 20 - 5
        particle.setAttribute('position', `${x} ${y} ${z}`)
        particle.setAttribute('radius', '0.1')
        particle.setAttribute('color', '#ed8936')
        particle.setAttribute('opacity', '0.6')
        particle.setAttribute('animation', `property: position; to: ${x} ${y + 1} ${z}; dir: alternate; loop: true; dur: ${2000 + Math.random() * 2000}; easing: easeInOutSine`)
        scene.appendChild(particle)
      }

      // Camera with cursor for interaction
      const camera = document.createElement('a-camera')
      camera.setAttribute('position', '0 1.6 0')

      const cursor = document.createElement('a-cursor')
      cursor.setAttribute('color', '#ed8936')
      cursor.setAttribute('fuse', 'true')
      cursor.setAttribute('fuse-timeout', '1500')
      camera.appendChild(cursor)

      scene.appendChild(camera)

      // Clear and add scene
      if (sceneRef.current) {
        sceneRef.current.innerHTML = ''
        sceneRef.current.appendChild(scene)
      }
    }
  }, [aframeLoaded])

  return (
    <>
      <Script
        src="https://aframe.io/releases/1.5.0/aframe.min.js"
        onLoad={() => setAframeLoaded(true)}
      />

      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-900">
        {/* Header for non-VR view */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm p-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-900">ONDE</a>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">
              🥽 Apri con Oculus Browser per VR immersivo
            </span>
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Versione Desktop
            </a>
          </div>
        </div>

        {/* A-Frame Scene Container */}
        <div
          ref={sceneRef}
          className="pt-16"
          style={{ height: 'calc(100vh - 64px)' }}
        >
          {!aframeLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-xl">Caricamento esperienza VR...</p>
                <p className="text-sm opacity-70 mt-2">onde.la/vr</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
