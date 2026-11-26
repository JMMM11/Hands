"use client"

import { useEffect, useState } from "react"

type Side = "left" | "right"

interface Hand3DProps {
  // 0 = puño, 1-4 = índice..meñique levantados, 5 = mano abierta
  fingers: number
  side: Side
  color: string
  className?: string
}

const SIZE = 192
const cache = new Map<string, string>()
// Un solo renderer compartido: cada canvas WebGL cuenta contra el límite del navegador
let renderer: any = null

// Nudillo (x, y), largo de cada falange y grosor; orden índice..meñique
const FINGERS = [
  { x: -0.3, y: 0.5, lens: [0.42, 0.26, 0.2], r: 0.105 },
  { x: -0.09, y: 0.54, lens: [0.47, 0.29, 0.22], r: 0.11 },
  { x: 0.12, y: 0.51, lens: [0.44, 0.27, 0.2], r: 0.104 },
  { x: 0.31, y: 0.42, lens: [0.34, 0.21, 0.17], r: 0.092 },
]
const OPEN = [0.05, 0.05, 0.03]
const CURLED = [1.45, 1.6, 1.2]

function buildChain(THREE: any, parent: any, lens: number[], r: number, mat: any, curl: number[]) {
  let joint = parent
  lens.forEach((len, i) => {
    const g = new THREE.Group()
    if (i > 0) g.position.y = lens[i - 1]
    g.rotation.x = curl[i]
    joint.add(g)
    const radius = r * (1 - i * 0.08)
    const bone = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.94, radius, len, 16), mat)
    bone.position.y = len / 2
    g.add(bone)
    g.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), mat))
    if (i === lens.length - 1) {
      const tip = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.94, 16, 12), mat)
      tip.position.y = len
      g.add(tip)
    }
    joint = g
  })
}

function renderHand(THREE: any, fingers: number, side: Side, color: string) {
  const key = `${fingers}-${side}-${color}`
  const hit = cache.get(key)
  if (hit) return hit

  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(1)
    renderer.setSize(SIZE, SIZE, false)
    renderer.outputEncoding = THREE.sRGBEncoding
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20)
  camera.position.set(0, 0.35, 4.3)
  camera.lookAt(0, 0.35, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  const key1 = new THREE.DirectionalLight(0xffffff, 0.9)
  key1.position.set(2, 3, 4)
  scene.add(key1)
  const rim = new THREE.DirectionalLight(new THREE.Color(color), 1.3)
  rim.position.set(-3, 1, -3)
  scene.add(rim)

  const skin = new THREE.MeshStandardMaterial({ color: 0xe9c9b3, roughness: 0.6 })
  const raised = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.25,
    roughness: 0.45,
  })

  const hand = new THREE.Group()
  // Palma hacia la cámara, vista en 3/4; la mano izquierda es el espejo de la derecha
  hand.rotation.set(-0.12, side === "right" ? 0.3 : -0.3, 0)
  if (side === "left") hand.scale.x = -1
  scene.add(hand)

  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), skin)
  palm.scale.set(0.86, 1, 0.34)
  palm.position.y = 0.08
  hand.add(palm)

  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.5, 24), skin)
  wrist.scale.z = 0.6
  wrist.position.y = -0.6
  hand.add(wrist)

  FINGERS.forEach((f, i) => {
    const up = fingers === 5 || i < fingers
    const base = new THREE.Group()
    base.position.set(f.x, f.y, 0)
    if (up) base.rotation.z = -f.x * 0.45
    hand.add(base)
    buildChain(THREE, base, f.lens, f.r, up ? raised : skin, up ? OPEN : CURLED)
  })

  // El pulgar solo se levanta con la mano abierta; si no, cruza sobre los dedos doblados
  const thumbUp = fingers === 5
  const thumb = new THREE.Group()
  thumb.position.set(-0.36, -0.12, 0.08)
  thumb.rotation.z = thumbUp ? 0.75 : -0.25
  hand.add(thumb)
  buildChain(THREE, thumb, [0.34, 0.27, 0.21], 0.1, thumbUp ? raised : skin, thumbUp ? [0.1, 0.1, 0.05] : [0.5, 0.6, 0.5])
  thumb.children[0]?.scale.setScalar(1.15)

  renderer.render(scene, camera)
  const url = renderer.domElement.toDataURL("image/png")

  scene.traverse((o: any) => o.geometry?.dispose())
  skin.dispose()
  raised.dispose()

  cache.set(key, url)
  return url
}

function describe(fingers: number, side: Side) {
  const hand = side === "left" ? "Mano izquierda" : "Mano derecha"
  if (fingers === 0) return `${hand}: puño cerrado`
  if (fingers === 5) return `${hand}: mano abierta`
  return `${hand}: ${fingers} ${fingers === 1 ? "dedo levantado" : "dedos levantados"}`
}

export function Hand3D({ fingers, side, color, className }: Hand3DProps) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let timer: number | undefined
    // Three.js llega por CDN desde page.tsx; esperar a que esté cargado
    const tryRender = () => {
      const THREE = (window as any).THREE
      if (!THREE) {
        timer = window.setTimeout(tryRender, 150)
        return
      }
      setSrc(renderHand(THREE, fingers, side, color))
    }
    tryRender()
    return () => window.clearTimeout(timer)
  }, [fingers, side, color])

  const label = describe(fingers, side)

  return src ? (
    <img src={src} alt={label} title={label} width={SIZE} height={SIZE} className={className} draggable={false} />
  ) : (
    <div role="img" aria-label={label} className={`${className ?? ""} animate-pulse rounded-full bg-white/5`} />
  )
}
