#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/training-visual-manifest.json"), "utf8"));
const outputDir = "/home/ubuntu/webdev-static-assets/training-cards/rendered";
const illustrationDir = "/home/ubuntu/webdev-static-assets/training-cards/illustrations-v2";
const htmlDir = "/tmp/neopolis-training-visual-html";
const logoPath = "file:///home/ubuntu/webdev-static-assets/training-cards/neopolis-akademy-official-logo.svg";
const chromium = "/usr/bin/chromium";

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(htmlDir, { recursive: true });

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hash(value) {
  return [...value].reduce((total, char) => ((total << 5) - total + char.charCodeAt(0)) | 0, 0) >>> 0;
}

function visualProfile(training) {
  const source = `${training.title} ${training.description}`.toLowerCase();
  if (/finance|finops|comptable|accounting/.test(source)) {
    if (/finops|cost|coût|budget/.test(source)) return { motif: "finance", kind: "cost", label: "Coûts IA", icon: "¤" };
    if (/comptable|accounting|facture|invoice/.test(source)) return { motif: "finance", kind: "ledger", label: "Comptabilité", icon: "▤" };
    return { motif: "finance", kind: "market", label: "Finance", icon: "↗" };
  }
  if (/donn|data|reporting|bi |analytics|analyst/.test(source)) {
    if (/sql|database|base de données|warehouse|databricks/.test(source)) return { motif: "data", kind: "database", label: "Données", icon: "▥" };
    if (/python|machine learning|modèle|model|statistique/.test(source)) return { motif: "data", kind: "model", label: "Modèles", icon: "∿" };
    if (/excel|sheet|tableur/.test(source)) return { motif: "data", kind: "spreadsheet", label: "Tableur", icon: "▦" };
    return { motif: "data", kind: "dashboard", label: "Analyse", icon: "▥" };
  }
  if (/workflow|automatisation|automation|n8n/.test(source)) {
    if (/marketing|campaign|campagne|social/.test(source)) return { motif: "workflow", kind: "marketing", label: "Marketing", icon: "✦" };
    if (/onboarding|rh|recrut|collaborateur/.test(source)) return { motif: "workflow", kind: "integration", label: "Intégration", icon: "⌘" };
    return { motif: "workflow", kind: "automation", label: "Workflows", icon: "⌘" };
  }
  if (/gouvernance|governance|compliance|responsible|security|sécurité|red.team/.test(source)) {
    if (/security|sécurité|red.team|attaque|vulnérab/.test(source)) return { motif: "governance", kind: "testing", label: "Sécurité", icon: "◈" };
    if (/compliance|conformité|policy|réglement/.test(source)) return { motif: "governance", kind: "policy", label: "Conformité", icon: "✓" };
    return { motif: "governance", kind: "shield", label: "Gouvernance", icon: "◈" };
  }
  if (/code|software|developer|coding|api|mcp/.test(source)) {
    if (/mcp|tool use|protocol/.test(source)) return { motif: "code", kind: "mcp", label: "MCP", icon: "⌘" };
    if (/api|integration|intégration/.test(source)) return { motif: "code", kind: "api", label: "API", icon: "{}" };
    return { motif: "code", kind: "terminal", label: "Développement", icon: "</>" };
  }
  if (/agent|rag|llm|claude|prompt/.test(source)) {
    if (/rag|knowledge|document|recherche/.test(source)) return { motif: "agent", kind: "rag", label: "Connaissances", icon: "⌕" };
    if (/claude|conversation|prompt/.test(source)) return { motif: "agent", kind: "conversation", label: "Dialogue", icon: "◌" };
    return { motif: "agent", kind: "multiagent", label: "Agents", icon: "◌" };
  }
  if (/marketing|sales|consulting|human resources|rh|métier/.test(source)) return { motif: "people", kind: "people", label: "Métiers", icon: "✦" };
  if (/créativ|design|product|ux/.test(source)) return { motif: "general", kind: "creative", label: "Création", icon: "✦" };
  if (/formation|initiation|fondation/.test(source)) return { motif: "general", kind: "learning", label: "Apprentissage", icon: "✦" };
  return { motif: "general", kind: "work", label: "IA appliquée", icon: "AI" };
}

