'use client'

import {
  forwardRef,
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Anchor, Waves, Ship, Wrench, HardHat, Zap } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { Service } from '@/generated/prisma/client'

// ── Constants ────────────────────────────────────────────────────────────────

const FACE_CONFIG: { pos: [number, number, number]; rot: [number, number, number] }[] = [
  { pos: [ 1.5,  0,    0   ], rot: [0,             Math.PI / 2, 0] }, // +X right
  { pos: [-1.5,  0,    0   ], rot: [0,            -Math.PI / 2, 0] }, // -X left
  { pos: [ 0,    1.5,  0   ], rot: [-Math.PI / 2,  0,           0] }, // +Y top
  { pos: [ 0,   -1.5,  0   ], rot: [ Math.PI / 2,  0,           0] }, // -Y bottom
  { pos: [ 0,    0,    1.5 ], rot: [0,              0,           0] }, // +Z front
  { pos: [ 0,    0,   -1.5 ], rot: [0,              Math.PI,     0] }, // -Z back
]

// target [rotX, rotY] to bring each face to face the camera (+Z)
const FACE_TARGET_ROTATIONS: [number, number][] = [
  [0,             -Math.PI / 2],
  [0,              Math.PI / 2],
  [ Math.PI / 2,  0           ],
  [-Math.PI / 2,  0           ],
  [0,             0           ],
  [0,              Math.PI    ],
]

type LucideIcon = React.ComponentType<LucideProps>
const DEFAULT_ICONS: LucideIcon[] = [Anchor, Waves, Ship, Wrench, HardHat, Zap]

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServicesCubeHandle {
  rotateTo: (faceIndex: number) => void
  startEntrance: () => void
}

interface ServicesCubeProps {
  services: Service[]
  onServiceSelect: (service: Service | null) => void
  activeIndex: number
}

interface CubeSceneHandle {
  rotateTo: (faceIndex: number) => void
  startEntrance: () => void
  zoomOut: () => void
}

interface CubeSceneProps {
  services: Service[]
  activeIndex: number
  onFaceClick: (index: number) => void
}

// ── CubeScene (R3F, inside Canvas) ───────────────────────────────────────────

const CubeScene = forwardRef<CubeSceneHandle, CubeSceneProps>(function CubeScene(
  { services, activeIndex, onFaceClick },
  ref,
) {
  const { camera } = useThree()
  const cubeGroupRef = useRef<THREE.Group>(null)
  const controlsRef  = useRef<OrbitControlsImpl>(null)
  const faceRefs     = useRef<(THREE.Mesh | null)[]>(Array(6).fill(null))
  const faceMats     = useRef<(THREE.MeshStandardMaterial | null)[]>(Array(6).fill(null))
  const wireMatRef   = useRef<THREE.LineBasicMaterial>(null)
  const hoveredFace  = useRef(-1)
  const idleTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialized  = useRef(false)

  const boxGeo = useMemo(() => new THREE.BoxGeometry(3, 3, 3), [])
  useEffect(() => { return () => boxGeo.dispose() }, [boxGeo])

  function resetIdleTimer() {
    if (controlsRef.current) controlsRef.current.autoRotate = false
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      if (controlsRef.current) controlsRef.current.autoRotate = true
    }, 6000)
  }

  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current) }, [])

  useImperativeHandle(ref, () => ({
    rotateTo(faceIndex: number) {
      if (!cubeGroupRef.current) return
      const [rx, ry] = FACE_TARGET_ROTATIONS[faceIndex] ?? [0, 0]
      resetIdleTimer()
      gsap.to(cubeGroupRef.current.rotation, {
        x: rx, y: ry, duration: 0.6, ease: 'power2.inOut',
      })
    },

    startEntrance() {
      const grp = cubeGroupRef.current
      if (!grp) return

      gsap.killTweensOf(grp.rotation)
      grp.rotation.x = Math.PI / 6
      grp.rotation.y = Math.PI / 4
      grp.scale.setScalar(0.3)
      if (wireMatRef.current) wireMatRef.current.opacity = 0

      const tl = gsap.timeline()
      if (wireMatRef.current) {
        tl.to(wireMatRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
      }
      tl.to(grp.scale, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'elastic.out(1,0.5)' }, 0)
    },

    zoomOut() {
      gsap.to(camera.position, {
        z: 8,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          if (controlsRef.current) controlsRef.current.update()
        },
      })
    },
  })) // eslint-disable-line react-hooks/exhaustive-deps

  // Per-frame: lerp face offsets + update material state imperatively
  useFrame(() => {
    if (!initialized.current && cubeGroupRef.current && controlsRef.current) {
      cubeGroupRef.current.rotation.x = Math.PI / 6
      cubeGroupRef.current.rotation.y = Math.PI / 4
      controlsRef.current.autoRotate = true
      controlsRef.current.autoRotateSpeed = 0.5
      initialized.current = true
    }

    faceRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const target = i === hoveredFace.current ? 0.15 : 0
      mesh.position.z += (target - mesh.position.z) * 0.1
    })

    faceMats.current.forEach((mat, i) => {
      if (!mat) return
      const isActive  = i === activeIndex
      const isHovered = i === hoveredFace.current
      if (isActive) {
        mat.color.setHex(0x0d1f3c)
        mat.emissive.setHex(0xB87333)
        mat.emissiveIntensity = 0.3
      } else if (isHovered) {
        mat.color.setHex(0x0d1f3c)
        mat.emissive.setHex(0xB87333)
        mat.emissiveIntensity = 0.1
      } else {
        mat.color.setHex(0x0a1628)
        mat.emissive.setHex(0x000000)
        mat.emissiveIntensity = 0
      }
    })
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight position={[0, 5, 5]} intensity={2} color="#ffffff" penumbra={0.5} castShadow={false} />
      <pointLight position={[-3, 2, 0]} intensity={0.8} color="#B87333" />

      <group ref={cubeGroupRef}>
        {/* Wireframe outline — shown during entrance animation */}
        <lineSegments>
          <edgesGeometry args={[boxGeo]} />
          <lineBasicMaterial ref={wireMatRef} color="#B87333" transparent opacity={0} />
        </lineSegments>

        {FACE_CONFIG.map((face, i) => {
          const service = services[i]
          const Icon    = DEFAULT_ICONS[i]
          return (
            <group key={i} position={face.pos} rotation={face.rot}>
              <mesh
                ref={el => { faceRefs.current[i] = el }}
                onPointerEnter={() => {
                  hoveredFace.current = i
                  resetIdleTimer()
                  document.body.style.cursor = 'crosshair'
                }}
                onPointerLeave={() => {
                  hoveredFace.current = -1
                  document.body.style.cursor = 'auto'
                }}
                onClick={() => {
                  resetIdleTimer()
                  gsap.to(camera.position, { z: 3, duration: 0.6, ease: 'power2.inOut' })
                  onFaceClick(i)
                }}
              >
                <planeGeometry args={[3, 3]} />
                <meshStandardMaterial
                  ref={el => { faceMats.current[i] = el }}
                  color="#0a1628"
                  side={THREE.DoubleSide}
                />
              </mesh>

              {service && (
                <Html center transform position={[0, 0, 0.05]} distanceFactor={6}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    <Icon size={18} color="#B87333" />
                    <p
                      style={{
                        fontSize: '10px',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        textAlign: 'center',
                        maxWidth: '80px',
                        lineHeight: '1.2',
                        margin: 0,
                      }}
                    >
                      {service.title}
                    </p>
                  </div>
                </Html>
              )}
            </group>
          )
        })}
      </group>

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        enableRotate
        onChange={resetIdleTimer}
      />
    </>
  )
})

