"use client"

import { cn } from "@/lib/utils"

interface GestureGuideProps {
  currentGesture: string | null
}

const PINK = "#ff3d8b"
const CYAN = "#00f0ff"
const ORANGE = "#ff9a1f"
const VIOLET = "#b56bff"

// hands: dedos levantados [izquierda, derecha]; un solo valor = cualquier mano
const gestures = [
  { id: "heart", name: "Corazón", description: "Cierra ambos puños", hands: [0, 0], color: PINK },
  { id: "sphere-right", name: "Esfera der.", description: "Puño izquierdo, derecha abierta", hands: [0, 5], color: CYAN },
  { id: "sphere-left", name: "Esfera izq.", description: "Izquierda abierta, puño derecho", hands: [5, 0], color: CYAN },
  { id: "explosion", name: "Explosión", description: "Ambas manos abiertas", hands: [5, 5], color: ORANGE },
  { id: "text-1", name: "HOLA", description: "Levanta el índice", hands: [1], color: VIOLET },
  { id: "text-2", name: "BIENVENIDO", description: "Índice y medio", hands: [2], color: VIOLET },
  { id: "text-3", name: "GRACIAS", description: "Índice, medio y anular", hands: [3], color: VIOLET },
  { id: "text-4", name: "INCREÍBLE", description: "Cuatro dedos, pulgar doblado", hands: [4], color: VIOLET },
  { id: "text-5", name: "BRAVO", description: "Una mano abierta", hands: [5], color: VIOLET },
]

// Mano derecha con la palma hacia la cámara: x del dedo, y de la punta levantada (índice..meñique)
const FINGERS = [
  { x: 11, top: 7 },
  { x: 15, top: 5 },
  { x: 19, top: 6 },
  { x: 22.5, top: 10 },
]

function HandIcon({ fingers, mirror, color }: { fingers: number; mirror?: boolean; color: string }) {
  const thumbUp = fingers === 5
  return (
    <svg
      viewBox="0 0 30 38"
      className="h-8 w-auto overflow-visible"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 2px ${color}) drop-shadow(0 0 5px ${color})`, transform: mirror ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <path d="M9 18 v8 a7 7 0 0 0 7 7 h1 a7 7 0 0 0 7 -7 v-8" />
      <path d="M12 33 v4 M20 33 v4" opacity={0.6} />
      {FINGERS.map((f, i) => {
        const up = fingers === 5 || i < fingers
        return <path key={i} d={`M${f.x} 18 V${up ? f.top : 15}`} opacity={up ? 1 : 0.35} />
      })}
      <path d={thumbUp ? "M9 24 L3.5 16.5" : "M9 24 L13 22"} opacity={thumbUp ? 1 : 0.35} />
    </svg>
  )
}

export function GestureGuide({ currentGesture }: GestureGuideProps) {
  return (
    <nav
      aria-label="Guía de gestos: los trazos encendidos son los dedos que levantas"
      className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/70 backdrop-blur-md"
    >
      <ul className="flex gap-1 overflow-x-auto px-2 py-1.5">
        {gestures.map((g) => {
          const isActive = currentGesture === g.id
          return (
            <li
              key={g.id}
              title={g.description}
              className={cn(
                "flex min-w-[76px] flex-1 flex-col items-center gap-1 rounded-md border px-1 py-1 transition-colors duration-300",
                isActive ? "bg-white/10" : "border-transparent hover:bg-white/5"
              )}
              style={isActive ? { borderColor: g.color, boxShadow: `0 0 10px ${g.color}66` } : undefined}
            >
              <div className="flex items-end gap-1">
                {g.hands.length === 2 ? (
                  <>
                    <HandIcon fingers={g.hands[0]} mirror color={g.color} />
                    <HandIcon fingers={g.hands[1]} color={g.color} />
                  </>
                ) : (
                  <HandIcon fingers={g.hands[0]} color={g.color} />
                )}
              </div>
              <span className="text-[10px] font-semibold leading-none tracking-wide" style={{ color: isActive ? g.color : "rgba(255,255,255,0.75)" }}>
                {g.name}
              </span>
              <span className="sr-only">{g.description}</span>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
