import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import MiniPlayer from './MiniPlayer'
import { ParticleCanvas } from '@/components/effects/ParticleCanvas'
import { AuroraBackground, CRTOverlay } from '@/components/effects/AuroraBackground'

function Layout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden relative" style={{ background: '#07050a' }}>
      <AuroraBackground />
      <CRTOverlay />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          zIndex: 0,
        }}
      />

      <ParticleCanvas
        config={{
          enabled: true,
          neonIntensity: 40,
          colors: ['#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa'],
          connectionDistance: 110,
          maxParticles: 30,
          minParticles: 10,
          opacity: 0.25,
        }}
        enableMouseInteraction={false}
        style={{ pointerEvents: 'none', zIndex: 0 }}
      />

      <div className="relative flex flex-col h-full" style={{ zIndex: 2, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <Navigation />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        <MiniPlayer />
      </div>
    </div>
  )
}

export default Layout
