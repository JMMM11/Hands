"use client"

import { cn } from "@/lib/utils"
import { Hand3D } from "./hand-3d"

interface GestureGuideProps {
  currentGesture: string | null
}

const PINK = { hex: "#ff6b9a", text: "text-pink-400", bg: "bg-pink-500/20", border: "border-pink-500/50" }
const CYAN = { hex: "#3fe6cf", text: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/50" }
const ORANGE = { hex: "#ffa043", text: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/50" }
const VIOLET = { hex: "#b29bff", text: "text-violet-400", bg: "bg-violet-500/20", border: "border-violet-500/50" }

// hands: dedos levantados [izquierda, derecha]; un solo valor = cualquier mano
const gestures = [
  { id: "heart", name: "Corazón", description: "Cierra ambos puños", hands: [0, 0], color: PINK },
  { id: "sphere-right", name: "Esfera derecha", description: "Puño izquierdo, derecha abierta", hands: [0, 5], color: CYAN },
  { id: "sphere-left", name: "Esfera izquierda", description: "Izquierda abierta, puño derecho", hands: [5, 0], color: CYAN },
  { id: "explosion", name: "Explosión", description: "Ambas manos abiertas", hands: [5, 5], color: ORANGE },
  { id: "text-1", name: "HOLA", description: "Levanta el índice", hands: [1], color: VIOLET },
  { id: "text-2", name: "BIENVENIDO", description: "Índice y medio", hands: [2], color: VIOLET },
  { id: "text-3", name: "GRACIAS", description: "Índice, medio y anular", hands: [3], color: VIOLET },
  { id: "text-4", name: "INCREÍBLE", description: "Cuatro dedos, pulgar doblado", hands: [4], color: VIOLET },
  { id: "text-5", name: "BRAVO", description: "Una mano abierta", hands: [5], color: VIOLET },
]

export function GestureGuide({ currentGesture }: GestureGuideProps) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto">
      <div className="bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 p-2 max-w-5xl mx-auto">
        <p className="text-white/50 text-[11px] text-center mb-1.5">
          <span className="text-white font-semibold">Gestos</span> · los dedos en color son los que levantas
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {gestures.map((gesture) => {
            const isActive = currentGesture === gesture.id
            const { color } = gesture

            return (
              <div
                key={gesture.id}
                className={cn(
                  "rounded-lg px-1 py-1.5 border transition-all duration-300",
                  isActive ? `${color.bg} ${color.border} scale-105 shadow-lg` : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex justify-center items-center mb-1">
                  {gesture.hands.length === 2 ? (
                    <>
                      <Hand3D fingers={gesture.hands[0]} side="left" color={color.hex} className="size-10" />
                      <Hand3D fingers={gesture.hands[1]} side="right" color={color.hex} className="size-10" />
                    </>
                  ) : (
                    <Hand3D fingers={gesture.hands[0]} side="right" color={color.hex} className="size-10" />
                  )}
                </div>
                <p className={cn("text-[11px] font-bold text-center leading-tight", isActive ? color.text : "text-white/80")}>{gesture.name}</p>
                <p className="text-[9px] text-white/50 text-center leading-tight mt-0.5">{gesture.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