function visualProfilePriority(training) {
  const title = training.title.toLowerCase();
  const source = `${training.title} ${training.description}`.toLowerCase();
  if (/workflow|automatisation|automation|n8n/.test(title)) {
    if (/marketing|campaign|campagne|social/.test(source)) return { motif: "workflow", kind: "marketing", label: "Marketing", icon: "✦" };
    if (/onboarding|rh|recrut|collaborateur/.test(source)) return { motif: "workflow", kind: "integration", label: "Intégration", icon: "⌘" };
    return { motif: "workflow", kind: "automation", label: "Workflows", icon: "⌘" };
  }
  if (/agent|rag|llm|prompt|claude/.test(title) && !/data|analyst|donn/.test(title)) {
    if (/rag|knowledge|document|recherche/.test(source)) return { motif: "agent", kind: "rag", label: "Connaissances", icon: "⌕" };
    if (/claude|conversation|prompt/.test(source)) return { motif: "agent", kind: "conversation", label: "Dialogue", icon: "◌" };
    return { motif: "agent", kind: "multiagent", label: "Agents", icon: "◌" };
  }
  if (/security|sécurité|red.team|gouvernance|governance|compliance|responsible/.test(title)) {
    if (/security|sécurité|red.team|attaque|vulnérab/.test(source)) return { motif: "governance", kind: "testing", label: "Sécurité", icon: "◈" };
    if (/compliance|conformité|policy|réglement/.test(source)) return { motif: "governance", kind: "policy", label: "Conformité", icon: "✓" };
    return { motif: "governance", kind: "shield", label: "Gouvernance", icon: "◈" };
  }
  if (/code|software|developer|coding|api|mcp/.test(title)) {
    if (/mcp|tool use|protocol/.test(source)) return { motif: "code", kind: "mcp", label: "MCP", icon: "⌘" };
    if (/api|integration|intégration/.test(source)) return { motif: "code", kind: "api", label: "API", icon: "{}" };
    return { motif: "code", kind: "terminal", label: "Développement", icon: "</>" };
  }
  return visualProfile(training);
}

function visualDescription(description) {
  return description
    .replace(/^un cours partenaire formation autorisé\s*/i, "Formation ")
    .replace(/^cours partenaire formation autorisé\s*/i, "Formation ")
    .replace(/^un cours partenaire\s*/i, "Formation ")
    .replace(/\bDataCamp\b/gi, "Neopolis Akademy");
}

function illustrationScene(kind, seed) {
  const bars = [42, 74, 58, 92, 68].map((height, index) => `<span class="bar b${index}" style="--h:${height + ((seed >> (index * 3)) % 17)}%"></span>`).join("");
  const cells = Array.from({ length: 12 }, (_, index) => `<span class="cell c${index}"></span>`).join("");
  const nodes = Array.from({ length: 5 }, (_, index) => `<span class="agent-node a${index}"></span>`).join("");
  const steps = Array.from({ length: 4 }, (_, index) => `<span class="flow-step s${index}"></span>`).join("");
  const score = 48 + (seed % 47);
  switch (kind) {
    case "dashboard": return `<div class="scene dashboard"><div class="mini-screen"><div class="screen-head"></div><div class="bar-chart">${bars}</div><div class="trend-line"></div></div><div class="metric metric-a">${score}%</div><div class="metric metric-b">BI</div></div>`;
    case "database": return `<div class="scene database"><div class="db-stack"><i></i><i></i><i></i></div><div class="query-card">SELECT<span>• • •</span></div><div class="data-dots">${cells}</div></div>`;
    case "model": return `<div class="scene model"><div class="model-grid">${cells}</div><div class="model-wave"></div><div class="model-orbit"><i></i><i></i><i></i></div></div>`;
    case "spreadsheet": return `<div class="scene spreadsheet"><div class="sheet"><div class="sheet-head"></div><div class="sheet-grid">${cells}</div></div><div class="sheet-chart">${bars}</div></div>`;
    case "cost": return `<div class="scene cost"><div class="coin">¤</div><div class="cost-bars">${bars}</div><div class="cost-arrow">↗</div><div class="cost-chip">FinOps</div></div>`;
    case "ledger": return `<div class="scene ledger"><div class="invoice"><b>✓</b><i></i><i></i><i></i><i></i></div><div class="calc"><span>+</span><span>÷</span><span>×</span><span>=</span></div></div>`;
    case "market": return `<div class="scene market"><div class="portfolio-donut"><i></i></div><div class="portfolio-legend"><b></b><b></b><b></b></div><div class="market-line"></div><div class="market-coin">€</div></div>`;
    case "automation": return `<div class="scene automation"><div class="flow-line"></div>${steps}<div class="trigger">⚡</div><div class="flow-label">IF → THEN</div></div>`;
    case "marketing": return `<div class="scene marketing"><div class="megaphone">◢</div><div class="broadcast">✦ ✦ ✦</div><div class="audience"><i></i><i></i><i></i></div></div>`;
    case "integration": return `<div class="scene integration"><div class="plug plug-a"></div><div class="plug plug-b"></div><div class="integration-line"></div><div class="integration-hub">+</div></div>`;
    case "shield": return `<div class="scene shield"><div class="shield-shape">✓</div><div class="shield-ring r1"></div><div class="shield-ring r2"></div><div class="shield-dots">•••</div></div>`;
    case "policy": return `<div class="scene policy"><div class="policy-doc"><b>✓</b><i></i><i></i><i></i></div><div class="policy-seal">✓</div></div>`;
    case "testing": return `<div class="scene testing"><div class="target"><i></i><i></i><i></i></div><div class="testing-shield">◈</div><div class="testing-scan"></div></div>`;
    case "terminal": return `<div class="scene terminal"><div class="terminal-box"><b>›_</b><i></i><i></i><i></i><i></i></div><div class="terminal-cursor"></div></div>`;
    case "api": return `<div class="scene api"><div class="api-brace">{ }</div><div class="api-packet p1"></div><div class="api-packet p2"></div><div class="api-packet p3"></div></div>`;
    case "mcp": return `<div class="scene mcp"><div class="mcp-core">MCP</div><div class="mcp-port p1"></div><div class="mcp-port p2"></div><div class="mcp-port p3"></div><div class="mcp-port p4"></div></div>`;
    case "rag": return `<div class="scene rag"><div class="rag-doc"><i></i><i></i><i></i></div><div class="rag-search">⌕</div><div class="rag-graph">${nodes}</div></div>`;
    case "conversation": return `<div class="scene conversation"><div class="bubble b-one">?</div><div class="bubble b-two">✦</div><div class="bubble b-three">AI</div></div>`;
    case "multiagent": return `<div class="scene multiagent"><div class="agent-core">AI</div><div class="agent-links"></div>${nodes}</div>`;
    case "people": return `<div class="scene people"><div class="person p1"></div><div class="person p2"></div><div class="person p3"></div><div class="people-link"></div></div>`;
    case "creative": return `<div class="scene creative"><div class="creative-spark">✦</div><div class="creative-card c1"></div><div class="creative-card c2"></div><div class="creative-card c3"></div></div>`;
    case "learning": return `<div class="scene learning"><div class="book book-a"></div><div class="book book-b"></div><div class="cap">◆</div><div class="learning-orbit"></div></div>`;
    default: return `<div class="scene work"><div class="work-board">${cells}</div><div class="work-star">✦</div><div class="work-path"></div></div>`;
  }
}

