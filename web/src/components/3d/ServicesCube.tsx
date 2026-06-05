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

const FACE_TARGET_ROTATIONS: [number, number][] = [
  [0,             -Math.PI / 2],
  [0,              Math.PI / 2],
  [ Math.PI / 2,  0           ],
  [-Math.PI / 2,  0           ],
  [0,             0           ],
  [0,              Math.PI    ],
]

// ── Canvas helpers ────────────────────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawFaceCanvas(
  canvas: HTMLCanvasElement,
  title: string,
  image: HTMLImageElement | null,
  isHovered: boolean,
  isActive: boolean,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = 512, H = 512

  ctx.fillStyle = '#0d1f3c'
  ctx.fillRect(0, 0, W, H)

  if (image && image.complete && image.naturalWidth > 0) {
    try { ctx.drawImage(image, 0, 0, W, H) } catch { /* skip */ }
    ctx.fillStyle = isHovered ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.50)'
    ctx.fillRect(0, 0, W, H)
  }

  if (isHovered) {
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 200)
    grd.addColorStop(0,    'rgba(138,154,134,0.50)')
    grd.addColorStop(0.40, 'rgba(138,154,134,0.20)')
    grd.addColorStop(1,    'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)
  }

  if (isActive) {
    ctx.strokeStyle = '#8A9A86'
    ctx.lineWidth = 12
    ctx.strokeRect(10, 10, W - 20, H - 20)
    ctx.strokeStyle = 'rgba(138,154,134,0.4)'
    ctx.lineWidth = 6
    ctx.strokeRect(20, 20, W - 40, H - 40)
  }

  const fadeGrd = ctx.createLinearGradient(0, H * 0.52, 0, H)
  fadeGrd.addColorStop(0, 'rgba(0,0,0,0)')
  fadeGrd.addColorStop(1, 'rgba(0,0,0,0.88)')
  ctx.fillStyle = fadeGrd
  ctx.fillRect(0, 0, W, H)

  ctx.font = '300 26px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255,255,255,0.92)'
  const lines = wrapText(ctx, title, W - 56)
  const lineH = 34
  lines.forEach((line, idx) => {
    const y = H - 30 - (lines.length - 1 - idx) * lineH
    ctx.fillText(line, W / 2, y)
  })

  ctx.fillStyle = isHovered ? '#a8b8a4' : '#8A9A86'
  ctx.fillRect(28, H - 10, W - 56, 4)
}

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
  const cubeGroupRef  = useRef<THREE.Group>(null)
  const controlsRef   = useRef<OrbitControlsImpl>(null)
  const faceRefs      = useRef<(THREE.Mesh | null)[]>(Array(6).fill(null))
  const faceMats      = useRef<(THREE.MeshStandardMaterial | null)[]>(Array(6).fill(null))
  const faceCanvases  = useRef<(HTMLCanvasElement | null)[]>(Array(6).fill(null))
  const faceTextures  = useRef<(THREE.CanvasTexture | null)[]>(Array(6).fill(null))
  const loadedImages  = useRef<(HTMLImageElement | null)[]>(Array(6).fill(null))
  const wireMatRef    = useRef<THREE.LineBasicMaterial>(null)
  const hoveredFace   = useRef(-1)
  const prevHovered   = useRef(-2)
  const prevActive    = useRef(-2)
  const idleTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialized   = useRef(false)
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

  // Build canvas textures once after mount
  useEffect(() => {
    services.forEach((svc, i) => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      faceCanvases.current[i] = canvas
      drawFaceCanvas(canvas, svc.title, null, false, i === activeIndex)
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      faceTextures.current[i] = tex
      const mat = faceMats.current[i]
      if (mat) {
        mat.map = tex
        mat.color.setHex(0xffffff)
        mat.needsUpdate = true
      }
      const imgSrc = svc.featuredImageUrl ?? (svc.images.length > 0 ? svc.images[0] : null)
      if (imgSrc) {
        const img = new Image()
        img.onload = () => {
          loadedImages.current[i] = img
          const c = faceCanvases.current[i]
          if (!c) return
          drawFaceCanvas(c, svc.title, img, hoveredFace.current === i, i === activeIndex)
          const t = faceTextures.current[i]
          if (t) t.needsUpdate = true
        }
        img.onerror = () => {}
        img.src = imgSrc
      }
    })
    return () => { faceTextures.current.forEach(t => t?.dispose()) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      const target = i === hoveredFace.current ? 0.12 : 0
      mesh.position.z += (target - mesh.position.z) * 0.1
    })

    const h = hoveredFace.current
    if (h !== prevHovered.current || activeIndex !== prevActive.current) {
      const toRedraw = new Set<number>()
      if (h !== prevHovered.current) {
        if (h >= 0) toRedraw.add(h)
        if (prevHovered.current >= 0) toRedraw.add(prevHovered.current)
      }
      if (activeIndex !== prevActive.current) {
        toRedraw.add(activeIndex)
        if (prevActive.current >= 0) toRedraw.add(prevActive.current)
      }
      toRedraw.forEach(idx => {
        const canvas = faceCanvases.current[idx]
        const tex    = faceTextures.current[idx]
        const svc    = services[idx]
        if (!canvas || !tex || !svc) return
        drawFaceCanvas(canvas, svc.title, loadedImages.current[idx] ?? null, idx === h, idx === activeIndex)
        tex.needsUpdate = true
      })
      prevHovered.current = h
      prevActive.current  = activeIndex
    }

    if (hoverLightRef.current) {
      if (h >= 0 && FACE_CONFIG[h]) {
        const fp = FACE_CONFIG[h].pos
        hoverLightRef.current.position.set(fp[0] * 2.5, fp[1] * 2.5, fp[2] * 2.5)
        hoverLightRef.current.intensity = 1.5
      } else {
        hoverLightRef.current.intensity = 0
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" penumbra={0.5} castShadow={false} />
      <pointLight position={[-3, 2, 0]} intensity={0.6} color="#8A9A86" />
      <pointLight ref={hoverLightRef} color="#8A9A86" intensity={0} distance={8} decay={2} />

      <group ref={cubeGroupRef}>
        {/* Wireframe outline — shown during entrance animation */}
        <lineSegments>
          <edgesGeometry args={[boxGeo]} />
          <lineBasicMaterial ref={wireMatRef} color="#8A9A86" transparent opacity={0} />
        </lineSegments>

        {FACE_CONFIG.map((face, i) => (
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
        ))}
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
