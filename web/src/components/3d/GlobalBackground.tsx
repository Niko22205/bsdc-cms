'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Particles() {
  const tiltGroupRef = useRef<THREE.Group>(null)
  const rotGroupRef  = useRef<THREE.Group>(null)
  const mouseX       = useRef(0)
  const mouseY       = useRef(0)
  const tiltX        = useRef(0)
  const tiltY        = useRef(0)
  const velocityScale = useRef(1)
  const boostTimer    = useRef(0)

  // 2000 random points uniformly distributed inside sphere r=50
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = Math.cbrt(Math.random()) * 50
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth)  * 2 - 1
      mouseY.current = (e.clientY / window.innerHeight) * 2 - 1
    }
    // Fired by goToScene on every scene change
    const onTransition = () => {
      velocityScale.current = 5
      boostTimer.current    = 0
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('bsdc:scene-transition', onTransition)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('bsdc:scene-transition', onTransition)
    }
  }, [])

  useFrame((_, delta) => {
    // Decay boost after 0.8s
    if (velocityScale.current > 1) {
      boostTimer.current += delta
      if (boostTimer.current >= 0.8) velocityScale.current = 1
    }

    // Continuous Y rotation (inner group)
    if (rotGroupRef.current) {
      rotGroupRef.current.rotation.y += 0.0005 * velocityScale.current
    }

    // Mouse tilt — max ±5°, lerp 0.02 (outer group)
    if (tiltGroupRef.current) {
      const maxTilt = 5 * (Math.PI / 180)
      tiltX.current += (-mouseY.current * maxTilt - tiltX.current) * 0.02
      tiltY.current += ( mouseX.current * maxTilt - tiltY.current) * 0.02
      tiltGroupRef.current.rotation.x = tiltX.current
      tiltGroupRef.current.rotation.y = tiltY.current
    }
  })

  return (
    <group ref={tiltGroupRef}>
      <group ref={rotGroupRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial color="#1a3a4a" size={0.08} sizeAttenuation />
        </points>
      </group>
    </group>
  )
}

export default function GlobalBackground() {
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
      camera={{ position: [0, 0, 70], fov: 75 }}
    >
      <Particles />
    </Canvas>
  )
}