function subjectVisual(training) {
  const { motif, kind, icon, label } = visualProfilePriority(training);
  const seed = hash(training.id);
  const accents = [["#1767b6", "#3aa4ad"], ["#2d7194", "#53b1ae"], ["#285e9c", "#7298ce"], ["#714dba", "#4e9ed7"], ["#136d7e", "#55a1bd"], ["#a36128", "#dfaa50"]];
  const [accent, accentTwo] = accents[seed % accents.length];
  const rotation = [-7, -3, 2, 5][seed % 4];
  const illustrationPath = path.join(illustrationDir, `${training.id}.png`);
  const uniqueIllustration = fs.existsSync(illustrationPath)
    ? `<img class="unique-illustration" src="file://${encodeURI(illustrationPath)}" alt="">`
    : illustrationScene(kind, seed);
  return `<div class="illustration ${motif} kind-${kind} v${seed % 4}" style="--accent:${accent};--accent-two:${accentTwo};--rotate:${rotation}deg"><div class="scene-surface"></div>${uniqueIllustration}<div class="subject-card"><span class="subject-icon">${icon}</span><span>${label}</span></div><div class="subject-caption">${escapeHtml(training.subjectHint.slice(0, 42))}</div></div><style>${SCENE_CSS}${EXTRA_SCENE_CSS}</style>`;
}

