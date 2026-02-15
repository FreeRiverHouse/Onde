'use client'

/**
 * WatercolorBackground - Pure CSS ambient blobs (no JS resize listeners)
 * Uses CSS clamp() for responsive sizing instead of useState/useEffect
 */
export default function WatercolorBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        contain: 'strict',
        willChange: 'auto',
      }}
      aria-hidden="true"
    >
      {/* Ambient gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              rgba(253, 246, 227, 1) 0%,
              rgba(255, 255, 255, 0.9) 50%,
              rgba(253, 246, 227, 0.8) 100%
            )
          `,
        }}
      />

      {/* Static watercolor blobs - pure CSS, no JS resize */}
      <div className="absolute rounded-full" style={{ width: 'clamp(200px, 30vw, 400px)', height: 'clamp(200px, 30vw, 400px)', left: '5%', top: '10%', background: 'rgba(255, 127, 127, 0.35)', filter: 'blur(60px)', opacity: 0.4, transform: 'translate3d(0,0,0)' }} />
      <div className="absolute rounded-full" style={{ width: 'clamp(180px, 26vw, 350px)', height: 'clamp(180px, 26vw, 350px)', left: '70%', top: '60%', background: 'rgba(72, 201, 176, 0.3)', filter: 'blur(60px)', opacity: 0.4, transform: 'translate3d(0,0,0)' }} />
      <div className="absolute rounded-full" style={{ width: 'clamp(150px, 22vw, 300px)', height: 'clamp(150px, 22vw, 300px)', left: '50%', top: '30%', background: 'rgba(244, 208, 63, 0.3)', filter: 'blur(60px)', opacity: 0.4, transform: 'translate3d(0,0,0)' }} />
      <div className="absolute rounded-full" style={{ width: 'clamp(140px, 20vw, 280px)', height: 'clamp(140px, 20vw, 280px)', left: '75%', top: '10%', background: 'rgba(93, 173, 226, 0.25)', filter: 'blur(60px)', opacity: 0.4, transform: 'translate3d(0,0,0)' }} />
      <div className="absolute rounded-full" style={{ width: 'clamp(120px, 18vw, 250px)', height: 'clamp(120px, 18vw, 250px)', left: '20%', top: '70%', background: 'rgba(255, 127, 127, 0.35)', filter: 'blur(60px)', opacity: 0.4, transform: 'translate3d(0,0,0)' }} />
      <div className="absolute rounded-full" style={{ width: 'clamp(100px, 15vw, 200px)', height: 'clamp(100px, 15vw, 200px)', left: '10%', top: '50%', background: 'rgba(72, 201, 176, 0.3)', filter: 'blur(60px)', opacity: 0.4, transform: 'translate3d(0,0,0)' }} />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
