import PDFDocument from "pdfkit";

// ============================================================
// TYPES
// ============================================================

interface CandidateData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  sector: string;
  currentRole: string;
  yearsExperience: number;
  programmingLevel: string;
  aiKnowledge: string;
  cloudExperience: string;
  technicalTools?: string | null;
  certifications?: string | null;
  sectorExpertise: string;
  clientNetwork: string;
  businessDevelopment: string;
  languages?: string | null;
  publicSpeaking: string;
  salesExperience: string;
  motivation: string;
  distributionNetwork?: string | null;
  industryContacts?: string | null;
  existingPartnerships?: string | null;
  targetMarketKnowledge?: string | null;
  riskTolerance?: string | null;
  autonomyLevel?: string | null;
  resilienceLevel?: string | null;
  leadershipStyle?: string | null;
  entrepreneurialExperience?: string | null;
  aiAgentScenario?: string | null;
  aiAgentSector?: string | null;
  aiAgentImpact?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  otherSocialUrl?: string | null;
  cvFileUrl?: string | null;
  photoFileUrl?: string | null;
  videoFileUrl?: string | null;
  scoreTechnique: string | number;
  scoreMetier: string | number;
  scoreCommunication: string | number;
  scoreTotal: string | number;
  status: string;
  createdAt: Date | string;
}

// ============================================================
// HELPERS
// ============================================================

const COLORS = {
  primary: "#0f1b2d",
  accent: "#e11d48",
  green: "#16a34a",
  blue: "#2563eb",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  white: "#ffffff",
};

function labelMap(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    none: "Aucun",
    beginner: "Débutant",
    basic: "Basique",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    expert: "Expert",
    junior: "Junior",
    senior: "Senior",
    small: "Petit",
    medium: "Moyen",
    large: "Large",
    few: "Quelques",
    moderate: "Modéré",
    extensive: "Étendu",
    very_extensive: "Très étendu",
    good: "Bon",
    excellent: "Excellent",
    very_low: "Très faible",
    low: "Faible",
    high: "Élevé",
    very_high: "Très élevé",
    needs_guidance: "Besoin d'accompagnement",
    somewhat_autonomous: "Assez autonome",
    autonomous: "Autonome",
    very_autonomous: "Très autonome",
    fully_independent: "Totalement indépendant",
    follower: "Suiveur",
    collaborative: "Collaboratif",
    situational: "Situationnel",
    visionary: "Visionnaire",
    transformational: "Transformationnel",
    less_1y: "< 1 an",
    "1_3y": "1-3 ans",
    "3_5y": "3-5 ans",
    more_5y: "> 5 ans",
    en_attente: "En attente",
    selectionne: "Sélectionné",
    refuse: "Refusé",
  };
  return map[value] || value;
}

