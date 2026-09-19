import { inArray } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "../server/db";
import { createCommunication, getCommunications, getRecipientPreview } from "../server/adminDb";
import { formatCommunicationBody } from "../server/communicationBody";

const subject = "Découvrez TekTek, votre coach IA";
const markdown = `Bonjour {{name}},

**TekTek, le coach IA de Neopolis Akademy, vous accompagne désormais à deux moments clés de votre parcours.**

Dans les cours, TekTek peut vous aider à comprendre un passage difficile, retrouver les séquences utiles et clarifier précisément une consigne ou le format d’une preuve de réalisation. Pour une activité évaluée, il vous guide avec le format, les critères visibles et une checklist vide, sans réaliser l’exercice ni fournir une réponse prête à soumettre à votre place.

Dans **Mon parcours > Mon orientation**, vous pouvez aussi décrire librement votre objectif professionnel. TekTek vous propose alors un brouillon de parcours fondé sur les familles métier, compétences et formations réellement disponibles dans le catalogue. Vous gardez le contrôle : le brouillon est modifiable et rien n’est enregistré avant votre validation explicite.

Pour ouvrir TekTek pendant un cours, utilisez le bouton **« Demander à TekTek »** présent en haut et en bas de chaque écran. Pour configurer votre parcours, ouvrez **Mon orientation**, puis **Configurer avec TekTek**.

Bonne progression,

**L’équipe Neopolis Akademy**`;

async function main() {
  const existing = await getCommunications({ page: 1, pageSize: 20, search: subject, status: "draft" });
  const exact = existing.items.find((item) => item.subject === subject);
  const preview = await getRecipientPreview({ audience: "all" });
  if (exact) {
    console.log(JSON.stringify({ id: exact.id, status: exact.status, recipientCount: preview.count, reused: true }));
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [administrator] = await db.select({ id: users.id }).from(users).where(inArray(users.role, ["admin", "admin_learner"])).limit(1);
  if (!administrator) throw new Error("No administrator available to own the communication draft");

  const draft = await createCommunication({
    subject,
    body: formatCommunicationBody(markdown, "markdown"),
    type: "announcement",
    isImportant: 0,
    recipientFilter: { audience: "all" },
    sentBy: administrator.id,
    status: "draft",
    recipientCount: 0,
  });
  console.log(JSON.stringify({ id: draft.id, status: draft.status, recipientCount: preview.count, reused: false }));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Unable to prepare TekTek announcement draft");
    process.exit(1);
  });
