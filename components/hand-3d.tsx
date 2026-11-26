"use client"

import { useEffect, useRef } from "react"

interface Hand3DProps {
  fingerCount: number
  isOpen: boolean
  isClosed: boolean
  size?: "sm" | "md" | "lg"
}

export function Hand3D({ fingerCount, isOpen, isClosed, size = "md" }: Hand3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Esperar a que THREE esté disponible globalmente
    const checkTHREE = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).THREE) {
        clearInterval(checkTHREE)
        initScene()
      }
    }, 100)

    const initScene = () => {
      const THREE = (window as any).THREE
      if (!THREE) return

      const container = containerRef.current
      if (!container) return

      const width = container.clientWidth || 100
      const height = container.clientHeight || 100

      // Scene setup
      const scene = new THREE.Scene()
      sceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      camera.position.z = 1.5
      cameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Create hand geometry
      createHand(THREE, scene, { fingerCount, isOpen, isClosed })

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate)

        // Rotate hand slightly
        scene.children.forEach((child: any) => {
          if (child.name === "hand") {
            child.rotation.y += 0.005
          }
        })

        renderer.render(scene, camera)
      }
      animate()

      // Handle resize
      const handleResize = () => {
        const newWidth = container.clientWidth || 100
        const newHeight = container.clientHeight || 100
        renderer.setSize(newWidth, newHeight)
        camera.aspect = newWidth / newHeight
        camera.updateProjectionMatrix()
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        renderer.dispose()
      }
    }

    return () => clearInterval(checkTHREE)
  }, [fingerCount, isOpen, isClosed])

  const createHand = (THREE: any, scene: any, config: any) => {
    const { fingerCount, isOpen, isClosed } = config

    const handGroup = new THREE.Group()
    handGroup.name = "hand"

    // Palma (mano cerrada = cubo, abierta = plano)
    const palmGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.15)
    const palmMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4a460, // Sandy brown (skin tone)
      metalness: 0.1,
      roughness: 0.8,
    })
    const palm = new THREE.Mesh(palmGeometry, palmMaterial)
    handGroup.add(palm)

    // Dedos
    const fingerPositions = [
      { x: -0.1, name: "thumb" }, // Pulgar (solo se ve con mano abierta)
      { x: -0.03, name: "index" }, // Índice
      { x: 0.03, name: "middle" }, // Medio
      { x: 0.09, name: "ring" }, // Anular
    ]

    fingerPositions.forEach((pos, idx) => {
      const shouldShow = !isClosed && (isOpen || idx < fingerCount)

      if (shouldShow) {
        const fingerGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.1)
        const fingerMaterial = new THREE.MeshStandardMaterial({
          color: 0xf4a460,
          metalness: 0.1,
          roughness: 0.8,
        })
        const finger = new THREE.Mesh(fingerGeometry, fingerMaterial)

        finger.position.x = pos.x
        finger.position.y = 0.25
        finger.castShadow = true

        handGroup.add(finger)
      }
    })

    // Lighting
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
    light1.position.set(5, 5, 5)
    scene.add(light1)

    const light2 = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(light2)

    scene.add(handGroup)
  }

  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <div
      ref={containerRef}
      className={`${sizeMap[size]} rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 overflow-hidden`}
    />
  )
}