function statusColor(status: string): string {
  switch (status) {
    case "selectionne": return COLORS.green;
    case "refuse": return COLORS.accent;
    default: return COLORS.blue;
  }
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ============================================================
// PDF GENERATION
// ============================================================

export function generateCandidatePDF(data: CandidateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Profil Candidat - ${data.firstName} ${data.lastName}`,
        Author: "Neopolis Akademy",
        Subject: "Fiche Candidat Ambassadeur",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = 495; // A4 width minus margins

    // ─── HEADER ───
    doc.rect(0, 0, 595.28, 90).fill(COLORS.primary);
    doc.fontSize(22).fillColor(COLORS.white).text("Neopolis ", 50, 30, { continued: true });
    doc.fillColor(COLORS.accent).text("Akademy", { continued: false });
    doc.fontSize(10).fillColor("#94a3b8").text("Fiche Candidat Ambassadeur · Programme 2026", 50, 58);

    // ─── STATUS BADGE ───
    const statusText = labelMap(data.status).toUpperCase();
    const statusW = doc.widthOfString(statusText) + 20;
    doc.roundedRect(595.28 - 50 - statusW, 35, statusW, 24, 4).fill(statusColor(data.status));
    doc.fontSize(9).fillColor(COLORS.white).text(statusText, 595.28 - 50 - statusW + 10, 42);

    doc.moveDown(2);
    let y = 110;

    // ─── CANDIDATE IDENTITY ───
    doc.fontSize(18).fillColor(COLORS.primary).text(`${data.firstName} ${data.lastName}`, 50, y);
    y += 26;
    doc.fontSize(10).fillColor(COLORS.gray).text(`${data.currentRole} · ${data.city}, ${data.country}`, 50, y);
    y += 16;
    doc.text(`${data.email} · ${data.phone}`, 50, y);
    y += 16;
    doc.text(`Candidature soumise le ${formatDate(data.createdAt)}`, 50, y);
    y += 30;

    // ─── SCORES SECTION ───
    doc.rect(50, y, pageWidth, 70).fill(COLORS.lightGray);
    doc.fontSize(11).fillColor(COLORS.primary).text("SCORES D'ÉVALUATION", 65, y + 10);
    
    const scoreY = y + 30;
    const scores = [
      { label: "Total", value: Number(data.scoreTotal).toFixed(1), color: COLORS.primary },
      { label: "Technique (40%)", value: Number(data.scoreTechnique).toFixed(1), color: COLORS.blue },
      { label: "Métier (35%)", value: Number(data.scoreMetier).toFixed(1), color: COLORS.green },
      { label: "Communication (25%)", value: Number(data.scoreCommunication).toFixed(1), color: COLORS.accent },
    ];
    
    scores.forEach((s, i) => {
      const x = 65 + i * 120;
      doc.fontSize(16).fillColor(s.color).text(`${s.value}%`, x, scoreY);
      doc.fontSize(8).fillColor(COLORS.gray).text(s.label, x, scoreY + 18);
    });
    y += 85;

    // ─── SECTION HELPER ───
    function sectionTitle(title: string) {
      y += 10;
      doc.fontSize(11).fillColor(COLORS.primary).text(title.toUpperCase(), 50, y);
      y += 4;
      doc.moveTo(50, y + 12).lineTo(50 + pageWidth, y + 12).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
      y += 18;
    }

    function fieldRow(label: string, value: string | null | undefined) {
      if (!value || value === "—") return;
      if (y > 750) { doc.addPage(); y = 50; }
      doc.fontSize(9).fillColor(COLORS.gray).text(label, 50, y, { width: 160 });
      doc.fontSize(9).fillColor(COLORS.primary).text(value, 215, y, { width: 330 });
      y += 14;
    }

    function textBlock(label: string, value: string | null | undefined) {
      if (!value) return;
      if (y > 700) { doc.addPage(); y = 50; }
      doc.fontSize(9).fillColor(COLORS.gray).text(label, 50, y);
      y += 14;
      doc.fontSize(9).fillColor(COLORS.primary).text(value, 65, y, { width: pageWidth - 15 });
      y += doc.heightOfString(value, { width: pageWidth - 15 }) + 10;
    }

    // ─── INFORMATIONS DE BASE ───
    sectionTitle("Informations de base");
    fieldRow("Secteur d'activité", data.sector);
    fieldRow("Poste actuel", data.currentRole);
    fieldRow("Années d'expérience", `${data.yearsExperience} ans`);
    fieldRow("Langues", data.languages);

    // ─── COMPÉTENCES TECHNIQUES ───
    sectionTitle("Compétences techniques");
    fieldRow("Programmation", labelMap(data.programmingLevel));
    fieldRow("Connaissances IA", labelMap(data.aiKnowledge));
    fieldRow("Cloud", labelMap(data.cloudExperience));
    fieldRow("Outils techniques", data.technicalTools);
    fieldRow("Certifications", data.certifications);

    // ─── EXPERTISE MÉTIER ───
    sectionTitle("Expertise métier");
    fieldRow("Expertise sectorielle", labelMap(data.sectorExpertise));
    fieldRow("Réseau client", labelMap(data.clientNetwork));
    fieldRow("Développement commercial", labelMap(data.businessDevelopment));
    fieldRow("Expérience commerciale", labelMap(data.salesExperience));
    fieldRow("Prise de parole", labelMap(data.publicSpeaking));

    // ─── RÉSEAU DE DISTRIBUTION ───
    sectionTitle("Réseau de distribution");
    fieldRow("Contacts industrie", labelMap(data.industryContacts));
    fieldRow("Connaissance marché cible", labelMap(data.targetMarketKnowledge));
    textBlock("Réseau de distribution", data.distributionNetwork);
    textBlock("Partenariats existants", data.existingPartnerships);

    // ─── PROFIL ENTREPRENEURIAL ───
    sectionTitle("Profil entrepreneurial");
    fieldRow("Tolérance au risque", labelMap(data.riskTolerance));
    fieldRow("Autonomie", labelMap(data.autonomyLevel));
    fieldRow("Résilience", labelMap(data.resilienceLevel));
    fieldRow("Style de leadership", labelMap(data.leadershipStyle));
    textBlock("Expérience entrepreneuriale", data.entrepreneurialExperience);

    // ─── SCÉNARIO AGENT IA ───
    sectionTitle("Scénario Agent IA");
    fieldRow("Secteur cible", data.aiAgentSector);
    textBlock("Scénario proposé", data.aiAgentScenario);
    textBlock("Impact estimé", data.aiAgentImpact);

    // ─── MOTIVATION ───
    sectionTitle("Motivation");
    textBlock("", data.motivation);

    // ─── LIENS ───
    const links = [
      { label: "LinkedIn", value: data.linkedinUrl },
      { label: "Twitter/X", value: data.twitterUrl },
      { label: "GitHub", value: data.githubUrl },
      { label: "Site web", value: data.websiteUrl },
      { label: "Autre", value: data.otherSocialUrl },
      { label: "CV", value: data.cvFileUrl },
      { label: "Vidéo pitch", value: data.videoFileUrl },
    ].filter(l => l.value);

    if (links.length > 0) {
      sectionTitle("Liens & Documents");
      links.forEach(l => fieldRow(l.label, l.value!));
    }

    // ─── FOOTER ───
    if (y > 750) { doc.addPage(); y = 50; }
    y += 20;
    doc.moveTo(50, y).lineTo(50 + pageWidth, y).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
    y += 10;
    doc.fontSize(8).fillColor(COLORS.gray).text(
      `Document généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} · Neopolis Akademy · info@neopolis-dev.com`,
      50, y, { align: "center", width: pageWidth }
    );

    doc.end();
  });
}
