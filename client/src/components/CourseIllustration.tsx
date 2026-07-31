/**
 * CourseIllustration — contextual SVG illustrations for sparse course screens.
 * Picks an illustration based on keywords found in the screen title/content.
 */

import React from "react";

// ─── Keyword → theme mapping ──────────────────────────────────────────────────
type IllustrationTheme =
  | "ai_learning"
  | "data"
  | "agent"
  | "brain"
  | "network"
  | "code"
  | "workflow"
  | "document"
  | "search"
  | "security"
  | "cloud"
  | "chart"
  | "robot"
  | "lightbulb"
  | "conversation"
  | "key_takeaways"
  | "module_complete"
  | "default";

const KEYWORD_MAP: { keywords: string[]; theme: IllustrationTheme }[] = [
  { keywords: ["points clés", "key takeaway", "key point", "retenir", "résumé", "summary", "recap", "récapitulatif", "conclusion", "ce que vous avez appris", "what you learned"], theme: "key_takeaways" },
  { keywords: ["module terminé", "module complete", "félicitations", "congratulation", "bravo", "well done", "complété", "completed", "next module", "prochain module", "you\'ve finished", "vous avez terminé"], theme: "module_complete" },
  { keywords: ["learn", "apprend", "example", "exemple", "child", "enfant", "training", "formation", "teach", "enseign"], theme: "ai_learning" },
  { keywords: ["data", "donnée", "dataset", "base de données", "database", "embedding", "vector", "token"], theme: "data" },
  { keywords: ["agent", "autonome", "autonomous", "multi-agent", "agentic", "tool use", "outils"], theme: "agent" },
  { keywords: ["brain", "cerveau", "think", "pens", "reason", "raisonn", "cognit", "intelligence"], theme: "brain" },
  { keywords: ["network", "réseau", "neural", "neuron", "connect", "graph"], theme: "network" },
  { keywords: ["code", "program", "développ", "develop", "api", "sdk", "function", "script", "prompt engineer"], theme: "code" },
  { keywords: ["workflow", "process", "processus", "pipeline", "bpmn", "flow", "étape", "step"], theme: "workflow" },
  { keywords: ["document", "text", "texte", "read", "lire", "pdf", "rag", "retrieval", "knowledge", "connaissance"], theme: "document" },
  { keywords: ["search", "cherch", "find", "trouv", "query", "requête", "semantic"], theme: "search" },
  { keywords: ["security", "sécurité", "safe", "sûr", "privacy", "confidential", "protect"], theme: "security" },
  { keywords: ["cloud", "deploy", "déploi", "bedrock", "vertex", "server", "serveur", "infrastructure"], theme: "cloud" },
  { keywords: ["chart", "graph", "analytic", "analys", "metric", "mesure", "kpi", "dashboard"], theme: "chart" },
  { keywords: ["robot", "automat", "replac", "remplac", "machine", "model", "modèle"], theme: "robot" },
  { keywords: ["idea", "idée", "innovat", "creat", "créat", "insight", "discover", "découvr"], theme: "lightbulb" },
  { keywords: ["chat", "convers", "dialog", "message", "prompt", "response", "réponse", "interact"], theme: "conversation" },
];

function detectTheme(title: string, content: string): IllustrationTheme {
  const combined = (title + " " + content).toLowerCase();
  for (const { keywords, theme } of KEYWORD_MAP) {
    if (keywords.some((kw) => combined.includes(kw))) return theme;
  }
  return "default";
}

// ─── SVG Illustrations ────────────────────────────────────────────────────────

