import { Router, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { sdk } from "./_core/sdk";
import { getAchievementById, getExamAttempts } from "./db";
import { generateAchievementPdf } from "./achievementPdf";

const router = Router();

// Certificate generation endpoint
router.get("/api/certificate/:certificationId", async (req: Request, res: Response) => {
  try {
    // Authenticate user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { certificationId } = req.params;

    // Get exam history for this certification
    const attempts = await getExamAttempts(user.id, certificationId);
    
    // Find the best passing attempt (score >= 720)
    const passingAttempt = attempts.find((a: any) => a.score >= 720);
    if (!passingAttempt) {
      res.status(403).json({ error: "No passing score found (minimum 720/1000 required)" });
      return;
    }

    // Certification name mapping
    const certNames: Record<string, { en: string; fr: string }> = {
      claude_certified_associate_foundations: {
        en: "Claude Certified Associate – Foundations",
        fr: "Claude Certified Associate – Fondations",
      },
      claude_certified_developer_foundations: {
        en: "Claude Certified Developer – Foundations",
        fr: "Claude Certified Developer – Fondations",
      },
      claude_certified_architect_foundations: {
        en: "Claude Certified Architect – Foundations",
        fr: "Claude Certified Architect – Fondations",
      },
      claude_certified_architect_professional: {
        en: "Claude Certified Architect – Professional",
        fr: "Claude Certified Architect – Professionnel",
      },
    };

    const certName = certNames[certificationId]?.fr || certificationId;
    const certNameEn = certNames[certificationId]?.en || certificationId;
    const userName = user.name || "Participant";
    const examDate = new Date(passingAttempt.finishedAt).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const score = passingAttempt.score;

    // Generate PDF certificate
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate_${certificationId}_${user.id}.pdf"`
    );

    // Pipe to response
    doc.pipe(res);

    // --- Certificate Design ---
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Border
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(2).stroke("#10b981");
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60).lineWidth(0.5).stroke("#d1d5db");

    // Header - Neopolis Akademy
    doc.fontSize(14).fillColor("#6b7280").text("NEOPOLIS AKADEMY", 0, 60, { align: "center" });

    // Title
    doc.moveDown(1.5);
    doc.fontSize(36).fillColor("#1f2937").text("CERTIFICAT DE RÉUSSITE", 0, 110, { align: "center" });

    // Decorative line
    const lineY = 160;
    doc.moveTo(pageWidth / 2 - 100, lineY).lineTo(pageWidth / 2 + 100, lineY).lineWidth(2).stroke("#10b981");

    // "Décerné à"
    doc.moveDown(2);
    doc.fontSize(14).fillColor("#6b7280").text("Décerné à", 0, 185, { align: "center" });

    // User name
    doc.fontSize(28).fillColor("#111827").text(userName, 0, 215, { align: "center" });

    // "Pour avoir réussi"
    doc.moveDown(1.5);
    doc.fontSize(14).fillColor("#6b7280").text("Pour avoir réussi avec succès l'examen", 0, 270, { align: "center" });

    // Certification name
    doc.fontSize(20).fillColor("#059669").text(certName, 0, 300, { align: "center" });

    // Score
    doc.moveDown(1.5);
    doc.fontSize(14).fillColor("#374151").text(`Score obtenu : ${score}/1000`, 0, 345, { align: "center" });

    // Date
    doc.fontSize(12).fillColor("#6b7280").text(`Date de certification : ${examDate}`, 0, 375, { align: "center" });

    // Certificate ID
    const certId = `NEOP-${certificationId.substring(0, 4).toUpperCase()}-${user.id}-${Date.now().toString(36).toUpperCase()}`;
    doc.fontSize(10).fillColor("#9ca3af").text(`Référence : ${certId}`, 0, 410, { align: "center" });

    // Footer
    doc.fontSize(10).fillColor("#9ca3af").text(
      "Ce certificat atteste de la réussite de l'examen blanc sur la plateforme Neopolis Akademy.",
      60,
      pageHeight - 90,
      { align: "center", width: pageWidth - 120 }
    );
    doc.text("www.neopolis-dev.com", 0, pageHeight - 70, { align: "center" });

    // Finalize
    doc.end();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  }
});

/** Download the official PDF for an achievement owned by the authenticated learner. */
router.get("/api/achievement-certificate/:achievementId", async (req: Request, res: Response) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });
    const achievementId = Number(req.params.achievementId);
    if (!Number.isInteger(achievementId) || achievementId < 1) return res.status(400).json({ error: "Invalid achievement" });
    const achievement = await getAchievementById(user.id, achievementId);
    if (!achievement) return res.status(404).json({ error: "Credential not found" });
    const pdf = await generateAchievementPdf({ userName: user.name || "Apprenant", achievement });
    const safeCode = achievement.credentialCode.replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeCode}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error("[Achievement] PDF download failed:", error);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate credential" });
  }
});

export default router;
