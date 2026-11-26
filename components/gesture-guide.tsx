"use client"

import { cn } from "@/lib/utils"
import { Hand3D } from "./hand-3d"

interface GestureGuideProps {
  currentGesture: string | null
}

const gestures = [
  {
    id: "heart",
    name: "Corazón Latiendo",
    description: "Cierra ambos puños",
    leftFingers: { count: 0, isClosed: true },
    rightFingers: { count: 0, isClosed: true },
    effect: "❤️ Corazón 3D que late",
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/50",
  },
  {
    id: "sphere-right",
    name: "Esfera Derecha",
    description: "Puño izquierdo + Mano derecha abierta",
    leftFingers: { count: 0, isClosed: true },
    rightFingers: { count: 5, isOpen: true },
    effect: "🔮 Esfera en mano derecha",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
  },
  {
    id: "sphere-left",
    name: "Esfera Izquierda",
    description: "Mano izquierda abierta + Puño derecho",
    leftFingers: { count: 5, isOpen: true },
    rightFingers: { count: 0, isClosed: true },
    effect: "🔮 Esfera en mano izquierda",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
  },
  {
    id: "explosion",
    name: "Explosión",
    description: "Ambas manos abiertas",
    leftFingers: { count: 5, isOpen: true },
    rightFingers: { count: 5, isOpen: true },
    effect: "💥 Partículas explotan",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
  },
  {
    id: "text-1",
    name: "Texto: HOLA",
    description: "1 dedo levantado",
    leftFingers: { count: 1, isOpen: false },
    rightFingers: { count: 1, isOpen: false },
    effect: "✨ Muestra 'HOLA'",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/50",
  },
  {
    id: "text-2",
    name: "Texto: BIENVENIDO",
    description: "2 dedos levantados",
    leftFingers: { count: 2, isOpen: false },
    rightFingers: { count: 2, isOpen: false },
    effect: "✨ Muestra 'BIENVENIDO'",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/50",
  },
  {
    id: "text-3",
    name: "Texto: GRACIAS",
    description: "3 dedos levantados",
    leftFingers: { count: 3, isOpen: false },
    rightFingers: { count: 3, isOpen: false },
    effect: "✨ Muestra 'GRACIAS'",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/50",
  },
  {
    id: "text-4",
    name: "Texto: INCREÍBLE",
    description: "4 dedos levantados",
    leftFingers: { count: 4, isOpen: false },
    rightFingers: { count: 4, isOpen: false },
    effect: "✨ Muestra 'INCREÍBLE'",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/50",
  },
  {
    id: "text-5",
    name: "Texto: BRAVO",
    description: "5 dedos levantados (mano abierta)",
    leftFingers: { count: 5, isOpen: true },
    rightFingers: { count: 5, isOpen: true },
    effect: "✨ Muestra 'BRAVO'",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/50",
  },
]

export function GestureGuide({ currentGesture }: GestureGuideProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 max-w-6xl mx-auto">
        <h2 className="text-white font-bold text-lg mb-3 text-center">
          🎮 Guía de Gestos — Usa tus manos para controlar
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {gestures.map((gesture) => {
            const isActive = currentGesture === gesture.id

            return (
              <div
                key={gesture.id}
                className={cn(
                  "rounded-xl p-3 border-2 transition-all duration-300",
                  isActive
                    ? `${gesture.bgColor} ${gesture.borderColor} scale-105 shadow-lg`
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex justify-center gap-2 mb-2">
                  <Hand3D
                    fingerCount={gesture.leftFingers.count}
                    isOpen={gesture.leftFingers.isOpen || false}
                    isClosed={gesture.leftFingers.isClosed || false}
                    size="sm"
                  />
                  <span className="text-white/30 text-xs self-center">+</span>
                  <Hand3D
                    fingerCount={gesture.rightFingers.count}
                    isOpen={gesture.rightFingers.isOpen || false}
                    isClosed={gesture.rightFingers.isClosed || false}
                    size="sm"
                  />
                </div>
                <p className={cn("text-xs font-bold text-center", isActive ? gesture.color : "text-white/80")}>
                  {gesture.name}
                </p>
                <p className="text-[10px] text-white/50 text-center mt-1">
                  {gesture.description}
                </p>
              </div>
            )
          })}
        </div>

        <p className="text-white/40 text-xs text-center mt-3">
          💡 Tip: Mantén las manos dentro del encuadre con buena iluminación para que el sistema las detecte
        </p>
      </div>
    </div>
  )
}
