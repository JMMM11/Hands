(function () {
  const video = document.getElementById("video")
  const app = document.getElementById("app")
  const statusPill = document.getElementById("status-pill")
  const statusEl = document.getElementById("status")
  const overlayEl = document.getElementById("overlay")
  const overlayTitle = document.getElementById("overlay-title")
  const overlayHint = document.getElementById("overlay-hint")
  const overlayBtn = document.getElementById("overlay-btn")
  const guideEl = document.getElementById("guide")
  const guideStrip = document.getElementById("guide-strip")
  const toggleBtn = document.getElementById("toggle-guide")
  const toggleLabel = document.getElementById("toggle-guide-label")

  // ---------- Guia de gestos ----------
  const PINK = { accent: "#ff6b9a", rgb: "255, 107, 154" }
  const CYAN = { accent: "#3fe6cf", rgb: "63, 230, 207" }
  const ORANGE = { accent: "#ffa043", rgb: "255, 160, 67" }
  const VIOLET = { accent: "#b29bff", rgb: "178, 155, 255" }

  // hands: dedos levantados en cada mano [izquierda, derecha]
  const gestures = [
    { id: "heart", name: "Corazón", description: "Cierra ambos puños", hands: [0, 0], color: PINK },
    { id: "sphere-right", name: "Esfera derecha", description: "Puño izquierdo, derecha abierta", hands: [0, 5], color: CYAN },
    { id: "sphere-left", name: "Esfera izquierda", description: "Izquierda abierta, puño derecho", hands: [5, 0], color: CYAN },
    { id: "explosion", name: "Explosión", description: "Ambas manos abiertas", hands: [5, 5], color: ORANGE },
    { id: "text-1", name: "HOLA", description: "1 dedo levantado", hands: [1], color: VIOLET },
    { id: "text-2", name: "BIENVENIDO", description: "2 dedos levantados", hands: [2], color: VIOLET },
    { id: "text-3", name: "GRACIAS", description: "3 dedos levantados", hands: [3], color: VIOLET },
    { id: "text-4", name: "INCREÍBLE", description: "4 dedos levantados", hands: [4], color: VIOLET },
    { id: "text-5", name: "BRAVO", description: "Una mano abierta", hands: [5], color: VIOLET },
  ]

  // Barras en orden pulgar..meñique; el pulgar solo se levanta con la mano abierta
  const handGlyph = (fingers) => {
    let bars = ""
    for (let i = 0; i < 5; i++) {
      const up = fingers === 5 || (i >= 1 && i <= fingers)
      bars += up ? '<i class="up"></i>' : "<i></i>"
    }
    return '<span class="hand">' + bars + "</span>"
  }

  const gestureCards = {}
  gestures.forEach((g) => {
    const card = document.createElement("div")
    card.className = "gesture"
    card.style.setProperty("--accent", g.color.accent)
    card.style.setProperty("--accent-rgb", g.color.rgb)
    card.innerHTML =
      '<div class="glyph" aria-hidden="true">' + g.hands.map(handGlyph).join("") + "</div>" +
      '<p class="name">' + g.name + "</p>" +
      '<p class="desc">' + g.description + "</p>"
    guideStrip.appendChild(card)
    gestureCards[g.id] = card
  })

  toggleBtn.addEventListener("click", () => {
    guideEl.hidden = !guideEl.hidden
    toggleBtn.setAttribute("aria-expanded", String(!guideEl.hidden))
    toggleLabel.textContent = guideEl.hidden ? "Mostrar guía" : "Ocultar guía"
  })

  let currentGesture = null
  const setCurrentGesture = (id) => {
    if (id === currentGesture) return
    if (currentGesture && gestureCards[currentGesture]) gestureCards[currentGesture].classList.remove("active")
    if (id && gestureCards[id]) {
      gestureCards[id].classList.add("active")
      // En pantallas pequeñas la tira hace scroll: mantener visible el gesto activo
      if (!guideEl.hidden) {
        const strip = guideStrip.getBoundingClientRect()
        const card = gestureCards[id].getBoundingClientRect()
        if (card.left < strip.left || card.right > strip.right) {
          guideStrip.scrollTo({ left: gestureCards[id].offsetLeft - guideStrip.offsetLeft, behavior: "smooth" })
        }
      }
    }
    currentGesture = id
  }

  let currentStatus = ""
  const setStatus = (text, color) => {
    if (text === currentStatus) return
    currentStatus = text
    statusEl.textContent = text
    statusPill.style.setProperty("--status", color)
  }

  // ---------- Particulas ----------
  let scene, camera, renderer, particleSystem
  let targetPositions = []
  const PARTICLE_COUNT = 18000
  let sphereMode = "none"
  let heartMode = false
  let explosionMode = false
  let currentTextIndex = -1
  let currentTextColor = { r: 1, g: 1, b: 1 }

  let sphereTargets
  let heartTargets

  const vHandL = { x: 0, y: 0, z: 0 }
  const vHandR = { x: 0, y: 0, z: 0 }
  const messages = ["HOLA", "BIENVENIDO", "GRACIAS", "INCREÍBLE", "BRAVO"]

  const generateRandomNeonColor = () => {
    const color = new THREE.Color()
    color.setHSL(Math.random(), 1.0, 0.6)
    return { r: color.r, g: color.g, b: color.b }
  }

  const createTextTarget = (text) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = 2048
    canvas.height = 512
    currentTextColor = generateRandomNeonColor()

    ctx.fillStyle = "white"
    ctx.font = "bold 140px Arial, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 1024, 256)

    const data = ctx.getImageData(0, 0, 2048, 512).data
    const pts = []
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

  const countFingers = (landmarks, label) => {
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
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 9

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.autoClearColor = false
    app.appendChild(renderer.domElement)

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

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }

  // ---------- Gestos ----------
  const onResults = (results) => {
    let fL = -1,
      fR = -1

    if (results.multiHandLandmarks && results.multiHandedness) {
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const label = results.multiHandedness[index].label
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
        setStatus("Corazón latiendo", "#ff3366")
        setCurrentGesture("heart")
      }
      // Mano izquierda cerrada + derecha abierta = esfera en mano derecha
      else if (fL === 0 && fR === 5) {
        sphereMode = "right"
        heartMode = false
        explosionMode = false
        setStatus("Esfera derecha", "#00ffcc")
        setCurrentGesture("sphere-right")
      }
      // Mano derecha cerrada + izquierda abierta = esfera en mano izquierda
      else if (fL === 5 && fR === 0) {
        sphereMode = "left"
        heartMode = false
        explosionMode = false
        setStatus("Esfera izquierda", "#00ffcc")
        setCurrentGesture("sphere-left")
      }
      // Ambas manos abiertas = explosión
      else if (fL === 5 && fR === 5) {
        explosionMode = true
        sphereMode = "none"
        heartMode = false
        setStatus("Explosión", "#ff8800")
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
          setStatus("Texto: " + messages[currentTextIndex], "#b29bff")
          setCurrentGesture("text-" + maxF)
        } else {
          targetPositions = []
          currentTextIndex = -1
          setStatus("Muestra tus manos", "#4ade80")
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
      setStatus("Muestra tus manos", "#4ade80")
      setCurrentGesture(null)
    }
  }

  // ---------- Camara ----------
  let hands = null
  let tracking = false
  let overlayAction = null

  // state: "loading" | "permission" | "error"; sin buttonLabel no se muestra boton
  const showOverlay = (state, title, hint, buttonLabel, action) => {
    overlayEl.dataset.state = state
    overlayTitle.textContent = title
    overlayHint.textContent = hint || ""
    overlayBtn.hidden = !buttonLabel
    overlayBtn.textContent = buttonLabel || ""
    overlayAction = action || null
    overlayEl.hidden = false
  }

  overlayBtn.addEventListener("click", () => {
    if (overlayAction) overlayAction()
  })

  const describeCameraError = (error) => {
    switch (error && error.name) {
      case "NotAllowedError":
      case "SecurityError":
        return [
          "Necesitamos acceso a tu cámara",
          "Permítela desde el ícono del candado en la barra de direcciones y vuelve a intentarlo. El video se procesa en tu dispositivo y no se envía a ningún servidor.",
        ]
      case "NotFoundError":
      case "OverconstrainedError":
        return ["No se encontró ninguna cámara", "Conecta una cámara y vuelve a intentarlo."]
      case "NotReadableError":
      case "AbortError":
        return ["No se pudo usar la cámara", "Cierra otras apps o pestañas que la estén usando y vuelve a intentarlo."]
      default:
        return ["No se pudo iniciar la cámara", "Vuelve a intentarlo."]
    }
  }

  const trackFrame = async () => {
    if (video.readyState >= 2) {
      try {
        await hands.send({ image: video })
      } catch (error) {
        console.error("Error processing frame:", error)
      }
    }
    requestAnimationFrame(trackFrame)
  }

  // getUserMedia hace que el navegador muestre el aviso de permiso de la camara
  const startCamera = async () => {
    showOverlay(
      "permission",
      "Permite el acceso a la cámara",
      "Tu navegador te va a pedir permiso. El video se procesa en tu dispositivo y no se envía a ningún servidor."
    )
    setStatus("Esperando cámara", "#ffffff")

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showOverlay(
        "error",
        "Este navegador no puede usar la cámara desde aquí",
        "Abre la página con https:// (o en localhost) en un navegador actualizado."
      )
      setStatus("Cámara no disponible", "#ff6b6b")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      video.srcObject = stream
      await video.play()
    } catch (error) {
      console.error("Error starting camera:", error)
      const [title, hint] = describeCameraError(error)
      showOverlay("error", title, hint, "Activar cámara", startCamera)
      setStatus("Cámara no disponible", "#ff6b6b")
      return
    }

    overlayEl.hidden = true
    setStatus("Muestra tus manos", "#4ade80")
    if (!tracking) {
      tracking = true
      trackFrame()
    }
  }

  const init = () => {
    if (!window.THREE || !window.Hands) {
      showOverlay(
        "error",
        "No se pudieron cargar las librerías",
        "Revisa tu conexión a internet y recarga la página.",
        "Recargar",
        () => location.reload()
      )
      setStatus("Error al iniciar", "#ff6b6b")
      return
    }

    try {
      initThree()

      hands = new Hands({
        locateFile: (file) => "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/" + file,
      })
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      })
      hands.onResults(onResults)
    } catch (error) {
      console.error("Error initializing:", error)
      showOverlay(
        "error",
        "No se pudo iniciar la experiencia",
        "Tu navegador no soporta los gráficos 3D necesarios. Prueba con otro navegador o dispositivo.",
        "Recargar",
        () => location.reload()
      )
      setStatus("Error al iniciar", "#ff6b6b")
      return
    }

    startCamera()
  }

  init()
})()