const illustrations: Record<IllustrationTheme, React.ReactNode> = {
  ai_learning: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background glow */}
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow1)" opacity="0.3" />
      {/* Child figure */}
      <circle cx="80" cy="90" r="22" fill="#f0e6d3" stroke="#c75b3a" strokeWidth="1.5" />
      <rect x="65" y="114" width="30" height="40" rx="8" fill="#c75b3a" opacity="0.8" />
      <line x1="65" y1="130" x2="50" y2="148" stroke="#c75b3a" strokeWidth="3" strokeLinecap="round" />
      <line x1="95" y1="130" x2="110" y2="148" stroke="#c75b3a" strokeWidth="3" strokeLinecap="round" />
      <line x1="72" y1="154" x2="68" y2="175" stroke="#c75b3a" strokeWidth="3" strokeLinecap="round" />
      <line x1="88" y1="154" x2="92" y2="175" stroke="#c75b3a" strokeWidth="3" strokeLinecap="round" />
      {/* Brain/AI figure */}
      <circle cx="240" cy="90" r="28" fill="#e8f4fd" stroke="#3b82f6" strokeWidth="1.5" />
      <path d="M228 85 Q240 72 252 85 Q260 95 252 105 Q240 115 228 105 Q220 95 228 85Z" fill="#3b82f6" opacity="0.15" />
      <path d="M232 88 Q240 80 248 88" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M230 95 Q240 102 250 95" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="236" cy="91" r="2" fill="#3b82f6" />
      <circle cx="244" cy="91" r="2" fill="#3b82f6" />
      {/* Connection arrows with examples */}
      <path d="M108 100 L200 100" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="5,4" markerEnd="url(#arrow1)" />
      {/* Example bubbles */}
      <rect x="125" y="55" width="70" height="28" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
      <text x="160" y="66" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="600">EXAMPLE 1</text>
      <text x="160" y="76" textAnchor="middle" fontSize="7" fill="#92400e">Cat → Cat</text>
      <rect x="125" y="130" width="70" height="28" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
      <text x="160" y="141" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="600">EXAMPLE 2</text>
      <text x="160" y="151" textAnchor="middle" fontSize="7" fill="#92400e">Dog → Dog</text>
      {/* Arrows from examples to AI */}
      <path d="M195 69 L215 82" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
      <path d="M195 144 L215 100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
      {/* Labels */}
      <text x="80" y="195" textAnchor="middle" fontSize="9" fill="#6b7280">Humain</text>
      <text x="240" y="195" textAnchor="middle" fontSize="9" fill="#6b7280">IA</text>
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
        </marker>
      </defs>
    </svg>
  ),

  data: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_data)" opacity="0.2" />
      {/* Database cylinders */}
      {[60, 130, 200].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy="80" rx="28" ry="10" fill={["#3b82f6", "#8b5cf6", "#10b981"][i]} opacity="0.8" />
          <rect x={x - 28} y="80" width="56" height="50" fill={["#3b82f6", "#8b5cf6", "#10b981"][i]} opacity="0.5" />
          <ellipse cx={x} cy="130" rx="28" ry="10" fill={["#2563eb", "#7c3aed", "#059669"][i]} opacity="0.8" />
          <text x={x} y="108" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">{["RAW", "CLEAN", "EMBED"][i]}</text>
        </g>
      ))}
      {/* Arrows between */}
      <path d="M90 105 L100 105" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arr_data)" />
      <path d="M160 105 L170 105" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arr_data)" />
      {/* Flow label */}
      <text x="160" y="175" textAnchor="middle" fontSize="10" fill="#6b7280">Pipeline de données</text>
      <defs>
        <radialGradient id="glow_data" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <marker id="arr_data" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
        </marker>
      </defs>
    </svg>
  ),

  agent: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_agent)" opacity="0.2" />
      {/* Central agent */}
      <circle cx="160" cy="100" r="36" fill="#1e1b4b" />
      <circle cx="160" cy="100" r="30" fill="#312e81" />
      <text x="160" y="96" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontWeight="700">AGENT</text>
      <text x="160" y="110" textAnchor="middle" fontSize="8" fill="#818cf8">Autonome</text>
      {/* Tool nodes */}
      {[
        { x: 60, y: 55, label: "Search", color: "#f59e0b" },
        { x: 260, y: 55, label: "Code", color: "#10b981" },
        { x: 60, y: 155, label: "Memory", color: "#ef4444" },
        { x: 260, y: 155, label: "API", color: "#3b82f6" },
      ].map(({ x, y, label, color }, i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="22" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">{label}</text>
          <line x1={x > 160 ? x - 22 : x + 22} y1={y} x2={x > 160 ? 192 : 128} y2={y < 100 ? 78 : 122} stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.7" />
        </g>
      ))}
      <defs>
        <radialGradient id="glow_agent" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  brain: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_brain)" opacity="0.2" />
      {/* Brain outline */}
      <path d="M160 50 C120 50 90 70 85 100 C80 125 95 145 110 155 C125 165 140 168 160 168 C180 168 195 165 210 155 C225 145 240 125 235 100 C230 70 200 50 160 50Z" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" />
      {/* Brain fold lines */}
      <path d="M130 80 Q145 90 140 105 Q135 120 150 130" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M190 80 Q175 90 180 105 Q185 120 170 130" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M110 110 Q130 105 140 115" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M210 110 Q190 105 180 115" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Neural sparks */}
      {[
        { x: 125, y: 75 }, { x: 195, y: 75 }, { x: 105, y: 115 }, { x: 215, y: 115 },
        { x: 145, y: 145 }, { x: 175, y: 145 }, { x: 160, y: 65 },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ec4899" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Raisonnement IA</text>
      <defs>
        <radialGradient id="glow_brain" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  network: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_net)" opacity="0.15" />
      {/* Nodes */}
      {[
        { x: 160, y: 60, r: 14, color: "#3b82f6" },
        { x: 80, y: 100, r: 10, color: "#8b5cf6" },
        { x: 240, y: 100, r: 10, color: "#8b5cf6" },
        { x: 60, y: 155, r: 8, color: "#10b981" },
        { x: 130, y: 160, r: 8, color: "#10b981" },
        { x: 190, y: 160, r: 8, color: "#10b981" },
        { x: 260, y: 155, r: 8, color: "#10b981" },
      ].map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity="0.8" />
      ))}
      {/* Edges */}
      {[
        [160, 60, 80, 100], [160, 60, 240, 100],
        [80, 100, 60, 155], [80, 100, 130, 160],
        [240, 100, 190, 160], [240, 100, 260, 155],
        [80, 100, 240, 100],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth="1.5" opacity="0.5" />
      ))}
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Réseau de neurones</text>
      <defs>
        <radialGradient id="glow_net" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  code: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="40" y="40" width="240" height="150" rx="12" fill="#0f172a" />
      <rect x="40" y="40" width="240" height="28" rx="12" fill="#1e293b" />
      <circle cx="62" cy="54" r="5" fill="#ef4444" />
      <circle cx="78" cy="54" r="5" fill="#f59e0b" />
      <circle cx="94" cy="54" r="5" fill="#10b981" />
      {/* Code lines */}
      <text x="58" y="88" fontSize="10" fill="#7dd3fc" fontFamily="monospace">import anthropic</text>
      <text x="58" y="104" fontSize="10" fill="#a78bfa" fontFamily="monospace">client = Anthropic()</text>
      <text x="58" y="120" fontSize="10" fill="#6b7280" fontFamily="monospace">{"# Appel API"}</text>
      <text x="58" y="136" fontSize="10" fill="#86efac" fontFamily="monospace">message = client</text>
      <text x="58" y="152" fontSize="10" fill="#86efac" fontFamily="monospace">  .messages.create(</text>
      <text x="58" y="168" fontSize="10" fill="#fbbf24" fontFamily="monospace">    model="claude-..."</text>
      {/* Cursor blink */}
      <rect x="58" y="175" width="6" height="10" fill="#e2e8f0" opacity="0.8" />
    </svg>
  ),

  workflow: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_wf)" opacity="0.15" />
      {/* Start event */}
      <circle cx="50" cy="110" r="16" fill="#10b981" opacity="0.9" />
      <circle cx="50" cy="110" r="10" fill="white" opacity="0.5" />
      {/* Tasks */}
      {[{ x: 120, label: "Saisie", color: "#3b82f6" }, { x: 190, label: "Traitement", color: "#8b5cf6" }, { x: 260, label: "Validation", color: "#f59e0b" }].map(({ x, label, color }, i) => (
        <g key={i}>
          <rect x={x - 30} y="94" width="60" height="32" rx="6" fill={color} opacity="0.8" />
          <text x={x} y="114" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">{label}</text>
        </g>
      ))}
      {/* End event */}
      <circle cx="50" cy="110" r="16" fill="#10b981" opacity="0.9" />
      <circle cx="50" cy="110" r="10" fill="white" opacity="0.5" />
      {/* Arrows */}
      {[[66, 90], [150, 190], [220, 230]].map(([x1, x2], i) => (
        <path key={i} d={`M${x1} 110 L${x2} 110`} stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arr_wf)" />
      ))}
      {/* AI badge on middle task */}
      <rect x="172" y="82" width="36" height="14" rx="4" fill="#8b5cf6" />
      <text x="190" y="92" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">IA ✦</text>
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Processus BPMN augmenté</text>
      <defs>
        <radialGradient id="glow_wf" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <marker id="arr_wf" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
        </marker>
      </defs>
    </svg>
  ),

  document: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_doc)" opacity="0.15" />
      {/* Document stack */}
      {[{ x: 75, y: 55, rot: -8 }, { x: 80, y: 50, rot: -3 }, { x: 85, y: 45, rot: 0 }].map(({ x, y, rot }, i) => (
        <g key={i} transform={`rotate(${rot}, ${x + 45}, ${y + 60})`}>
          <rect x={x} y={y} width="90" height="115" rx="6" fill={i === 2 ? "white" : "#f1f5f9"} stroke="#cbd5e1" strokeWidth="1" />
          {i === 2 && (
            <>
              <line x1={x + 12} y1={y + 25} x2={x + 78} y2={y + 25} stroke="#94a3b8" strokeWidth="2" />
              <line x1={x + 12} y1={y + 38} x2={x + 78} y2={y + 38} stroke="#94a3b8" strokeWidth="2" />
              <line x1={x + 12} y1={y + 51} x2={x + 60} y2={y + 51} stroke="#94a3b8" strokeWidth="2" />
              <line x1={x + 12} y1={y + 64} x2={x + 72} y2={y + 64} stroke="#94a3b8" strokeWidth="2" />
            </>
          )}
        </g>
      ))}
      {/* Search/embed arrow */}
      <path d="M185 100 L230 100" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arr_doc)" />
      {/* Vector representation */}
      <rect x="235" y="75" width="50" height="55" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="260" y="95" textAnchor="middle" fontSize="7" fill="#3b82f6" fontWeight="600">VECTOR</text>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={240 + i * 10} y="100" width="6" height={15 + Math.sin(i * 1.5) * 8} rx="2" fill="#3b82f6" opacity="0.7" />
      ))}
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">RAG — Retrieval Augmented Generation</text>
      <defs>
        <radialGradient id="glow_doc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <marker id="arr_doc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6" />
        </marker>
      </defs>
    </svg>
  ),

  search: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_srch)" opacity="0.15" />
      {/* Search glass */}
      <circle cx="145" cy="100" r="50" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
      <circle cx="145" cy="100" r="36" fill="white" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="183" y1="138" x2="215" y2="170" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      {/* Semantic dots inside */}
      {[
        { x: 135, y: 90, c: "#3b82f6" }, { x: 155, y: 88, c: "#8b5cf6" },
        { x: 145, y: 108, c: "#10b981" }, { x: 128, y: 112, c: "#f59e0b" },
        { x: 162, y: 110, c: "#ef4444" },
      ].map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="5" fill={d.c} opacity="0.8" />
      ))}
      {/* Similarity lines */}
      <line x1="135" y1="90" x2="145" y2="108" stroke="#6b7280" strokeWidth="0.8" opacity="0.5" />
      <line x1="155" y1="88" x2="145" y2="108" stroke="#6b7280" strokeWidth="0.8" opacity="0.5" />
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Recherche sémantique</text>
      <defs>
        <radialGradient id="glow_srch" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  security: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_sec)" opacity="0.15" />
      {/* Shield */}
      <path d="M160 45 L215 68 L215 115 Q215 155 160 175 Q105 155 105 115 L105 68 Z" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
      <path d="M160 60 L202 78 L202 115 Q202 145 160 160 Q118 145 118 115 L118 78 Z" fill="#d1fae5" stroke="#10b981" strokeWidth="1" />
      {/* Check mark */}
      <path d="M140 110 L155 125 L182 95" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">IA sécurisée et éthique</text>
      <defs>
        <radialGradient id="glow_sec" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  cloud: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_cloud)" opacity="0.15" />
      {/* Cloud shape */}
      <path d="M100 130 Q85 130 85 115 Q85 100 100 98 Q98 85 112 82 Q115 68 130 68 Q140 55 155 60 Q168 50 180 60 Q195 58 200 72 Q215 72 218 85 Q230 88 230 102 Q232 118 218 120 L100 130Z" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2" />
      {/* Arrows down */}
      {[120, 160, 200].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 135 L${x} 165`} stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arr_cloud)" />
          <rect x={x - 18} y="165" width="36" height="22" rx="4" fill="#0ea5e9" opacity="0.2" stroke="#0ea5e9" strokeWidth="1" />
          <text x={x} y="180" textAnchor="middle" fontSize="7" fill="#0369a1" fontWeight="600">{["API", "SDK", "CLI"][i]}</text>
        </g>
      ))}
      <text x="160" y="205" textAnchor="middle" fontSize="10" fill="#6b7280">Déploiement Cloud</text>
      <defs>
        <radialGradient id="glow_cloud" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <marker id="arr_cloud" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#0ea5e9" />
        </marker>
      </defs>
    </svg>
  ),

  chart: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="50" y="40" width="220" height="145" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
      {/* Grid lines */}
      {[60, 80, 100, 120, 140].map((y, i) => (
        <line key={i} x1="80" y1={y + 30} x2="255" y2={y + 30} stroke="#f1f5f9" strokeWidth="1" />
      ))}
      {/* Bars */}
      {[
        { x: 95, h: 80, color: "#3b82f6" },
        { x: 130, h: 110, color: "#8b5cf6" },
        { x: 165, h: 65, color: "#10b981" },
        { x: 200, h: 130, color: "#f59e0b" },
        { x: 235, h: 95, color: "#ef4444" },
      ].map(({ x, h, color }, i) => (
        <g key={i}>
          <rect x={x - 14} y={170 - h} width="28" height={h} rx="4" fill={color} opacity="0.8" />
        </g>
      ))}
      {/* Axes */}
      <line x1="80" y1="170" x2="260" y2="170" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="80" y1="60" x2="80" y2="170" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Trend line */}
      <path d="M95 135 L130 105 L165 125 L200 80 L235 100" stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="5,3" />
      <text x="160" y="205" textAnchor="middle" fontSize="10" fill="#6b7280">Métriques et performance IA</text>
    </svg>
  ),

  robot: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_robot)" opacity="0.15" />
      {/* Robot body */}
      <rect x="120" y="90" width="80" height="70" rx="10" fill="#1e293b" />
      {/* Head */}
      <rect x="130" y="55" width="60" height="45" rx="8" fill="#334155" />
      {/* Eyes */}
      <circle cx="148" cy="72" r="8" fill="#0ea5e9" />
      <circle cx="172" cy="72" r="8" fill="#0ea5e9" />
      <circle cx="148" cy="72" r="4" fill="white" />
      <circle cx="172" cy="72" r="4" fill="white" />
      {/* Antenna */}
      <line x1="160" y1="55" x2="160" y2="40" stroke="#64748b" strokeWidth="2" />
      <circle cx="160" cy="38" r="5" fill="#f59e0b" />
      {/* Mouth */}
      <rect x="143" y="88" width="34" height="6" rx="3" fill="#0ea5e9" opacity="0.6" />
      {/* Arms */}
      <rect x="90" y="95" width="28" height="14" rx="6" fill="#334155" />
      <rect x="202" y="95" width="28" height="14" rx="6" fill="#334155" />
      {/* Chest panel */}
      <rect x="132" y="102" width="56" height="40" rx="6" fill="#0f172a" />
      <circle cx="148" cy="118" r="6" fill="#10b981" opacity="0.8" />
      <circle cx="172" cy="118" r="6" fill="#3b82f6" opacity="0.8" />
      <rect x="136" y="130" width="48" height="6" rx="2" fill="#334155" />
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Automatisation IA</text>
      <defs>
        <radialGradient id="glow_robot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  lightbulb: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_lb)" opacity="0.2" />
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 160 + Math.cos(rad) * 55;
        const y1 = 95 + Math.sin(rad) * 55;
        const x2 = 160 + Math.cos(rad) * 72;
        const y2 = 95 + Math.sin(rad) * 72;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />;
      })}
      {/* Bulb */}
      <path d="M160 45 C135 45 118 62 118 82 C118 100 130 112 135 120 L135 135 L185 135 L185 120 C190 112 202 100 202 82 C202 62 185 45 160 45Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      {/* Filament */}
      <path d="M145 125 Q152 115 160 120 Q168 125 175 115" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Base */}
      <rect x="140" y="135" width="40" height="8" rx="2" fill="#d97706" />
      <rect x="143" y="143" width="34" height="8" rx="2" fill="#b45309" />
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Innovation & créativité IA</text>
      <defs>
        <radialGradient id="glow_lb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  conversation: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_conv)" opacity="0.15" />
      {/* User bubble */}
      <rect x="50" y="55" width="140" height="48" rx="16" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M80 103 L68 118 L96 103" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="120" y="76" textAnchor="middle" fontSize="8" fill="#475569">Quelle est la capitale</text>
      <text x="120" y="90" textAnchor="middle" fontSize="8" fill="#475569">de la France ?</text>
      {/* AI bubble */}
      <rect x="130" y="125" width="140" height="48" rx="16" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
      <path d="M240 125 L252 110 L224 125" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
      <text x="200" y="146" textAnchor="middle" fontSize="8" fill="#1d4ed8">La capitale de la France</text>
      <text x="200" y="160" textAnchor="middle" fontSize="8" fill="#1d4ed8">est Paris. ✓</text>
      {/* Claude badge */}
      <circle cx="278" cy="149" r="12" fill="#3b82f6" />
      <text x="278" y="153" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">C</text>
      <text x="160" y="200" textAnchor="middle" fontSize="10" fill="#6b7280">Dialogue Humain–IA</text>
      <defs>
        <radialGradient id="glow_conv" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  key_takeaways: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_kt)" opacity="0.15" />
      {/* Notebook */}
      <rect x="90" y="45" width="140" height="130" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="90" y="45" width="20" height="130" rx="4" fill="#e2e8f0" />
      {/* Spiral binding */}
      {[65, 85, 105, 125, 145, 165].map((y, i) => (
        <circle key={i} cx="100" cy={y} r="4" fill="#94a3b8" />
      ))}
      {/* Lines */}
      {[80, 100, 120, 140, 150].map((y, i) => (
        <line key={i} x1="125" y1={y} x2="215" y2={y} stroke="#e2e8f0" strokeWidth="1.5" />
      ))}
      {/* Checkmarks */}
      <path d="M128 78 L133 83 L142 72" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128 98 L133 103 L142 92" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128 118 L133 123 L142 112" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Text lines */}
      <rect x="148" y="74" width="55" height="7" rx="3" fill="#94a3b8" opacity="0.6" />
      <rect x="148" y="94" width="45" height="7" rx="3" fill="#94a3b8" opacity="0.6" />
      <rect x="148" y="114" width="50" height="7" rx="3" fill="#94a3b8" opacity="0.6" />
      {/* Star badge */}
      <circle cx="230" cy="55" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      <path d="M230 40 L233 50 L244 50 L235 57 L238 68 L230 61 L222 68 L225 57 L216 50 L227 50 Z" fill="#f59e0b" />
      <text x="160" y="200" textAnchor="middle" fontSize="10" fill="#6b7280">Points clés retenus</text>
      <defs>
        <radialGradient id="glow_kt" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  module_complete: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_mc)" opacity="0.2" />
      {/* Trophy */}
      <path d="M130 60 L190 60 L185 110 Q160 130 135 110 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      {/* Trophy handles */}
      <path d="M130 70 Q108 70 108 90 Q108 108 130 108" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M190 70 Q212 70 212 90 Q212 108 190 108" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Trophy base */}
      <rect x="148" y="128" width="24" height="18" rx="2" fill="#d97706" />
      <rect x="138" y="146" width="44" height="10" rx="4" fill="#b45309" />
      {/* Star in trophy */}
      <path d="M160 75 L163 84 L173 84 L165 90 L168 99 L160 93 L152 99 L155 90 L147 84 L157 84 Z" fill="#f59e0b" />
      {/* Confetti */}
      {[
        { x: 80, y: 55, color: "#ef4444", rot: 20 },
        { x: 240, y: 60, color: "#3b82f6", rot: -15 },
        { x: 70, y: 140, color: "#8b5cf6", rot: 40 },
        { x: 250, y: 145, color: "#10b981", rot: -30 },
        { x: 100, y: 45, color: "#f59e0b", rot: 10 },
        { x: 220, y: 40, color: "#ec4899", rot: -20 },
      ].map(({ x, y, color, rot }, i) => (
        <rect key={i} x={x - 5} y={y - 3} width="10" height="6" rx="1" fill={color} opacity="0.7"
          transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Module terminé !</text>
      <defs>
        <radialGradient id="glow_mc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),

  default: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#glow_def)" opacity="0.15" />
      {/* Abstract AI constellation */}
      {[
        { x: 160, y: 80, r: 18, color: "#3b82f6" },
        { x: 100, y: 120, r: 12, color: "#8b5cf6" },
        { x: 220, y: 120, r: 12, color: "#8b5cf6" },
        { x: 130, y: 160, r: 9, color: "#10b981" },
        { x: 190, y: 160, r: 9, color: "#10b981" },
      ].map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity="0.2" stroke={n.color} strokeWidth="1.5" />
      ))}
      {[
        [160, 80, 100, 120], [160, 80, 220, 120],
        [100, 120, 130, 160], [220, 120, 190, 160],
        [100, 120, 220, 120],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth="1" opacity="0.4" strokeDasharray="4,3" />
      ))}
      <text x="160" y="80" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="700">IA</text>
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#6b7280">Intelligence Artificielle</text>
      <defs>
        <radialGradient id="glow_def" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface CourseIllustrationProps {
  title: string;
  content?: string;
  className?: string;
}

export function CourseIllustration({ title, content = "", className = "" }: CourseIllustrationProps) {
  const theme = detectTheme(title, content);
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {illustrations[theme]}
    </div>
  );
}

export { detectTheme };
