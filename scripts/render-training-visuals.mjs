import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/training-visual-manifest.json"), "utf8"));
const outputDir = "/home/ubuntu/webdev-static-assets/training-cards/rendered";
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

function visualTheme(training) {
  const source = `${training.title} ${training.description}`.toLowerCase();
  if (/finance|finops|comptable|accounting/.test(source)) return { icon: "¤", motif: "finance" };
  if (/donn|data|reporting|bi |analytics|analyst/.test(source)) return { icon: "▥", motif: "data" };
  if (/workflow|automatisation|automation|n8n/.test(source)) return { icon: "⌘", motif: "workflow" };
  if (/gouvernance|governance|compliance|responsible|security|sécurité|red.team/.test(source)) return { icon: "◈", motif: "governance" };
  if (/code|software|developer|coding|api|mcp/.test(source)) return { icon: "</>", motif: "code" };
  if (/agent|rag|llm|claude|prompt/.test(source)) return { icon: "◌", motif: "agent" };
  if (/marketing|sales|consulting|human resources|rh|métier/.test(source)) return { icon: "✦", motif: "people" };
  return { icon: "AI", motif: "general" };
}

function subjectVisual(training) {
  const { motif, icon } = visualTheme(training);
  const seed = hash(training.id);
  const rotations = [8, -7, 14, -12, 5];
  const rotate = rotations[seed % rotations.length];
  const color = ["#1d60b8", "#217f91", "#3e69a8", "#14539e", "#237c93"][seed % 5];
  const nodes = Array.from({ length: 5 }, (_, index) => {
    const x = 64 + ((seed >> (index * 3)) % 220);
    const y = 74 + ((seed >> (index * 5)) % 164);
    return `<span class="node n${index}" style="--x:${x}px;--y:${y}px"></span>`;
  }).join("");
  const label = motif === "workflow" ? "Flux" : motif === "data" ? "Données" : motif === "finance" ? "Analyse" : motif === "governance" ? "Contrôle" : motif === "code" ? "Build" : motif === "people" ? "Impact" : "IA";
  return `<div class="illustration ${motif}" style="--accent:${color};--rotate:${rotate}deg"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="network">${nodes}<span class="link l1"></span><span class="link l2"></span><span class="link l3"></span></div><div class="subject-card"><span class="subject-icon">${icon}</span><span>${label}</span></div><div class="subject-caption">${escapeHtml(training.subjectHint.slice(0, 42))}</div></div>`;
}

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

const expected = [];
for (const training of manifest.trainings) {
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

fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(expected, null, 2)}\n`);
console.log(`rendered_training_visuals=${expected.length}`);