const SCENE_CSS = `
.illustration{background:linear-gradient(145deg,#fbffff 2%,color-mix(in srgb,var(--accent) 12%,#eaf5f7) 55%,#eef3ff)!important}.scene-surface{position:absolute;inset:0;background:radial-gradient(circle at 19% 78%,color-mix(in srgb,var(--accent-two) 17%,transparent),transparent 35%),radial-gradient(circle at 88% 12%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 36%)}.scene{position:absolute;inset:22px 20px 82px}.scene *{box-sizing:border-box}.subject-card{z-index:4}.subject-caption{z-index:4}
.mini-screen,.sheet,.terminal-box,.query-card,.policy-doc,.rag-doc,.invoice{position:absolute;background:rgba(255,255,255,.93);border:2px solid color-mix(in srgb,var(--accent) 26%,white);box-shadow:0 15px 26px rgba(7,45,85,.14);border-radius:18px}.dashboard .mini-screen{width:330px;height:238px;left:58px;top:75px;padding:28px}.screen-head,.sheet-head{height:13px;border-radius:9px;background:linear-gradient(90deg,var(--accent),var(--accent-two));width:58%}.bar-chart,.cost-bars,.candles,.sheet-chart{position:absolute;display:flex;align-items:flex-end;gap:11px}.dashboard .bar-chart{left:30px;bottom:35px;height:108px}.bar{display:block;width:30px;height:var(--h);max-height:100%;border-radius:8px 8px 3px 3px;background:linear-gradient(180deg,var(--accent-two),var(--accent));box-shadow:0 4px 9px color-mix(in srgb,var(--accent) 22%,transparent)}.trend-line{position:absolute;width:232px;height:86px;left:45px;top:76px;border-top:5px solid var(--accent-two);border-radius:48% 52% 0 0;transform:rotate(-13deg)}.metric{position:absolute;padding:12px 16px;background:#fff;border-radius:15px;font-weight:900;color:var(--accent);box-shadow:0 10px 18px rgba(7,45,85,.13)}.metric-a{right:20px;top:38px}.metric-b{right:6px;bottom:28px}
.database .db-stack{position:absolute;left:54px;bottom:48px;width:205px;height:190px}.db-stack i{display:block;height:54px;margin-top:-1px;border:4px solid var(--accent);border-radius:50%;background:linear-gradient(110deg,#fff,var(--accent-two));box-shadow:inset 0 -18px 0 color-mix(in srgb,var(--accent) 19%,transparent)}.query-card{right:22px;top:64px;padding:23px 26px;color:var(--accent);font-size:27px;font-weight:900;transform:rotate(6deg)}.query-card span{display:block;color:var(--accent-two);letter-spacing:8px;margin-top:12px}.data-dots{position:absolute;right:38px;bottom:50px;width:160px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.data-dots .cell,.sheet-grid .cell,.model-grid .cell,.work-board .cell{width:100%;aspect-ratio:1;border-radius:6px;background:color-mix(in srgb,var(--accent) 14%,white);border:2px solid color-mix(in srgb,var(--accent) 19%,white)}.data-dots .cell:nth-child(3n),.sheet-grid .cell:nth-child(4n),.model-grid .cell:nth-child(3n),.work-board .cell:nth-child(5n){background:var(--accent-two)}
.model .model-grid{position:absolute;left:40px;top:54px;width:205px;display:grid;grid-template-columns:repeat(4,1fr);gap:9px;transform:rotate(-6deg)}.model-wave{position:absolute;width:320px;height:160px;left:63px;bottom:38px;border-top:8px solid var(--accent);border-radius:52% 48% 0 0;transform:rotate(12deg)}.model-orbit{position:absolute;right:26px;top:82px;width:154px;height:154px;border:4px solid var(--accent-two);border-radius:50%}.model-orbit i{position:absolute;width:23px;height:23px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px #fff}.model-orbit i:nth-child(1){top:-13px;left:56px}.model-orbit i:nth-child(2){right:-13px;bottom:42px}.model-orbit i:nth-child(3){left:6px;bottom:4px}.spreadsheet .sheet{left:34px;top:48px;width:270px;height:260px;padding:20px}.sheet-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:18px}.sheet-chart{right:20px;bottom:35px;height:145px}.sheet-chart .bar{width:23px}
.cost .coin,.market-coin{position:absolute;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#fff2bb,#e7a73e);color:#80510d;font-weight:950;box-shadow:0 14px 25px rgba(127,81,13,.22)}.cost .coin{width:116px;height:116px;left:46px;top:55px;font-size:60px}.cost-bars{right:34px;bottom:43px;height:225px}.cost-bars .bar{width:42px}.cost-arrow{position:absolute;right:44px;top:39px;color:var(--accent);font-size:86px;font-weight:900}.cost-chip{position:absolute;left:47px;bottom:48px;color:#fff;background:var(--accent);padding:12px 18px;border-radius:13px;font-weight:900}.ledger .invoice{left:42px;top:45px;width:236px;height:285px;padding:35px}.invoice b{display:block;color:var(--accent-two);font-size:48px}.invoice i,.policy-doc i,.terminal-box i,.rag-doc i{display:block;height:11px;border-radius:9px;background:color-mix(in srgb,var(--accent) 25%,white);margin-top:20px}.calc{position:absolute;right:28px;bottom:49px;display:grid;grid-template-columns:repeat(2,58px);gap:11px}.calc span{display:grid;place-items:center;width:58px;height:58px;border-radius:13px;background:#fff;color:var(--accent);font-size:27px;font-weight:900;box-shadow:0 7px 15px rgba(7,45,85,.12)}.market .candles{left:45px;bottom:48px;height:240px}.candles .bar{width:37px}.market-line{position:absolute;right:27px;top:57px;width:245px;height:205px;border-right:6px solid var(--accent-two);border-top:6px solid var(--accent);border-radius:0 90% 0 0;transform:rotate(5deg)}.market-coin{right:32px;bottom:31px;width:82px;height:82px;font-size:38px}
.automation .flow-line{position:absolute;left:52px;right:38px;top:175px;border-top:8px dashed var(--accent);opacity:.65}.flow-step{position:absolute;display:grid;place-items:center;width:86px;height:86px;border:5px solid #fff;border-radius:20px;background:linear-gradient(145deg,var(--accent),var(--accent-two));box-shadow:0 12px 22px rgba(7,45,85,.17)}.flow-step:after{content:"";width:27px;height:27px;border-radius:50%;background:#fff}.s0{left:30px;top:125px}.s1{left:136px;top:92px}.s2{left:242px;top:150px}.s3{right:12px;top:100px}.trigger{position:absolute;left:40px;top:36px;color:#e6982d;font-size:58px}.flow-label{position:absolute;right:30px;bottom:42px;padding:12px 18px;border-radius:14px;background:#fff;color:var(--accent);font-size:25px;font-weight:900}.marketing .megaphone{position:absolute;left:52px;top:90px;color:var(--accent);font-size:158px;transform:rotate(-12deg)}.broadcast{position:absolute;right:34px;top:70px;color:var(--accent-two);font-size:36px;letter-spacing:16px}.audience{position:absolute;right:40px;bottom:46px;display:flex;gap:17px}.audience i,.person{width:58px;height:58px;border-radius:50% 50% 42% 42%;background:linear-gradient(145deg,var(--accent),var(--accent-two));box-shadow:0 9px 18px rgba(7,45,85,.18)}.integration .plug{position:absolute;width:130px;height:84px;border:14px solid var(--accent);border-radius:22px}.plug:after{content:"";position:absolute;width:18px;height:48px;background:var(--accent);top:3px}.plug-a{left:43px;top:80px}.plug-a:after{right:-30px}.plug-b{right:43px;bottom:103px;border-color:var(--accent-two);transform:rotate(180deg)}.plug-b:after{right:-30px;background:var(--accent-two)}.integration-line{position:absolute;left:170px;top:157px;width:142px;border-top:7px dashed var(--accent);transform:rotate(38deg)}.integration-hub{position:absolute;left:207px;top:139px;display:grid;place-items:center;width:74px;height:74px;background:#fff;color:var(--accent);font-size:48px;border-radius:50%;box-shadow:0 9px 20px rgba(7,45,85,.16)}
.shield-shape{position:absolute;left:128px;top:44px;width:190px;height:226px;display:grid;place-items:center;clip-path:polygon(50% 0,94% 17%,86% 73%,50% 100%,14% 73%,6% 17%);background:linear-gradient(145deg,var(--accent),var(--accent-two));color:#fff;font-size:95px;font-weight:900}.shield-ring{position:absolute;border:4px dashed color-mix(in srgb,var(--accent) 48%,white);border-radius:50%}.r1{width:330px;height:330px;left:56px;top:0}.r2{width:245px;height:245px;left:98px;top:41px}.shield-dots{position:absolute;right:38px;bottom:44px;color:var(--accent-two);font-size:46px;letter-spacing:10px}.policy .policy-doc{left:65px;top:40px;width:250px;height:292px;padding:29px}.policy-doc b{display:block;color:var(--accent);font-size:46px}.policy-seal{position:absolute;right:33px;bottom:64px;display:grid;place-items:center;width:112px;height:112px;border:7px solid var(--accent-two);border-radius:50%;color:var(--accent-two);font-size:58px;font-weight:900}.testing .target{position:absolute;left:42px;top:50px;width:245px;height:245px;border:7px solid var(--accent);border-radius:50%}.target i{position:absolute;border:6px solid var(--accent-two);border-radius:50%}.target i:nth-child(1){inset:34px}.target i:nth-child(2){inset:75px}.target i:nth-child(3){inset:107px;background:var(--accent-two)}.testing-shield{position:absolute;right:28px;bottom:49px;color:#fff;background:var(--accent);padding:23px;border-radius:23px;font-size:56px}.testing-scan{position:absolute;right:52px;top:82px;width:120px;border-top:7px solid var(--accent-two);box-shadow:0 34px 0 var(--accent-two),0 68px 0 var(--accent-two)}
.terminal .terminal-box{left:35px;top:62px;width:370px;height:236px;padding:32px}.terminal-box b{color:var(--accent);font-size:38px}.terminal-box i{width:78%;margin-top:18px}.terminal-box i:nth-of-type(2){width:52%;background:var(--accent-two)}.terminal-cursor{position:absolute;right:42px;bottom:56px;width:84px;height:122px;border-left:8px solid var(--accent-two);border-bottom:8px solid var(--accent-two);transform:skewY(-15deg)}.api .api-brace{position:absolute;left:50px;top:85px;font-family:Georgia,serif;color:var(--accent);font-size:135px;font-weight:900}.api-packet{position:absolute;width:150px;height:77px;border-radius:18px;background:#fff;border:3px solid var(--accent-two);box-shadow:0 10px 18px rgba(7,45,85,.13)}.p1{right:35px;top:55px}.p2{right:74px;top:161px;border-color:var(--accent)}.p3{right:26px;top:267px}.mcp .mcp-core{position:absolute;left:158px;top:117px;display:grid;place-items:center;width:145px;height:145px;border-radius:50%;background:linear-gradient(145deg,var(--accent),var(--accent-two));color:#fff;font-size:34px;font-weight:900}.mcp-port{position:absolute;width:74px;height:74px;border:6px solid var(--accent);border-radius:20px;background:#fff}.mcp-port:after{content:"";position:absolute;inset:18px;border-radius:7px;background:var(--accent-two)}.mcp .p1{left:30px;top:42px}.mcp .p2{right:28px;top:57px}.mcp .p3{left:58px;bottom:35px}.mcp .p4{right:45px;bottom:28px}
.rag .rag-doc{left:39px;top:57px;width:212px;height:246px;padding:30px}.rag-search{position:absolute;right:45px;top:55px;display:grid;place-items:center;width:105px;height:105px;border:8px solid var(--accent);border-radius:50%;color:var(--accent);font-size:66px}.rag-graph{position:absolute;right:26px;bottom:33px;width:205px;height:150px}.agent-node{position:absolute;width:39px;height:39px;border:5px solid #fff;border-radius:50%;background:var(--accent-two);box-shadow:0 6px 13px rgba(7,45,85,.16)}.agent-node:after{content:"";position:absolute;width:80px;border-top:4px solid var(--accent);left:30px;top:18px;transform-origin:left}.a0{left:4px;top:54px}.a1{left:75px;top:12px}.a2{right:5px;top:52px}.a3{left:76px;bottom:0}.a4{right:15px;bottom:5px}.a1:after{transform:rotate(37deg)}.a3:after{transform:rotate(-60deg)}.conversation .bubble{position:absolute;display:grid;place-items:center;border-radius:28px;background:#fff;box-shadow:0 12px 23px rgba(7,45,85,.15);font-weight:900}.b-one{left:40px;top:60px;width:158px;height:110px;color:var(--accent);font-size:56px}.b-two{right:35px;top:130px;width:180px;height:119px;color:var(--accent-two);font-size:55px}.b-three{left:120px;bottom:40px;width:175px;height:93px;background:linear-gradient(145deg,var(--accent),var(--accent-two));color:#fff;font-size:37px}.multiagent .agent-core{position:absolute;left:160px;top:120px;display:grid;place-items:center;width:135px;height:135px;border-radius:50%;background:var(--accent);color:#fff;font-size:46px;font-weight:900;box-shadow:0 0 0 17px color-mix(in srgb,var(--accent) 15%,transparent)}.agent-links{position:absolute;left:88px;top:62px;width:280px;height:255px;border:4px dashed var(--accent-two);border-radius:50%}.multiagent .agent-node{transform:scale(1.2)}.people .person{position:absolute}.people .p1{left:42px;top:116px}.people .p2{left:185px;top:62px;transform:scale(1.42)}.people .p3{right:55px;top:141px}.people-link{position:absolute;left:72px;right:84px;top:190px;border-top:8px solid var(--accent-two)}.creative .creative-spark{position:absolute;left:92px;top:40px;color:var(--accent-two);font-size:120px}.creative-card{position:absolute;width:160px;height:204px;border-radius:22px;background:#fff;box-shadow:0 16px 25px rgba(7,45,85,.15);border:4px solid color-mix(in srgb,var(--accent) 22%,white)}.creative-card:after{content:"";position:absolute;inset:35px 24px;background:linear-gradient(145deg,var(--accent),var(--accent-two));border-radius:16px}.creative .c1{left:38px;top:110px;transform:rotate(-14deg)}.creative .c2{left:148px;top:67px}.creative .c3{right:32px;top:123px;transform:rotate(15deg)}.learning .book{position:absolute;border-radius:9px 18px 18px 9px;background:linear-gradient(145deg,var(--accent),var(--accent-two));box-shadow:0 16px 25px rgba(7,45,85,.17)}.book-a{left:65px;top:178px;width:270px;height:78px;transform:rotate(-9deg)}.book-b{left:92px;top:102px;width:230px;height:74px;transform:rotate(8deg);background:linear-gradient(145deg,#fff,var(--accent-two));border:4px solid var(--accent)}.cap{position:absolute;right:38px;top:52px;color:var(--accent);font-size:135px}.learning-orbit{position:absolute;left:58px;top:35px;width:310px;height:290px;border:5px dashed color-mix(in srgb,var(--accent) 48%,white);border-radius:50%}.work .work-board{position:absolute;left:48px;top:55px;width:278px;display:grid;grid-template-columns:repeat(4,1fr);gap:13px;transform:rotate(-4deg)}.work-star{position:absolute;right:54px;top:64px;color:var(--accent-two);font-size:118px}.work-path{position:absolute;right:28px;bottom:45px;width:260px;height:170px;border-bottom:8px solid var(--accent);border-left:8px solid var(--accent);border-radius:0 0 0 70%;transform:rotate(12deg)}
`;

