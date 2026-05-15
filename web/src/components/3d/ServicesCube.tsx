'use client'

import {
  forwardRef,
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServicesCubeHandle {
  rotateTo: (faceIndex: number) => void
  startEntrance: () => void
  zoomOut: () => void
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
  const hoverLightRef = useRef<THREE.PointLight>(null)

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
        mat.emissiveIntensity = 0.8
      } else {
        mat.color.setHex(0x1a2744)
        mat.emissive.setHex(0x000000)
        mat.emissiveIntensity = 0
      }
    })

    if (hoverLightRef.current) {
      const h = hoveredFace.current
      if (h >= 0 && FACE_CONFIG[h]) {
        const fp = FACE_CONFIG[h].pos
        hoverLightRef.current.position.set(fp[0] * 2.5, fp[1] * 2.5, fp[2] * 2.5)
        hoverLightRef.current.intensity = 2.5
      } else {
        hoverLightRef.current.intensity = 0
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight position={[0, 5, 5]} intensity={2} color="#ffffff" penumbra={0.5} castShadow={false} />
      <pointLight position={[-3, 2, 0]} intensity={0.8} color="#B87333" />
      <pointLight ref={hoverLightRef} color="#B87333" intensity={0} distance={8} decay={2} />

      <group ref={cubeGroupRef}>
        {/* Wireframe outline — shown during entrance animation */}
        <lineSegments>
          <edgesGeometry args={[boxGeo]} />
          <lineBasicMaterial ref={wireMatRef} color="#B87333" transparent opacity={0} />
        </lineSegments>

        {FACE_CONFIG.map((face, i) => {
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
                onPointerDown={(event) => {
                  event.stopPropagation()
                  resetIdleTimer()
                  gsap.to(camera.position, { z: 3, duration: 0.6, ease: 'power2.inOut' })
                  onFaceClick(i)
                }}
              >
                <planeGeometry args={[3, 3]} />
                <meshStandardMaterial
                  ref={el => { faceMats.current[i] = el }}
                  color="#1a2744"
                />
              </mesh>
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

// ── ServicesCube (default export) ────────────────────────────────────────────

const ServicesCube = forwardRef<ServicesCubeHandle, ServicesCubeProps>(function ServicesCube(
  { services, onServiceSelect, activeIndex },
  ref,
) {
  const sceneRef = useRef<CubeSceneHandle>(null)

  useImperativeHandle(ref, () => ({
    rotateTo:      (i) => sceneRef.current?.rotateTo(i),
    startEntrance: ()  => sceneRef.current?.startEntrance(),
    zoomOut:       ()  => sceneRef.current?.zoomOut(),
  }))

  function handleFaceClick(index: number) {
    const service = services[index]
    if (!service) return
    onServiceSelect(service)
  }

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ preserveDrawingBuffer: true }} style={{ background: '#020617' }}>
        <CubeScene
          ref={sceneRef}
          services={services}
          activeIndex={activeIndex}
          onFaceClick={handleFaceClick}
        />
      </Canvas>
    </div>
  )
})

export default ServicesCube
