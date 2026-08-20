import PDFDocument from "pdfkit";

const LOGO_URL = "https://akademy.neodev.click/manus-storage/neopolis-akademy-official-logo_5d04f49b.png";

async function getLogo() {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

export async function generateAchievementPdf({ userName, achievement }: { userName: string; achievement: any }) {
  const logo = await getLogo();
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margins: { top: 46, bottom: 46, left: 58, right: 58 } });
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const width = doc.page.width;
    const height = doc.page.height;
    doc.rect(18, 18, width - 36, height - 36).lineWidth(2).stroke("#12315b");
    doc.rect(29, 29, width - 58, height - 58).lineWidth(0.6).stroke("#c89a52");
    if (logo) doc.image(logo, width / 2 - 84, 50, { fit: [168, 48] });
    else doc.fontSize(15).fillColor("#12315b").text("NEOPOLIS DEVELOPMENT", 0, 65, { align: "center" });
    doc.fontSize(10).fillColor("#8a6a37").text("NEOPOLIS AKADEMY", 0, 108, { align: "center", characterSpacing: 2 });
    doc.fontSize(30).fillColor("#12315b").text(achievement.kind === "certification" ? "DIPLÔME DE CERTIFICATION" : "BADGE DE COMPÉTENCE", 0, 145, { align: "center" });
    doc.moveTo(width / 2 - 120, 190).lineTo(width / 2 + 120, 190).lineWidth(1.5).stroke("#c89a52");
    doc.fontSize(13).fillColor("#56637a").text("Ce document officiel est décerné à", 0, 220, { align: "center" });
    doc.fontSize(27).fillColor("#101b2d").text(userName, 0, 248, { align: "center" });
    doc.fontSize(13).fillColor("#56637a").text(achievement.kind === "certification" ? "pour avoir validé avec succès la certification" : "pour avoir démontré et validé la compétence", 0, 298, { align: "center" });
    doc.fontSize(19).fillColor("#0f6b61").text(achievement.title.replace(/^.*?:\s*/, ""), 70, 326, { align: "center", width: width - 140 });
    doc.fontSize(11).fillColor("#374151").text(achievement.description || "Acquis validé sur la plateforme Neopolis Akademy.", 80, 365, { align: "center", width: width - 160 });
    doc.fontSize(10).fillColor("#56637a").text(`Délivré le ${new Date(achievement.issuedAt || Date.now()).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}`, 0, 425, { align: "center" });
    doc.fontSize(9).fillColor("#8a6a37").text(`Référence vérifiable : ${achievement.credentialCode}`, 0, 448, { align: "center" });
    doc.fontSize(9).fillColor("#56637a").text("Neopolis Development · www.neopolis-dev.com", 0, height - 70, { align: "center" });
    doc.end();
  });
}
