(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/hand-3d.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Hand3D",
    ()=>Hand3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const SIZE = 192;
const cache = new Map();
// Un solo renderer compartido: cada canvas WebGL cuenta contra el límite del navegador
let renderer = null;
// Nudillo (x, y), largo de cada falange y grosor; orden índice..meñique
const FINGERS = [
    {
        x: -0.3,
        y: 0.5,
        lens: [
            0.42,
            0.26,
            0.2
        ],
        r: 0.105
    },
    {
        x: -0.09,
        y: 0.54,
        lens: [
            0.47,
            0.29,
            0.22
        ],
        r: 0.11
    },
    {
        x: 0.12,
        y: 0.51,
        lens: [
            0.44,
            0.27,
            0.2
        ],
        r: 0.104
    },
    {
        x: 0.31,
        y: 0.42,
        lens: [
            0.34,
            0.21,
            0.17
        ],
        r: 0.092
    }
];
const OPEN = [
    0.05,
    0.05,
    0.03
];
const CURLED = [
    1.45,
    1.6,
    1.2
];
function buildChain(THREE, parent, lens, r, mat, curl) {
    let joint = parent;
    lens.forEach((len, i)=>{
        const g = new THREE.Group();
        if (i > 0) g.position.y = lens[i - 1];
        g.rotation.x = curl[i];
        joint.add(g);
        const radius = r * (1 - i * 0.08);
        const bone = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.94, radius, len, 16), mat);
        bone.position.y = len / 2;
        g.add(bone);
        g.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), mat));
        if (i === lens.length - 1) {
            const tip = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.94, 16, 12), mat);
            tip.position.y = len;
            g.add(tip);
        }
        joint = g;
    });
}
function renderHand(THREE, fingers, side, color) {
    const key = `${fingers}-${side}-${color}`;
    const hit = cache.get(key);
    if (hit) return hit;
    if (!renderer) {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setPixelRatio(1);
        renderer.setSize(SIZE, SIZE, false);
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0.35, 4.3);
    camera.lookAt(0, 0.35, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key1 = new THREE.DirectionalLight(0xffffff, 0.9);
    key1.position.set(2, 3, 4);
    scene.add(key1);
    const rim = new THREE.DirectionalLight(new THREE.Color(color), 1.3);
    rim.position.set(-3, 1, -3);
    scene.add(rim);
    const skin = new THREE.MeshStandardMaterial({
        color: 0xe9c9b3,
        roughness: 0.6
    });
    const raised = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.25,
        roughness: 0.45
    });
    const hand = new THREE.Group();
    // Palma hacia la cámara, vista en 3/4; la mano izquierda es el espejo de la derecha
    hand.rotation.set(-0.12, side === "right" ? 0.3 : -0.3, 0);
    if (side === "left") hand.scale.x = -1;
    scene.add(hand);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), skin);
    palm.scale.set(0.86, 1, 0.34);
    palm.position.y = 0.08;
    hand.add(palm);
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.5, 24), skin);
    wrist.scale.z = 0.6;
    wrist.position.y = -0.6;
    hand.add(wrist);
    FINGERS.forEach((f, i)=>{
        const up = fingers === 5 || i < fingers;
        const base = new THREE.Group();
        base.position.set(f.x, f.y, 0);
        if (up) base.rotation.z = -f.x * 0.45;
        hand.add(base);
        buildChain(THREE, base, f.lens, f.r, up ? raised : skin, up ? OPEN : CURLED);
    });
    // El pulgar solo se levanta con la mano abierta; si no, cruza sobre los dedos doblados
    const thumbUp = fingers === 5;
    const thumb = new THREE.Group();
    thumb.position.set(-0.36, -0.12, 0.08);
    thumb.rotation.z = thumbUp ? 0.75 : -0.25;
    hand.add(thumb);
    buildChain(THREE, thumb, [
        0.34,
        0.27,
        0.21
    ], 0.1, thumbUp ? raised : skin, thumbUp ? [
        0.1,
        0.1,
        0.05
    ] : [
        0.5,
        0.6,
        0.5
    ]);
    thumb.children[0]?.scale.setScalar(1.15);
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL("image/png");
    scene.traverse((o)=>o.geometry?.dispose());
    skin.dispose();
    raised.dispose();
    cache.set(key, url);
    return url;
}
function describe(fingers, side) {
    const hand = side === "left" ? "Mano izquierda" : "Mano derecha";
    if (fingers === 0) return `${hand}: puño cerrado`;
    if (fingers === 5) return `${hand}: mano abierta`;
    return `${hand}: ${fingers} ${fingers === 1 ? "dedo levantado" : "dedos levantados"}`;
}
function Hand3D({ fingers, side, color, className }) {
    _s();
    const [src, setSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Hand3D.useEffect": ()=>{
            let timer;
            // Three.js llega por CDN desde page.tsx; esperar a que esté cargado
            const tryRender = {
                "Hand3D.useEffect.tryRender": ()=>{
                    const THREE = window.THREE;
                    if (!THREE) {
                        timer = window.setTimeout(tryRender, 150);
                        return;
                    }
                    setSrc(renderHand(THREE, fingers, side, color));
                }
            }["Hand3D.useEffect.tryRender"];
            tryRender();
            return ({
                "Hand3D.useEffect": ()=>window.clearTimeout(timer)
            })["Hand3D.useEffect"];
        }
    }["Hand3D.useEffect"], [
        fingers,
        side,
        color
    ]);
    const label = describe(fingers, side);
    return src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        src: src,
        alt: label,
        title: label,
        width: SIZE,
        height: SIZE,
        className: className,
        draggable: false
    }, void 0, false, {
        fileName: "[project]/components/hand-3d.tsx",
        lineNumber: 157,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "img",
        "aria-label": label,
        className: `${className ?? ""} animate-pulse rounded-full bg-white/5`
    }, void 0, false, {
        fileName: "[project]/components/hand-3d.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
_s(Hand3D, "6mDrCGDb6hIhHyxg19IlnGsm0hI=");
_c = Hand3D;
var _c;
__turbopack_context__.k.register(_c, "Hand3D");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/gesture-guide.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GestureGuide",
    ()=>GestureGuide
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$hand$2d$3d$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/hand-3d.tsx [app-client] (ecmascript)");
"use client";
;
;
;
const PINK = {
    hex: "#ff6b9a",
    text: "text-pink-400",
    bg: "bg-pink-500/20",
    border: "border-pink-500/50"
};
const CYAN = {
    hex: "#3fe6cf",
    text: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/50"
};
const ORANGE = {
    hex: "#ffa043",
    text: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/50"
};
const VIOLET = {
    hex: "#b29bff",
    text: "text-violet-400",
    bg: "bg-violet-500/20",
    border: "border-violet-500/50"
};
// hands: dedos levantados [izquierda, derecha]; un solo valor = cualquier mano
const gestures = [
    {
        id: "heart",
        name: "Corazón",
        description: "Cierra ambos puños",
        hands: [
            0,
            0
        ],
        color: PINK
    },
    {
        id: "sphere-right",
        name: "Esfera derecha",
        description: "Puño izquierdo, derecha abierta",
        hands: [
            0,
            5
        ],
        color: CYAN
    },
    {
        id: "sphere-left",
        name: "Esfera izquierda",
        description: "Izquierda abierta, puño derecho",
        hands: [
            5,
            0
        ],
        color: CYAN
    },
    {
        id: "explosion",
        name: "Explosión",
        description: "Ambas manos abiertas",
        hands: [
            5,
            5
        ],
        color: ORANGE
    },
    {
        id: "text-1",
        name: "HOLA",
        description: "Levanta el índice",
        hands: [
            1
        ],
        color: VIOLET
    },
    {
        id: "text-2",
        name: "BIENVENIDO",
        description: "Índice y medio",
        hands: [
            2
        ],
        color: VIOLET
    },
    {
        id: "text-3",
        name: "GRACIAS",
        description: "Índice, medio y anular",
        hands: [
            3
        ],
        color: VIOLET
    },
    {
        id: "text-4",
        name: "INCREÍBLE",
        description: "Cuatro dedos, pulgar doblado",
        hands: [
            4
        ],
        color: VIOLET
    },
    {
        id: "text-5",
        name: "BRAVO",
        description: "Una mano abierta",
        hands: [
            5
        ],
        color: VIOLET
    }
];
function GestureGuide({ currentGesture }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-4 left-4 right-4 z-20 pointer-events-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 max-w-6xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-white font-bold text-lg mb-1 text-center",
                    children: "Guía de gestos"
                }, void 0, false, {
                    fileName: "[project]/components/gesture-guide.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-white/50 text-xs text-center mb-3",
                    children: "Los dedos en color son los que debes levantar"
                }, void 0, false, {
                    fileName: "[project]/components/gesture-guide.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3",
                    children: gestures.map((gesture)=>{
                        const isActive = currentGesture === gesture.id;
                        const { color } = gesture;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-xl p-3 border-2 transition-all duration-300", isActive ? `${color.bg} ${color.border} scale-105 shadow-lg` : "bg-white/5 border-white/10 hover:bg-white/10"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center items-center gap-1 mb-2",
                                    children: gesture.hands.length === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$hand$2d$3d$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Hand3D"], {
                                                fingers: gesture.hands[0],
                                                side: "left",
                                                color: color.hex,
                                                className: "size-16"
                                            }, void 0, false, {
                                                fileName: "[project]/components/gesture-guide.tsx",
                                                lineNumber: 51,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$hand$2d$3d$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Hand3D"], {
                                                fingers: gesture.hands[1],
                                                side: "right",
                                                color: color.hex,
                                                className: "size-16"
                                            }, void 0, false, {
                                                fileName: "[project]/components/gesture-guide.tsx",
                                                lineNumber: 52,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$hand$2d$3d$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Hand3D"], {
                                        fingers: gesture.hands[0],
                                        side: "right",
                                        color: color.hex,
                                        className: "size-16"
                                    }, void 0, false, {
                                        fileName: "[project]/components/gesture-guide.tsx",
                                        lineNumber: 55,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/gesture-guide.tsx",
                                    lineNumber: 48,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-xs font-bold text-center", isActive ? color.text : "text-white/80"),
                                    children: gesture.name
                                }, void 0, false, {
                                    fileName: "[project]/components/gesture-guide.tsx",
                                    lineNumber: 58,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-white/50 text-center mt-1",
                                    children: gesture.description
                                }, void 0, false, {
                                    fileName: "[project]/components/gesture-guide.tsx",
                                    lineNumber: 59,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, gesture.id, true, {
                            fileName: "[project]/components/gesture-guide.tsx",
                            lineNumber: 41,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/gesture-guide.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-white/40 text-xs text-center mt-3",
                    children: "Mantén las manos dentro del encuadre y con buena iluminación"
                }, void 0, false, {
                    fileName: "[project]/components/gesture-guide.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/gesture-guide.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/gesture-guide.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = GestureGuide;
var _c;
__turbopack_context__.k.register(_c, "GestureGuide");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HandGestureVisualizer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$gesture$2d$guide$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/gesture-guide.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function HandGestureVisualizer() {
    _s();
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        text: "Cargando...",
        color: "#ffffff"
    });
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showGuide, setShowGuide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [currentGesture, setCurrentGesture] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HandGestureVisualizer.useEffect": ()=>{
            let scene, camera, renderer, particleSystem;
            let targetPositions = [];
            const PARTICLE_COUNT = 18000;
            let sphereMode = "none";
            let heartMode = false;
            let explosionMode = false;
            let currentTextIndex = -1;
            let currentTextColor = {
                r: 1,
                g: 1,
                b: 1
            };
            let sphereTargets;
            let heartTargets;
            const vHandL = {
                x: 0,
                y: 0,
                z: 0
            };
            const vHandR = {
                x: 0,
                y: 0,
                z: 0
            };
            const messages = [
                "HOLA",
                "BIENVENIDO",
                "GRACIAS",
                "INCREÍBLE",
                "BRAVO"
            ];
            const loadScripts = {
                "HandGestureVisualizer.useEffect.loadScripts": async ()=>{
                    const scripts = [
                        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
                        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
                        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
                    ];
                    for (const src of scripts){
                        await new Promise({
                            "HandGestureVisualizer.useEffect.loadScripts": (resolve, reject)=>{
                                if (document.querySelector(`script[src="${src}"]`)) {
                                    resolve();
                                    return;
                                }
                                const script = document.createElement("script");
                                script.src = src;
                                script.onload = ({
                                    "HandGestureVisualizer.useEffect.loadScripts": ()=>resolve()
                                })["HandGestureVisualizer.useEffect.loadScripts"];
                                script.onerror = reject;
                                document.head.appendChild(script);
                            }
                        }["HandGestureVisualizer.useEffect.loadScripts"]);
                    }
                }
            }["HandGestureVisualizer.useEffect.loadScripts"];
            const generateRandomNeonColor = {
                "HandGestureVisualizer.useEffect.generateRandomNeonColor": ()=>{
                    const hue = Math.random();
                    const THREE = window.THREE;
                    const color = new THREE.Color();
                    color.setHSL(hue, 1.0, 0.6);
                    return {
                        r: color.r,
                        g: color.g,
                        b: color.b
                    };
                }
            }["HandGestureVisualizer.useEffect.generateRandomNeonColor"];
            const createTextTarget = {
                "HandGestureVisualizer.useEffect.createTextTarget": (text)=>{
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = 2048;
                    canvas.height = 512;
                    currentTextColor = generateRandomNeonColor();
                    ctx.fillStyle = "white";
                    ctx.font = "bold 140px Arial, sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(text, 1024, 256);
                    const data = ctx.getImageData(0, 0, 2048, 512).data;
                    const pts = [];
                    for(let y = 0; y < 512; y += 4){
                        for(let x = 0; x < 2048; x += 4){
                            if (data[(y * 2048 + x) * 4 + 3] > 128) {
                                pts.push({
                                    x: (x - 1024) * 0.012,
                                    y: -(y - 256) * 0.012
                                });
                            }
                        }
                    }
                    targetPositions = [];
                    for(let i = 0; i < PARTICLE_COUNT; i++){
                        const p = pts[i % pts.length];
                        targetPositions.push(p.x, p.y, (Math.random() - 0.5) * 0.5);
                    }
                }
            }["HandGestureVisualizer.useEffect.createTextTarget"];
            const countFingers = {
                "HandGestureVisualizer.useEffect.countFingers": (landmarks, label)=>{
                    let count = 0;
                    const tips = [
                        4,
                        8,
                        12,
                        16,
                        20
                    ];
                    if (label === "Right") {
                        if (landmarks[4].x < landmarks[3].x) count++;
                    } else {
                        if (landmarks[4].x > landmarks[3].x) count++;
                    }
                    for(let i = 1; i < 5; i++){
                        if (landmarks[tips[i]].y < landmarks[tips[i] - 2].y) count++;
                    }
                    return count;
                }
            }["HandGestureVisualizer.useEffect.countFingers"];
            const initThree = {
                "HandGestureVisualizer.useEffect.initThree": ()=>{
                    const THREE = window.THREE;
                    scene = new THREE.Scene();
                    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
                    camera.position.z = 9;
                    renderer = new THREE.WebGLRenderer({
                        antialias: true,
                        alpha: true,
                        preserveDrawingBuffer: true
                    });
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    renderer.autoClearColor = false;
                    if (canvasRef.current?.parentElement) {
                        canvasRef.current.parentElement.appendChild(renderer.domElement);
                        renderer.domElement.style.position = "absolute";
                        renderer.domElement.style.top = "0";
                        renderer.domElement.style.left = "0";
                        renderer.domElement.style.zIndex = "5";
                        renderer.domElement.style.pointerEvents = "none";
                    }
                    const geometry = new THREE.BufferGeometry();
                    const positions = new Float32Array(PARTICLE_COUNT * 3);
                    const colors = new Float32Array(PARTICLE_COUNT * 3);
                    const initialPos = new Float32Array(PARTICLE_COUNT * 3);
                    sphereTargets = new Float32Array(PARTICLE_COUNT * 3);
                    heartTargets = new Float32Array(PARTICLE_COUNT * 3);
                    for(let i = 0; i < PARTICLE_COUNT; i++){
                        positions[i * 3] = initialPos[i * 3] = (Math.random() - 0.5) * 25;
                        positions[i * 3 + 1] = initialPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
                        positions[i * 3 + 2] = initialPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
                        colors[i * 3] = 0.1;
                        colors[i * 3 + 1] = 0.5;
                        colors[i * 3 + 2] = 1.0;
                    }
                    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
                    geometry.setAttribute("initialPos", new THREE.BufferAttribute(initialPos, 3));
                    // Create shapes
                    const radius = 2.8;
                    for(let i = 0; i < PARTICLE_COUNT; i++){
                        const phi = Math.acos(-1 + 2 * i / PARTICLE_COUNT);
                        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
                        sphereTargets[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
                        sphereTargets[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
                        sphereTargets[i * 3 + 2] = radius * Math.cos(phi);
                        const t = Math.random() * Math.PI * 2;
                        const r = 0.18;
                        heartTargets[i * 3] = r * (16 * Math.pow(Math.sin(t), 3));
                        heartTargets[i * 3 + 1] = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                        heartTargets[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
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
                        depthWrite: false
                    });
                    particleSystem = new THREE.Points(geometry, material);
                    scene.add(particleSystem);
                    const animate = {
                        "HandGestureVisualizer.useEffect.initThree.animate": ()=>{
                            requestAnimationFrame(animate);
                            renderer.setClearColor(0x000000, 0.15);
                            renderer.clear(true, true, true);
                            const pos = particleSystem.geometry.attributes.position.array;
                            const col = particleSystem.geometry.attributes.color.array;
                            const init = particleSystem.geometry.attributes.initialPos.array;
                            const time = Date.now();
                            const heartPulse = 1.0 + Math.pow(Math.sin(time * 0.005), 2.0) * 0.35;
                            const rotationSpeed = time * 0.003;
                            const sinR = Math.sin(rotationSpeed);
                            const cosR = Math.cos(rotationSpeed);
                            for(let i = 0; i < PARTICLE_COUNT; i++){
                                const i3 = i * 3;
                                const jitter = sphereMode !== "none" || heartMode || explosionMode ? 0.2 : 0.02;
                                const vx = (Math.random() - 0.5) * jitter;
                                const vy = (Math.random() - 0.5) * jitter;
                                if (heartMode) {
                                    const cx = (vHandL.x + vHandR.x) / 2;
                                    const cy = (vHandL.y + vHandR.y) / 2;
                                    const px = heartTargets[i3] * heartPulse;
                                    const py = heartTargets[i3 + 1] * heartPulse;
                                    pos[i3] += (px + cx - pos[i3]) * 0.15 + vx;
                                    pos[i3 + 1] += (py + cy - pos[i3 + 1]) * 0.15 + vy;
                                    pos[i3 + 2] += (heartTargets[i3 + 2] - pos[i3 + 2]) * 0.15;
                                    col[i3] = 1.0;
                                    col[i3 + 1] = 0.1;
                                    col[i3 + 2] = 0.3;
                                } else if (sphereMode !== "none") {
                                    const targetHand = sphereMode === "right" ? vHandR : vHandL;
                                    const rx = sphereTargets[i3] * cosR - sphereTargets[i3 + 2] * sinR;
                                    const rz = sphereTargets[i3] * sinR + sphereTargets[i3 + 2] * cosR;
                                    pos[i3] += (rx + targetHand.x - pos[i3]) * 0.18 + vx;
                                    pos[i3 + 1] += (sphereTargets[i3 + 1] + targetHand.y - pos[i3 + 1]) * 0.18 + vy;
                                    pos[i3 + 2] += (rz + targetHand.z - pos[i3 + 2]) * 0.18;
                                    col[i3] = 0.0;
                                    col[i3 + 1] = 1.0;
                                    col[i3 + 2] = 0.8;
                                } else if (explosionMode) {
                                    pos[i3] += (Math.random() - 0.5) * 3.0;
                                    pos[i3 + 1] += (Math.random() - 0.5) * 3.0;
                                    pos[i3 + 2] += (Math.random() - 0.5) * 3.0;
                                    col[i3] = 1.0;
                                    col[i3 + 1] = 0.5;
                                    col[i3 + 2] = 0.0;
                                } else if (targetPositions.length > 0) {
                                    pos[i3] += (targetPositions[i3] - pos[i3]) * 0.12 + vx;
                                    pos[i3 + 1] += (targetPositions[i3 + 1] - pos[i3 + 1]) * 0.12 + vy;
                                    pos[i3 + 2] += (targetPositions[i3 + 2] - pos[i3 + 2]) * 0.12;
                                    col[i3] = currentTextColor.r;
                                    col[i3 + 1] = currentTextColor.g;
                                    col[i3 + 2] = currentTextColor.b;
                                } else {
                                    pos[i3] += (init[i3] - pos[i3]) * 0.05 + vx;
                                    pos[i3 + 1] += (init[i3 + 1] - pos[i3 + 1]) * 0.05 + vy;
                                    pos[i3 + 2] += (init[i3 + 2] - pos[i3 + 2]) * 0.05;
                                    col[i3] = 0.1;
                                    col[i3 + 1] = 0.4;
                                    col[i3 + 2] = 1.0;
                                }
                            }
                            particleSystem.geometry.attributes.position.needsUpdate = true;
                            particleSystem.geometry.attributes.color.needsUpdate = true;
                            renderer.render(scene, camera);
                        }
                    }["HandGestureVisualizer.useEffect.initThree.animate"];
                    animate();
                    const handleResize = {
                        "HandGestureVisualizer.useEffect.initThree.handleResize": ()=>{
                            camera.aspect = window.innerWidth / window.innerHeight;
                            camera.updateProjectionMatrix();
                            renderer.setSize(window.innerWidth, window.innerHeight);
                        }
                    }["HandGestureVisualizer.useEffect.initThree.handleResize"];
                    window.addEventListener("resize", handleResize);
                    return ({
                        "HandGestureVisualizer.useEffect.initThree": ()=>window.removeEventListener("resize", handleResize)
                    })["HandGestureVisualizer.useEffect.initThree"];
                }
            }["HandGestureVisualizer.useEffect.initThree"];
            const onResults = {
                "HandGestureVisualizer.useEffect.onResults": (results)=>{
                    let fL = -1, fR = -1;
                    if (results.multiHandLandmarks && results.multiHandedness) {
                        results.multiHandLandmarks.forEach({
                            "HandGestureVisualizer.useEffect.onResults": (landmarks, index)=>{
                                const label = results.multiHandedness[index].label;
                                const fingers = countFingers(landmarks, label);
                                if (label === "Left") {
                                    fL = fingers;
                                    vHandL.x = -(landmarks[9].x - 0.5) * 20;
                                    vHandL.y = -(landmarks[9].y - 0.5) * 16;
                                    vHandL.z = -landmarks[9].z * 10;
                                } else {
                                    fR = fingers;
                                    vHandR.x = -(landmarks[9].x - 0.5) * 20;
                                    vHandR.y = -(landmarks[9].y - 0.5) * 16;
                                    vHandR.z = -landmarks[9].z * 10;
                                }
                            }
                        }["HandGestureVisualizer.useEffect.onResults"]);
                        // Ambas manos cerradas = corazón latiendo
                        if (fL === 0 && fR === 0) {
                            heartMode = true;
                            sphereMode = "none";
                            explosionMode = false;
                            setStatus({
                                text: "❤️ CORAZÓN LATIENDO",
                                color: "#ff3366"
                            });
                            setCurrentGesture("heart");
                        } else if (fL === 0 && fR === 5) {
                            sphereMode = "right";
                            heartMode = false;
                            explosionMode = false;
                            setStatus({
                                text: "🔮 ESFERA DERECHA",
                                color: "#00ffcc"
                            });
                            setCurrentGesture("sphere-right");
                        } else if (fL === 5 && fR === 0) {
                            sphereMode = "left";
                            heartMode = false;
                            explosionMode = false;
                            setStatus({
                                text: "🔮 ESFERA IZQUIERDA",
                                color: "#00ffcc"
                            });
                            setCurrentGesture("sphere-left");
                        } else if (fL === 5 && fR === 5) {
                            explosionMode = true;
                            sphereMode = "none";
                            heartMode = false;
                            setStatus({
                                text: "💥 EXPLOSIÓN",
                                color: "#ff8800"
                            });
                            setCurrentGesture("explosion");
                        } else {
                            sphereMode = "none";
                            heartMode = false;
                            explosionMode = false;
                            const maxF = Math.max(fL, fR);
                            if (maxF >= 1 && maxF <= 5) {
                                if (currentTextIndex !== maxF - 1) {
                                    currentTextIndex = maxF - 1;
                                    createTextTarget(messages[currentTextIndex]);
                                }
                                setStatus({
                                    text: `✨ ${messages[currentTextIndex]}`,
                                    color: "#ffffff"
                                });
                                setCurrentGesture(`text-${maxF}`);
                            } else {
                                targetPositions = [];
                                currentTextIndex = -1;
                                setStatus({
                                    text: "👋 MUESTRA TUS MANOS",
                                    color: "#00ff00"
                                });
                                setCurrentGesture(null);
                            }
                        }
                    } else {
                        // No hay manos detectadas
                        sphereMode = "none";
                        heartMode = false;
                        explosionMode = false;
                        targetPositions = [];
                        currentTextIndex = -1;
                        setStatus({
                            text: "👋 MUESTRA TUS MANOS",
                            color: "#00ff00"
                        });
                        setCurrentGesture(null);
                    }
                }
            }["HandGestureVisualizer.useEffect.onResults"];
            const init = {
                "HandGestureVisualizer.useEffect.init": async ()=>{
                    try {
                        await loadScripts();
                        setIsLoading(false);
                        setStatus({
                            text: "Iniciando cámara...",
                            color: "#ffffff"
                        });
                        initThree();
                        const hands = new window.Hands({
                            locateFile: {
                                "HandGestureVisualizer.useEffect.init": (file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                            }["HandGestureVisualizer.useEffect.init"]
                        });
                        hands.setOptions({
                            maxNumHands: 2,
                            modelComplexity: 1,
                            minDetectionConfidence: 0.7,
                            minTrackingConfidence: 0.7
                        });
                        hands.onResults(onResults);
                        if (videoRef.current) {
                            const cam = new window.Camera(videoRef.current, {
                                onFrame: {
                                    "HandGestureVisualizer.useEffect.init": async ()=>{
                                        if (videoRef.current) {
                                            await hands.send({
                                                image: videoRef.current
                                            });
                                        }
                                    }
                                }["HandGestureVisualizer.useEffect.init"],
                                width: 1280,
                                height: 720
                            });
                            cam.start();
                        }
                    } catch (error) {
                        console.error("Error initializing:", error);
                        setStatus({
                            text: "Error al iniciar",
                            color: "#ff0000"
                        });
                    }
                }
            }["HandGestureVisualizer.useEffect.init"];
            init();
            return ({
                "HandGestureVisualizer.useEffect": ()=>{
                    if (renderer) {
                        renderer.dispose();
                        renderer.domElement?.remove();
                    }
                }
            })["HandGestureVisualizer.useEffect"];
        }
    }["HandGestureVisualizer.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-screen h-screen overflow-hidden bg-black",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: videoRef,
                autoPlay: true,
                playsInline: true,
                muted: true,
                className: "fixed top-0 left-0 w-full h-full object-cover scale-x-[-1] z-[1] brightness-[0.6] contrast-[1.3]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 424,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "hidden"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 433,
                columnNumber: 7
            }, this),
            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 z-50 flex items-center justify-center bg-black",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-14 h-14 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-5"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 439,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-white text-lg font-normal tracking-wide",
                            children: "Cargando..."
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 440,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 438,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 437,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 z-10 pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-mono text-base uppercase tracking-wider font-semibold",
                        style: {
                            color: status.color,
                            textShadow: `0 0 10px ${status.color}`
                        },
                        children: status.text
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 448,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 447,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 446,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setShowGuide(!showGuide),
                className: "absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200 shadow-lg",
                children: showGuide ? "Ocultar Guia" : "Mostrar Guia"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 458,
                columnNumber: 7
            }, this),
            showGuide && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$gesture$2d$guide$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GestureGuide"], {
                currentGesture: currentGesture
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 466,
                columnNumber: 21
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 422,
        columnNumber: 5
    }, this);
}
_s(HandGestureVisualizer, "sq8DAiyJthSQRC3sLlsEHOcJHMs=");
_c = HandGestureVisualizer;
var _c;
__turbopack_context__.k.register(_c, "HandGestureVisualizer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_d53e48dd._.js.map