const EXTRA_SCENE_CSS = `
.unique-illustration{position:absolute;inset:16px 14px 76px;width:calc(100% - 28px);height:calc(100% - 92px);object-fit:contain;mix-blend-mode:multiply;filter:saturate(.94) contrast(1.03)}
.market .portfolio-donut{position:absolute;left:45px;top:56px;width:218px;height:218px;border-radius:50%;background:conic-gradient(var(--accent) 0 38%,var(--accent-two) 38% 71%,#d6e8f2 71% 100%);box-shadow:0 12px 26px rgba(7,45,85,.15)}.market .portfolio-donut:after{content:"";position:absolute;inset:48px;border-radius:50%;background:#fff}.market .portfolio-donut i{position:absolute;z-index:1;inset:88px;border-radius:50%;background:var(--accent-two)}.market .portfolio-legend{position:absolute;left:42px;bottom:44px;display:flex;gap:12px}.market .portfolio-legend b{width:48px;height:13px;border-radius:9px;background:var(--accent)}.market .portfolio-legend b:nth-child(2){background:var(--accent-two)}.market .portfolio-legend b:nth-child(3){background:#d6e8f2}.market .market-line{right:23px;top:72px;width:180px;height:156px}.market .market-coin{right:24px;bottom:35px}
`;

