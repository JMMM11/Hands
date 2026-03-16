"use client"

import { useEffect, useRef, useState } from "react"
import { GestureGuide } from "@/components/gesture-guide"

declare global {
  interface Window {
    Hands: any
    Camera: any
    THREE: any
  }
}

interface HandResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>
  multiHandedness?: Array<{ label: string }>
}

export default function HandGestureVisualizer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState({ text: "Cargando...", color: "#ffffff" })
  const [isLoading, setIsLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(true)
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)

  useEffect(() => {
    let scene: any,
      camera: any,
      renderer: any,
      particleSystem: any
    let targetPositions: number[] = []
    const PARTICLE_COUNT = 18000
    let sphereMode = "none"
    let heartMode = false
    let explosionMode = false
    let currentTextIndex = -1
    let currentTextColor = { r: 1, g: 1, b: 1 }

    let sphereTargets: Float32Array
    let heartTargets: Float32Array

    const vHandL = { x: 0, y: 0, z: 0 }
    const vHandR = { x: 0, y: 0, z: 0 }
    const messages = ["HOLA", "BIENVENIDO", "GRACIAS", "INCREÍBLE", "BRAVO"]

    const loadScripts = async () => {
      const scripts = [
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
      ]

      for (const src of scripts) {
        await new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve()
            return
          }
          const script = document.createElement("script")
          script.src = src
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
    }

    const generateRandomNeonColor = () => {
      const hue = Math.random()
      const THREE = window.THREE
      const color = new THREE.Color()
      color.setHSL(hue, 1.0, 0.6)
      return { r: color.r, g: color.g, b: color.b }
    }

    const createTextTarget = (text: string) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      canvas.width = 2048
      canvas.height = 512
      currentTextColor = generateRandomNeonColor()

      ctx.fillStyle = "white"
      ctx.font = "bold 140px Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, 1024, 256)

      const data = ctx.getImageData(0, 0, 2048, 512).data
      const pts: { x: number; y: number }[] = []
      for (let y = 0; y < 512; y += 4) {
        for (let x = 0; x < 2048; x += 4) {
          if (data[(y * 2048 + x) * 4 + 3] > 128) {
            pts.push({ x: (x - 1024) * 0.012, y: -(y - 256) * 0.012 })
          }
        }
      }
      targetPositions = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = pts[i % pts.length]
        targetPositions.push(p.x, p.y, (Math.random() - 0.5) * 0.5)
      }
    }

    const countFingers = (landmarks: Array<{ x: number; y: number; z: number }>, label: string) => {
      let count = 0
      const tips = [4, 8, 12, 16, 20]
      if (label === "Right") {
        if (landmarks[4].x < landmarks[3].x) count++
      } else {
        if (landmarks[4].x > landmarks[3].x) count++
      }
      for (let i = 1; i < 5; i++) {
        if (landmarks[tips[i]].y < landmarks[tips[i] - 2].y) count++
      }
      return count
    }

    const initThree = () => {
      const THREE = window.THREE

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 9

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.autoClearColor = false
      
      if (canvasRef.current?.parentElement) {
        canvasRef.current.parentElement.appendChild(renderer.domElement)
        renderer.domElement.style.position = "absolute"
        renderer.domElement.style.top = "0"
        renderer.domElement.style.left = "0"
        renderer.domElement.style.zIndex = "5"
        renderer.domElement.style.pointerEvents = "none"
      }

      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(PARTICLE_COUNT * 3)
      const colors = new Float32Array(PARTICLE_COUNT * 3)
      const initialPos = new Float32Array(PARTICLE_COUNT * 3)

      sphereTargets = new Float32Array(PARTICLE_COUNT * 3)
      heartTargets = new Float32Array(PARTICLE_COUNT * 3)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = initialPos[i * 3] = (Math.random() - 0.5) * 25
        positions[i * 3 + 1] = initialPos[i * 3 + 1] = (Math.random() - 0.5) * 20
        positions[i * 3 + 2] = initialPos[i * 3 + 2] = (Math.random() - 0.5) * 10
        colors[i * 3] = 0.1
        colors[i * 3 + 1] = 0.5
        colors[i * 3 + 2] = 1.0
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute("initialPos", new THREE.BufferAttribute(initialPos, 3))

      // Create shapes
      const radius = 2.8
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT)
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi
        sphereTargets[i * 3] = radius * Math.cos(theta) * Math.sin(phi)
        sphereTargets[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
        sphereTargets[i * 3 + 2] = radius * Math.cos(phi)

        const t = Math.random() * Math.PI * 2
        const r = 0.18
        heartTargets[i * 3] = r * (16 * Math.pow(Math.sin(t), 3))
        heartTargets[i * 3 + 1] = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
        heartTargets[i * 3 + 2] = (Math.random() - 0.5) * 1.0
      }

      const material = new THREE.ShaderMaterial({
        vertexShader: `
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 40.0 * (1.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float d = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (d > 0.5) discard;
            float glow = pow(1.0 - d * 2.0, 3.0);
            float core = pow(1.0 - d * 2.0, 10.0);
            gl_FragColor = vec4(mix(vColor, vec3(1.0), core), glow);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      particleSystem = new THREE.Points(geometry, material)
      scene.add(particleSystem)

      const animate = () => {
        requestAnimationFrame(animate)
        renderer.setClearColor(0x000000, 0.15)
        renderer.clear(true, true, true)

        const pos = particleSystem.geometry.attributes.position.array
        const col = particleSystem.geometry.attributes.color.array
        const init = particleSystem.geometry.attributes.initialPos.array

        const time = Date.now()
        const heartPulse = 1.0 + Math.pow(Math.sin(time * 0.005), 2.0) * 0.35
        const rotationSpeed = time * 0.003
        const sinR = Math.sin(rotationSpeed)
        const cosR = Math.cos(rotationSpeed)

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3
          const jitter = sphereMode !== "none" || heartMode || explosionMode ? 0.2 : 0.02
          const vx = (Math.random() - 0.5) * jitter
          const vy = (Math.random() - 0.5) * jitter

          if (heartMode) {
            const cx = (vHandL.x + vHandR.x) / 2
            const cy = (vHandL.y + vHandR.y) / 2
            const px = heartTargets[i3] * heartPulse
            const py = heartTargets[i3 + 1] * heartPulse
            pos[i3] += (px + cx - pos[i3]) * 0.15 + vx
            pos[i3 + 1] += (py + cy - pos[i3 + 1]) * 0.15 + vy
            pos[i3 + 2] += (heartTargets[i3 + 2] - pos[i3 + 2]) * 0.15
            col[i3] = 1.0
            col[i3 + 1] = 0.1
            col[i3 + 2] = 0.3
          } else if (sphereMode !== "none") {
            const targetHand = sphereMode === "right" ? vHandR : vHandL
            const rx = sphereTargets[i3] * cosR - sphereTargets[i3 + 2] * sinR
            const rz = sphereTargets[i3] * sinR + sphereTargets[i3 + 2] * cosR
            pos[i3] += (rx + targetHand.x - pos[i3]) * 0.18 + vx
            pos[i3 + 1] += (sphereTargets[i3 + 1] + targetHand.y - pos[i3 + 1]) * 0.18 + vy
            pos[i3 + 2] += (rz + targetHand.z - pos[i3 + 2]) * 0.18
            col[i3] = 0.0
            col[i3 + 1] = 1.0
            col[i3 + 2] = 0.8
          } else if (explosionMode) {
            pos[i3] += (Math.random() - 0.5) * 3.0
            pos[i3 + 1] += (Math.random() - 0.5) * 3.0
            pos[i3 + 2] += (Math.random() - 0.5) * 3.0
            col[i3] = 1.0
            col[i3 + 1] = 0.5
            col[i3 + 2] = 0.0
          } else if (targetPositions.length > 0) {
            pos[i3] += (targetPositions[i3] - pos[i3]) * 0.12 + vx
            pos[i3 + 1] += (targetPositions[i3 + 1] - pos[i3 + 1]) * 0.12 + vy
            pos[i3 + 2] += (targetPositions[i3 + 2] - pos[i3 + 2]) * 0.12
            col[i3] = currentTextColor.r
            col[i3 + 1] = currentTextColor.g
            col[i3 + 2] = currentTextColor.b
          } else {
            pos[i3] += (init[i3] - pos[i3]) * 0.05 + vx
            pos[i3 + 1] += (init[i3 + 1] - pos[i3 + 1]) * 0.05 + vy
            pos[i3 + 2] += (init[i3 + 2] - pos[i3 + 2]) * 0.05
            col[i3] = 0.1
            col[i3 + 1] = 0.4
            col[i3 + 2] = 1.0
          }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true
        particleSystem.geometry.attributes.color.needsUpdate = true
        renderer.render(scene, camera)
      }

      animate()

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener("resize", handleResize)

      return () => window.removeEventListener("resize", handleResize)
    }

    const onResults = (results: HandResults) => {
      let fL = -1,
        fR = -1

      if (results.multiHandLandmarks && results.multiHandedness) {
        results.multiHandLandmarks.forEach((landmarks, index) => {
          const label = results.multiHandedness![index].label
          const fingers = countFingers(landmarks, label)
          if (label === "Left") {
            fL = fingers
            vHandL.x = -(landmarks[9].x - 0.5) * 20
            vHandL.y = -(landmarks[9].y - 0.5) * 16
            vHandL.z = -landmarks[9].z * 10
          } else {
            fR = fingers
            vHandR.x = -(landmarks[9].x - 0.5) * 20
            vHandR.y = -(landmarks[9].y - 0.5) * 16
            vHandR.z = -landmarks[9].z * 10
          }
        })

        // Ambas manos cerradas = corazón latiendo
        if (fL === 0 && fR === 0) {
          heartMode = true
          sphereMode = "none"
          explosionMode = false
          setStatus({ text: "❤️ CORAZÓN LATIENDO", color: "#ff3366" })
          setCurrentGesture("heart")
        }
        // Mano izquierda cerrada + derecha abierta = esfera en mano derecha
        else if (fL === 0 && fR === 5) {
          sphereMode = "right"
          heartMode = false
          explosionMode = false
          setStatus({ text: "🔮 ESFERA DERECHA", color: "#00ffcc" })
          setCurrentGesture("sphere-right")
        }
        // Mano derecha cerrada + izquierda abierta = esfera en mano izquierda
        else if (fL === 5 && fR === 0) {
          sphereMode = "left"
          heartMode = false
          explosionMode = false
          setStatus({ text: "🔮 ESFERA IZQUIERDA", color: "#00ffcc" })
          setCurrentGesture("sphere-left")
        }
        // Ambas manos abiertas = explosión
        else if (fL === 5 && fR === 5) {
          explosionMode = true
          sphereMode = "none"
          heartMode = false
          setStatus({ text: "💥 EXPLOSIÓN", color: "#ff8800" })
          setCurrentGesture("explosion")
        }
        // Mostrar texto según dedos levantados
        else {
          sphereMode = "none"
          heartMode = false
          explosionMode = false
          const maxF = Math.max(fL, fR)
          if (maxF >= 1 && maxF <= 5) {
            if (currentTextIndex !== maxF - 1) {
              currentTextIndex = maxF - 1
              createTextTarget(messages[currentTextIndex])
            }
            setStatus({ text: `✨ ${messages[currentTextIndex]}`, color: "#ffffff" })
            setCurrentGesture(`text-${maxF}`)
          } else {
            targetPositions = []
            currentTextIndex = -1
            setStatus({ text: "👋 MUESTRA TUS MANOS", color: "#00ff00" })
            setCurrentGesture(null)
          }
        }
      } else {
        // No hay manos detectadas
        sphereMode = "none"
        heartMode = false
        explosionMode = false
        targetPositions = []
        currentTextIndex = -1
        setStatus({ text: "👋 MUESTRA TUS MANOS", color: "#00ff00" })
        setCurrentGesture(null)
      }
    }

    const init = async () => {
      try {
        await loadScripts()
        setIsLoading(false)
        setStatus({ text: "Iniciando cámara...", color: "#ffffff" })

        initThree()

        const hands = new window.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        })
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        })
        hands.onResults(onResults)

        if (videoRef.current) {
          const cam = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current) {
                await hands.send({ image: videoRef.current })
              }
            },
            width: 1280,
            height: 720,
          })
          cam.start()
        }
      } catch (error) {
        console.error("Error initializing:", error)
        setStatus({ text: "Error al iniciar", color: "#ff0000" })
      }
    }

    init()

    return () => {
      if (renderer) {
        renderer.dispose()
        renderer.domElement?.remove()
      }
    }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Video de fondo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="fixed top-0 left-0 w-full h-full object-cover scale-x-[-1] z-[1] brightness-[0.6] contrast-[1.3]"
      />

      {/* Canvas placeholder para Three.js */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-14 h-14 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-white text-lg font-normal tracking-wide">Cargando...</p>
          </div>
        </div>
      )}

      {/* UI Layer - Estado actual */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg">
          <span
            className="font-mono text-base uppercase tracking-wider font-semibold"
            style={{ color: status.color, textShadow: `0 0 10px ${status.color}` }}
          >
            {status.text}
          </span>
        </div>
      </div>

      {/* Toggle Guide Button */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200 shadow-lg"
      >
        {showGuide ? "Ocultar Guia" : "Mostrar Guia"}
      </button>

      {/* Gesture Guide */}
      {showGuide && <GestureGuide currentGesture={currentGesture} />}
    </div>
  )
}
