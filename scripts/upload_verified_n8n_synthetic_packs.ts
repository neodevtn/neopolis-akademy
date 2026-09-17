import fs from "node:fs";
import path from "node:path";
import { storagePut } from "../server/storage";

const root = path.resolve(import.meta.dirname, "..");
const outputDirectory = path.join(root, ".work", "datacamp-audit-2026-09-17", "n8n-synthetic-packs");
const mapPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "n8n-synthetic-pack-map.json");
fs.mkdirSync(outputDirectory, { recursive: true });

const packs: Record<string, { title: string; description: string; payload: unknown }> = {
  webhook_nested_orders: {
    title: "Données synthétiques — payload webhook imbriqué",
    description: "Jeu de données synthétiques Neopolis pour exercer l’aplatissement d’un payload webhook.",
    payload: { user: { id: "u-1001", name: "Amina", email: "amina@example.test" }, order: { id: "o-204", total: 92.5, currency: "EUR" }, source: "neopolis-synthetic" },
  },
  stockholm_weather: {
    title: "Données synthétiques — météo Stockholm",
    description: "Réponse JSON synthétique inspirée d’une API météo, à utiliser pour lire ou aplatir une structure imbriquée.",
    payload: { city: "Stockholm", current_condition: [{ temp_C: "12", humidity: "73", weatherDesc: [{ value: "Cloudy" }] }], source: "neopolis-synthetic" },
  },
  city_validation_rows: {
    title: "Données synthétiques — validation de villes",
    description: "Lignes synthétiques avec valeurs valides et invalides pour une règle d’humidité numérique.",
    payload: [{ city: "Stockholm", humidity: 73, description: "Cloudy" }, { city: "Berlin", humidity: "N/A", description: "Unknown" }, { city: "Tunis", humidity: 54, description: "Clear" }],
  },
  data_table_rows: {
    title: "Données synthétiques — table météo",
    description: "Lignes synthétiques pour écrire, relire et dédupliquer des enregistrements dans une Data Table n8n.",
    payload: [{ city: "Stockholm", date: "2026-09-17", temperatureC: 12 }, { city: "Berlin", date: "2026-09-17", temperatureC: 18 }, { city: "Stockholm", date: "2026-09-18", temperatureC: 13 }],
  },
  product_feed: {
    title: "Données synthétiques — flux produits",
    description: "Flux synthétique de produits pour un traitement par lots et une pause entre itérations.",
    payload: Array.from({ length: 12 }, (_, index) => ({ productId: `p-${String(index + 1).padStart(3, "0")}`, name: `Produit ${index + 1}`, region: index % 2 ? "north" : "south" })),
  },
  nested_orders: {
    title: "Données synthétiques — commandes et articles",
    description: "Commandes synthétiques avec tableaux d’articles pour Split Out, calcul de ligne, agrégation et routage.",
    payload: [
      { orderId: "o-301", priority: "high", items: [{ sku: "A-01", category: "office", quantity: 2, price: 12.5 }, { sku: "B-14", category: "office", quantity: 1, price: 25 }] },
      { orderId: "o-302", priority: "normal", items: [{ sku: "C-03", category: "tech", quantity: 3, price: 18 }] },
    ],
  },
  split_items: {
    title: "Données synthétiques — articles déjà séparés",
    description: "Lignes d’articles synthétiques pour calculer des indicateurs regroupés par catégorie.",
    payload: [{ category: "office", price: 12.5, quantity: 2 }, { category: "office", price: 25, quantity: 1 }, { category: "tech", price: 18, quantity: 3 }],
  },
  workflow_routing_orders: {
    title: "Données synthétiques — commandes à router",
    description: "Commandes synthétiques pour tester un routage conditionnel vers deux sous-workflows construits par l’apprenant.",
    payload: [{ orderId: "o-401", total: 2000, priority: "high" }, { orderId: "o-402", total: 85, priority: "normal" }],
  },
  validation_orders: {
    title: "Données synthétiques — validation de commandes",
    description: "Commandes synthétiques avec identifiant manquant et montant nul pour tester deux points de validation avant traitement.",
    payload: [{ order_id: "o-501", amount: 140 }, { order_id: "", amount: 70 }, { order_id: "o-503", amount: 0 }],
  },
  error_events: {
    title: "Données synthétiques — événements d’erreur",
    description: "Événements synthétiques de workflow pour mettre en forme un journal d’erreurs dans une Data Table.",
    payload: [{ workflow: "ingestion-meteo", node: "HTTP Request", message: "Synthetic HTTP failure", timestamp: "2026-09-18T08:00:00Z" }],
  },
  ingestion_records: {
    title: "Données synthétiques — ingestion multi-étapes",
    description: "Enregistrements synthétiques pour observer des checkpoints HTTP Request, Transform Data et Format Output.",
    payload: [{ city: "London", temperatureC: 16, observedAt: "2026-09-18T08:00:00Z" }, { city: "London", temperatureC: 16, observedAt: "2026-09-18T08:00:00Z" }],
  },
};

const map: Record<string, { title: string; description: string; url: string; fileKey: string }> = {};
for (const [id, pack] of Object.entries(packs)) {
  const filename = `${id}.json`;
  const content = `${JSON.stringify({ title: pack.title, description: pack.description, syntheticData: true, data: pack.payload }, null, 2)}\n`;
  const localPath = path.join(outputDirectory, filename);
  fs.writeFileSync(localPath, content);
  const upload = await storagePut(`courses/datacamp/intermediate-n8n/synthetic-data/${filename}`, content, "application/json; charset=utf-8");
  map[id] = { title: pack.title, description: pack.description, url: upload.url, fileKey: upload.key };
}
fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
console.log(JSON.stringify({ mapPath, packCount: Object.keys(map).length, map }, null, 2));