function trainingBadges(training, compact = false) {
  const labels = [training.status, training.level, training.languages.join(" • "), `${training.activities} activités`, `${training.exercises} exercices`];
  return labels.slice(0, compact ? 4 : 5).map((label) => `<span class="badge">${escapeHtml(label)}</span>`).join("");
}

function pageHtml(training, variant) {
  const social = variant === "social";
  const dimensions = social ? { width: 1200, height: 630 } : { width: 1200, height: 900 };
  const titleClass = training.title.length > 42 ? "small-title" : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} html,body{margin:0;width:${dimensions.width}px;height:${dimensions.height}px;overflow:hidden;font-family:Inter,Arial,sans-serif;background:#0d2b54}.canvas{position:relative;width:100%;height:100%;overflow:hidden;background:linear-gradient(135deg,#fdfbf6 0%,#fdfbf6 60%,#e8f4f5 100%);color:#0e3568}.canvas:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 90% 12%,rgba(34,133,172,.18),transparent 27%),radial-gradient(circle at 13% 90%,rgba(21,74,143,.10),transparent 32%)}.brand{position:absolute;top:${social ? 36 : 46}px;left:${social ? 52 : 58}px;width:${social ? 176 : 194}px;height:58px;object-fit:contain;object-position:left center}.eyebrow{position:absolute;top:${social ? 125 : 150}px;left:${social ? 56 : 64}px;color:#285b9b;font-size:${social ? 18 : 21}px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.content{position:absolute;left:${social ? 56 : 64}px;top:${social ? 166 : 200}px;width:${social ? 595 : 630}px}.title{margin:0;color:#092f62;font-size:${social ? 55 : 58}px;line-height:1.04;letter-spacing:-.035em;font-weight:850}.title.small-title{font-size:${social ? 44 : 48}px}.description{margin:18px 0 0;color:#3c5678;font-size:${social ? 19 : 21}px;line-height:1.4;max-width:${social ? 555 : 590}px}.badges{display:flex;flex-wrap:wrap;gap:9px;margin-top:24px;max-width:${social ? 560 : 610}px}.badge{padding:8px 13px;border:1px solid #b9cee5;border-radius:999px;background:#fff;color:#214c82;font-size:${social ? 15 : 16}px;font-weight:760;white-space:nowrap}.badge:first-child{background:#123d76;border-color:#123d76;color:#fff}.illustration{position:absolute;right:${social ? 50 : 64}px;top:${social ? 70 : 170}px;width:${social ? 470 : 470}px;height:${social ? 470 : 510}px;border:1px solid rgba(21,67,122,.14);border-radius:32px;background:linear-gradient(145deg,#e2f2f3,#fff 52%,#eef3ff);box-shadow:0 20px 48px rgba(12,48,92,.14);transform:rotate(var(--rotate));overflow:hidden}.orb{position:absolute;border-radius:999px;filter:blur(1px)}.orb-a{width:236px;height:236px;right:-46px;top:-35px;background:color-mix(in srgb,var(--accent) 22%,transparent)}.orb-b{width:180px;height:180px;left:-54px;bottom:-70px;background:rgba(222,70,95,.12)}.network{position:absolute;inset:55px}.node{position:absolute;width:20px;height:20px;left:var(--x);top:var(--y);border:5px solid #fff;border-radius:50%;background:var(--accent);box-shadow:0 5px 12px rgba(7,46,94,.18)}.link{position:absolute;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--accent),#49b3bd);transform-origin:left center;opacity:.75}.l1{left:68px;top:97px;width:204px;transform:rotate(22deg)}.l2{left:132px;top:198px;width:180px;transform:rotate(-37deg)}.l3{left:91px;top:267px;width:186px;transform:rotate(-17deg)}.subject-card{position:absolute;right:34px;bottom:66px;display:flex;align-items:center;gap:12px;padding:15px 19px;border-radius:18px;background:#fff;color:#133e76;font-size:23px;font-weight:850;box-shadow:0 10px 22px rgba(8,47,89,.13)}.subject-icon{display:grid;place-items:center;min-width:34px;height:34px;color:var(--accent);font-size:19px;font-weight:900}.subject-caption{position:absolute;left:35px;bottom:30px;max-width:320px;color:#426083;font-size:16px;font-weight:700}.footer-line{position:absolute;left:${social ? 56 : 64}px;bottom:${social ? 36 : 52}px;width:${social ? 580 : 640}px;height:4px;border-radius:999px;background:linear-gradient(90deg,#1b61b7 0%,#38a3ae 65%,transparent 65%)}
  </style></head><body><main class="canvas"><img class="brand" src="${logoPath}" alt=""><div class="eyebrow">Neopolis Akademy · Formations IA</div><section class="content"><h1 class="title ${titleClass}">${escapeHtml(training.title)}</h1><p class="description">${escapeHtml(training.description)}</p><div class="badges">${trainingBadges(training, social)}</div></section>${subjectVisual(training)}<div class="footer-line"></div></main></body></html>`;
}

const requestedIds = new Set((process.env.TRAINING_VISUAL_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean));
const selectedTrainings = requestedIds.size > 0
  ? manifest.trainings.filter((training) => requestedIds.has(training.id))
  : manifest.trainings;

if (requestedIds.size > 0 && selectedTrainings.length !== requestedIds.size) {
  const missing = [...requestedIds].filter((id) => !selectedTrainings.some((training) => training.id === id));
  throw new Error(`Unknown training visual IDs: ${missing.join(", ")}`);
}

const expected = [];
for (const sourceTraining of selectedTrainings) {
  const training = { ...sourceTraining, description: visualDescription(sourceTraining.description) };
  for (const variant of ["social", "card"]) {
    const htmlPath = path.join(htmlDir, `${training.id}-${variant}.html`);
    const outputPath = path.join(outputDir, `${training.id}-${variant}.png`);
    const dimensions = variant === "social" ? "1200,630" : "1200,900";
    fs.writeFileSync(htmlPath, pageHtml(training, variant));
    execFileSync(chromium, [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      `--window-size=${dimensions}`,
      `--screenshot=${outputPath}`,
      `file://${htmlPath}`,
    ], { stdio: "ignore" });
    expected.push({ id: training.id, variant, path: outputPath });
  }
}

if (requestedIds.size === 0) {
  fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(expected, null, 2)}\n`);
}
console.log(`rendered_training_visuals=${expected.length} selected_trainings=${selectedTrainings.length}`);