// ── DetailOverlay ─────────────────────────────────────────────────────────────

function DetailOverlay({ service, onClose }: { service: Service; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = overlayRef.current
    if (el) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    const el = overlayRef.current
    if (el) {
      gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onClose })
    } else {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 bg-[#020617]/95 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-8 top-8 z-10 flex h-10 w-10 items-center justify-center text-white/60 transition-colors hover:text-white"
        aria-label="Затвори"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M15 5L5 15M5 5l10 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex h-full items-center gap-16 px-16 lg:px-24">
        {/* Image or gradient placeholder */}
        <div className="relative h-[60%] w-1/2 flex-shrink-0 overflow-hidden">
          {service.featuredImageUrl ? (
            <img
              src={service.featuredImageUrl}
              alt={service.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#B87333]/20" />
          )}
        </div>

        {/* Text content */}
        <div className="flex flex-col overflow-hidden">
          <h2 className="mb-6 text-4xl font-black text-white">{service.title}</h2>
          {service.content && (
            <div
              className="max-h-[40vh] overflow-y-auto text-slate-400"
              dangerouslySetInnerHTML={{ __html: service.content }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── ServicesCube (default export) ────────────────────────────────────────────

const ServicesCube = forwardRef<ServicesCubeHandle, ServicesCubeProps>(function ServicesCube(
  { services, onServiceSelect, activeIndex },
  ref,
) {
  const [activeService, setActiveService] = useState<Service | null>(null)
  const sceneRef = useRef<CubeSceneHandle>(null)

  useImperativeHandle(ref, () => ({
    rotateTo:      (i) => sceneRef.current?.rotateTo(i),
    startEntrance: ()  => sceneRef.current?.startEntrance(),
  }))

  function handleFaceClick(index: number) {
    const service = services[index]
    if (!service) return
    setActiveService(service)
    onServiceSelect(service)
  }

  function handleClose() {
    setActiveService(null)
    onServiceSelect(null)
    sceneRef.current?.zoomOut()
  }

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <CubeScene
          ref={sceneRef}
          services={services}
          activeIndex={activeIndex}
          onFaceClick={handleFaceClick}
        />
      </Canvas>

      {activeService && (
        <DetailOverlay service={activeService} onClose={handleClose} />
      )}
    </div>
  )
})

export default ServicesCube
