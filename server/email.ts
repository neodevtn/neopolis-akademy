import { Resend } from "resend";

// ============================================================
// TYPES
// ============================================================

type Language = "fr" | "en";

interface ConfirmationEmailData {
  to: string;
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  currentRole: string;
  language?: Language;
  scores: {
    scoreTotal: number;
    scoreTechnique: number;
    scoreMetier: number;
    scoreCommunication: number;
  };
}

interface DecisionEmailData {
  to: string;
  firstName: string;
  lastName: string;
  language?: Language;
  decision: "selectionne" | "refuse";
  scores: {
    scoreTotal: number;
    scoreTechnique: number;
    scoreMetier: number;
    scoreCommunication: number;
  };
  adminNotes?: string;
  platformUrl?: string;
  recommendedCourses?: string[];
}

interface InvitationEmailData {
  to: string;
  name?: string | null;
  language?: Language;
  invitedBy: string;
  invitationLink: string;
  message?: string;
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

const FROM_ADDRESS = "Neopolis Akademy <info@neopolis-dev.com>";

function emailHeader(subtitle: string): string {
  return `
    <div style="background: linear-gradient(135deg, #0f1b2d 0%, #1a2d4a 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: -0.5px;">Neopolis <span style="color: #e11d48;">Akademy</span></h1>
      <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">${subtitle}</p>
    </div>`;
}

function emailFooter(lang: Language): string {
  const text = lang === "fr"
    ? "Neopolis Development — FINTECH & Éditeur d'Intelligence"
    : "Neopolis Development — FINTECH & Intelligence Publisher";
  return `
    <div style="background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">${text}</p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">www.neopolis-dev.com</p>
    </div>`;
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    ${content}
  </div>
</body>
</html>`;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 50) return "#ca8a04";
  return "#dc2626";
}

function scoreSection(scores: ConfirmationEmailData["scores"], lang: Language): string {
  const labels = lang === "fr"
    ? { title: "Vos Scores", total: "Score total", tech: "Technique (40%)", metier: "Métier (35%)", comm: "Communication (25%)" }
    : { title: "Your Scores", total: "Total score", tech: "Technical (40%)", metier: "Business (35%)", comm: "Communication (25%)" };

  return `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
      <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">${labels.title}</h2>
      <div style="text-align: center; margin: 0 0 20px;">
        <span style="font-size: 48px; font-weight: 700; color: ${scoreColor(scores.scoreTotal)};">${scores.scoreTotal.toFixed(1)}%</span>
        <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0;">${labels.total}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; font-size: 13px; color: #475569;">${labels.tech}</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${scoreColor(scores.scoreTechnique)};">${scores.scoreTechnique.toFixed(1)}%</td></tr>
        <tr><td style="padding: 8px 0; font-size: 13px; color: #475569; border-top: 1px solid #f1f5f9;">${labels.metier}</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${scoreColor(scores.scoreMetier)}; border-top: 1px solid #f1f5f9;">${scores.scoreMetier.toFixed(1)}%</td></tr>
        <tr><td style="padding: 8px 0; font-size: 13px; color: #475569; border-top: 1px solid #f1f5f9;">${labels.comm}</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${scoreColor(scores.scoreCommunication)}; border-top: 1px solid #f1f5f9;">${scores.scoreCommunication.toFixed(1)}%</td></tr>
      </table>
    </div>`;
}

// ============================================================
// 1. CONFIRMATION EMAIL (candidature received)
// ============================================================

function buildConfirmationHtml(data: ConfirmationEmailData): string {
  const lang = data.language || "fr";
  const i18n = lang === "fr" ? {
    subtitle: "Confirmation de candidature",
    greeting: `Bonjour <strong>${data.firstName} ${data.lastName}</strong>,`,
    body: "Nous avons bien reçu votre candidature au programme Neopolis Akademy. Merci pour votre intérêt !",
    recapTitle: "Récapitulatif",
    country: "Pays",
    sector: "Secteur",
    role: "Poste actuel",
    stepsTitle: "Prochaines étapes",
    steps: [
      "Examen de votre candidature par notre comité de sélection",
      "Si sélectionné(e) : accès à la formation e-learning IA (7 jours)",
      "Accès plateforme Anthropic pour préparer la certification CCA",
      "Passage de la certification avant le <strong style=\"color: #e11d48;\">31 Août 2026</strong>",
    ],
    reminder: "Programme 100% GRATUIT · Formation + Certification + Statut AI Solutions Partner",
  } : {
    subtitle: "Application Confirmation",
    greeting: `Hello <strong>${data.firstName} ${data.lastName}</strong>,`,
    body: "We have received your application to the Neopolis Akademy program. Thank you for your interest!",
    recapTitle: "Summary",
    country: "Country",
    sector: "Sector",
    role: "Current Role",
    stepsTitle: "Next Steps",
    steps: [
      "Review of your application by our selection committee",
      "If selected: access to AI e-learning training (7 days)",
      "Access to Anthropic platform to prepare for CCA certification",
      "Complete certification before <strong style=\"color: #e11d48;\">August 31, 2026</strong>",
    ],
    reminder: "100% FREE Program · Training + Certification + AI Solutions Partner Status",
  };

  const content = `
    ${emailHeader(i18n.subtitle)}
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #1e293b; margin: 0 0 24px;">${i18n.greeting}</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">${i18n.body}</p>
      ${scoreSection(data.scores, lang)}
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">${i18n.recapTitle}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">${i18n.country}</td><td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${data.country}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">${i18n.sector}</td><td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${data.sector}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">${i18n.role}</td><td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${data.currentRole}</td></tr>
        </table>
      </div>
      <div style="margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">${i18n.stepsTitle}</h2>
        <ol style="padding-left: 20px; margin: 0; color: #475569; font-size: 14px; line-height: 2;">
          ${i18n.steps.map(s => `<li>${s}</li>`).join("")}
        </ol>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #166534;">✓ ${i18n.reminder}</p>
      </div>
    </div>
    ${emailFooter(lang)}`;

  return emailWrapper(content);
}

function buildConfirmationText(data: ConfirmationEmailData): string {
  const lang = data.language || "fr";
  if (lang === "fr") {
    return `Bonjour ${data.firstName} ${data.lastName},

Nous avons bien reçu votre candidature au programme Neopolis Akademy.

VOS SCORES :
- Score Total : ${data.scores.scoreTotal.toFixed(1)}%
- Technique (40%) : ${data.scores.scoreTechnique.toFixed(1)}%
- Métier (35%) : ${data.scores.scoreMetier.toFixed(1)}%
- Communication (25%) : ${data.scores.scoreCommunication.toFixed(1)}%

RÉCAPITULATIF :
- Pays : ${data.country}
- Secteur : ${data.sector}
- Poste : ${data.currentRole}

PROCHAINES ÉTAPES :
1. Examen par notre comité de sélection
2. Si sélectionné(e) : formation e-learning IA (7 jours)
3. Accès plateforme Anthropic + certification CCA
4. Date limite : 31 Août 2026

Programme 100% GRATUIT.

Cordialement,
L'équipe Neopolis Akademy
www.neopolis-dev.com`;
  }
  return `Hello ${data.firstName} ${data.lastName},

We have received your application to the Neopolis Akademy program.

YOUR SCORES:
- Total Score: ${data.scores.scoreTotal.toFixed(1)}%
- Technical (40%): ${data.scores.scoreTechnique.toFixed(1)}%
- Business (35%): ${data.scores.scoreMetier.toFixed(1)}%
- Communication (25%): ${data.scores.scoreCommunication.toFixed(1)}%

SUMMARY:
- Country: ${data.country}
- Sector: ${data.sector}
- Role: ${data.currentRole}

NEXT STEPS:
1. Review by our selection committee
2. If selected: AI e-learning training (7 days)
3. Anthropic platform access + CCA certification
4. Deadline: August 31, 2026

100% FREE program.

Best regards,
The Neopolis Akademy Team
www.neopolis-dev.com`;
}

// ============================================================
// 2. DECISION EMAIL (acceptance or refusal)
// ============================================================

function buildDecisionHtml(data: DecisionEmailData): string {
  const lang = data.language || "fr";
  const accepted = data.decision === "selectionne";
  const platformUrl = data.platformUrl || "https://akademy.neodev.click";

  const i18n = lang === "fr" ? {
    subtitle: accepted ? "Candidature acceptée" : "Résultat de candidature",
    greeting: `Bonjour <strong>${data.firstName} ${data.lastName}</strong>,`,
    acceptBody: `Nous avons le plaisir de vous informer que votre candidature au programme <strong>Neopolis Akademy</strong> a été <span style="color: #16a34a; font-weight: 600;">acceptée</span>. Félicitations !`,
    refuseBody: `Après examen attentif de votre candidature au programme <strong>Neopolis Akademy</strong>, nous ne sommes malheureusement pas en mesure de retenir votre profil pour cette session.`,
    accessTitle: "Vos accès",
    accessPlatform: "Plateforme de formation",
    accessLogin: "Connectez-vous avec l'email utilisé lors de votre candidature",
    recommendTitle: "Parcours recommandé",
    nextStepsTitle: "Prochaines étapes",
    acceptSteps: [
      "Connectez-vous à la plateforme avec votre email de candidature",
      "Complétez la formation e-learning IA (7 jours recommandés)",
      "Préparez et passez la certification CCA sur la plateforme Anthropic",
      "Obtenez votre statut d'AI Solutions Partner avant le 31 Août 2026",
    ],
    refuseEncourage: "Nous vous encourageons à continuer à développer vos compétences en IA et à repostuler lors de la prochaine session. Le domaine de l'intelligence artificielle évolue rapidement et de nouvelles opportunités se présenteront.",
    refuseReapply: "Vous pourrez soumettre une nouvelle candidature lors de la prochaine session d'inscription.",
    notesTitle: "Commentaires du comité",
    closing: accepted ? "Bienvenue dans le programme !" : "Nous vous souhaitons le meilleur pour la suite.",
  } : {
    subtitle: accepted ? "Application Accepted" : "Application Result",
    greeting: `Hello <strong>${data.firstName} ${data.lastName}</strong>,`,
    acceptBody: `We are pleased to inform you that your application to the <strong>Neopolis Akademy</strong> program has been <span style="color: #16a34a; font-weight: 600;">accepted</span>. Congratulations!`,
    refuseBody: `After careful review of your application to the <strong>Neopolis Akademy</strong> program, we are unfortunately unable to retain your profile for this session.`,
    accessTitle: "Your Access",
    accessPlatform: "Training Platform",
    accessLogin: "Log in with the email used during your application",
    recommendTitle: "Recommended Path",
    nextStepsTitle: "Next Steps",
    acceptSteps: [
      "Log in to the platform with your application email",
      "Complete the AI e-learning training (7 days recommended)",
      "Prepare and pass the CCA certification on the Anthropic platform",
      "Obtain your AI Solutions Partner status before August 31, 2026",
    ],
    refuseEncourage: "We encourage you to continue developing your AI skills and to reapply in the next session. The field of artificial intelligence is evolving rapidly and new opportunities will arise.",
    refuseReapply: "You will be able to submit a new application during the next registration session.",
    notesTitle: "Committee Comments",
    closing: accepted ? "Welcome to the program!" : "We wish you all the best.",
  };

  let body = "";
  if (accepted) {
    body = `
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">${i18n.acceptBody}</p>
      ${scoreSection(data.scores, lang)}
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">${i18n.accessTitle}</h2>
        <p style="font-size: 13px; color: #166534; margin: 0 0 8px;"><strong>${i18n.accessPlatform}:</strong></p>
        <a href="${platformUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">${platformUrl}</a>
        <p style="font-size: 12px; color: #4ade80; margin: 12px 0 0;">${i18n.accessLogin}</p>
      </div>
      ${data.recommendedCourses && data.recommendedCourses.length > 0 ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">${i18n.recommendTitle}</h2>
        <ol style="padding-left: 20px; margin: 0; color: #1e40af; font-size: 14px; line-height: 2;">
          ${data.recommendedCourses.map(c => `<li>${c}</li>`).join("")}
        </ol>
      </div>` : ""}
      <div style="margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">${i18n.nextStepsTitle}</h2>
        <ol style="padding-left: 20px; margin: 0; color: #475569; font-size: 14px; line-height: 2;">
          ${i18n.acceptSteps.map(s => `<li>${s}</li>`).join("")}
        </ol>
      </div>`;
  } else {
    body = `
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">${i18n.refuseBody}</p>
      ${scoreSection(data.scores, lang)}
      <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <p style="font-size: 14px; color: #92400e; line-height: 1.6; margin: 0 0 12px;">${i18n.refuseEncourage}</p>
        <p style="font-size: 13px; color: #b45309; margin: 0;">${i18n.refuseReapply}</p>
      </div>`;
  }

  // Admin notes section
  if (data.adminNotes) {
    body += `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">${i18n.notesTitle}</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0; font-style: italic;">${data.adminNotes}</p>
      </div>`;
  }

  body += `<p style="font-size: 14px; color: #475569; margin: 24px 0 0;">${i18n.closing}</p>`;

  const content = `
    ${emailHeader(i18n.subtitle)}
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #1e293b; margin: 0 0 24px;">${i18n.greeting}</p>
      ${body}
    </div>
    ${emailFooter(lang)}`;

  return emailWrapper(content);
}

function buildDecisionText(data: DecisionEmailData): string {
  const lang = data.language || "fr";
  const accepted = data.decision === "selectionne";
  const platformUrl = data.platformUrl || "https://akademy.neodev.click";

  if (lang === "fr") {
    if (accepted) {
      return `Bonjour ${data.firstName} ${data.lastName},

Nous avons le plaisir de vous informer que votre candidature au programme Neopolis Akademy a été ACCEPTÉE. Félicitations !

VOS SCORES :
- Score Total : ${data.scores.scoreTotal.toFixed(1)}%
- Technique (40%) : ${data.scores.scoreTechnique.toFixed(1)}%
- Métier (35%) : ${data.scores.scoreMetier.toFixed(1)}%
- Communication (25%) : ${data.scores.scoreCommunication.toFixed(1)}%

VOS ACCÈS :
Plateforme : ${platformUrl}
Connectez-vous avec l'email utilisé lors de votre candidature.

${data.recommendedCourses?.length ? `PARCOURS RECOMMANDÉ :\n${data.recommendedCourses.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n` : ""}PROCHAINES ÉTAPES :
1. Connectez-vous à la plateforme
2. Complétez la formation e-learning IA (7 jours)
3. Préparez la certification CCA
4. Obtenez votre statut avant le 31 Août 2026
${data.adminNotes ? `\nCOMMENTAIRES DU COMITÉ :\n${data.adminNotes}\n` : ""}
Bienvenue dans le programme !

Cordialement,
L'équipe Neopolis Akademy`;
    }
    return `Bonjour ${data.firstName} ${data.lastName},

Après examen attentif de votre candidature au programme Neopolis Akademy, nous ne sommes malheureusement pas en mesure de retenir votre profil pour cette session.

VOS SCORES :
- Score Total : ${data.scores.scoreTotal.toFixed(1)}%
- Technique (40%) : ${data.scores.scoreTechnique.toFixed(1)}%
- Métier (35%) : ${data.scores.scoreMetier.toFixed(1)}%
- Communication (25%) : ${data.scores.scoreCommunication.toFixed(1)}%

Nous vous encourageons à continuer à développer vos compétences en IA et à repostuler lors de la prochaine session.
${data.adminNotes ? `\nCOMMENTAIRES DU COMITÉ :\n${data.adminNotes}\n` : ""}
Nous vous souhaitons le meilleur pour la suite.

Cordialement,
L'équipe Neopolis Akademy`;
  }

  // English
  if (accepted) {
    return `Hello ${data.firstName} ${data.lastName},

We are pleased to inform you that your application to the Neopolis Akademy program has been ACCEPTED. Congratulations!

YOUR SCORES:
- Total Score: ${data.scores.scoreTotal.toFixed(1)}%
- Technical (40%): ${data.scores.scoreTechnique.toFixed(1)}%
- Business (35%): ${data.scores.scoreMetier.toFixed(1)}%
- Communication (25%): ${data.scores.scoreCommunication.toFixed(1)}%

YOUR ACCESS:
Platform: ${platformUrl}
Log in with the email used during your application.

${data.recommendedCourses?.length ? `RECOMMENDED PATH:\n${data.recommendedCourses.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n` : ""}NEXT STEPS:
1. Log in to the platform
2. Complete AI e-learning training (7 days)
3. Prepare for CCA certification
4. Obtain your status before August 31, 2026
${data.adminNotes ? `\nCOMMITTEE COMMENTS:\n${data.adminNotes}\n` : ""}
Welcome to the program!

Best regards,
The Neopolis Akademy Team`;
  }
  return `Hello ${data.firstName} ${data.lastName},

After careful review of your application to the Neopolis Akademy program, we are unfortunately unable to retain your profile for this session.

YOUR SCORES:
- Total Score: ${data.scores.scoreTotal.toFixed(1)}%
- Technical (40%): ${data.scores.scoreTechnique.toFixed(1)}%
- Business (35%): ${data.scores.scoreMetier.toFixed(1)}%
- Communication (25%): ${data.scores.scoreCommunication.toFixed(1)}%

We encourage you to continue developing your AI skills and to reapply in the next session.
${data.adminNotes ? `\nCOMMITTEE COMMENTS:\n${data.adminNotes}\n` : ""}
We wish you all the best.

Best regards,
The Neopolis Akademy Team`;
}

// ============================================================
// 3. INVITATION EMAIL
// ============================================================

function buildInvitationHtml(data: InvitationEmailData): string {
  const lang = data.language || "fr";
  const displayName = data.name || (lang === "fr" ? "Futur(e) apprenant(e)" : "Future Learner");

  const i18n = lang === "fr" ? {
    subtitle: "Invitation au programme",
    greeting: `Bonjour <strong>${displayName}</strong>,`,
    body: `Vous avez été invité(e) par <strong>${data.invitedBy}</strong> à rejoindre le programme de formation <strong>Neopolis Akademy</strong>.`,
    about: "Neopolis Akademy est un programme de formation gratuit en Intelligence Artificielle, menant à la certification Claude Certified Associate (CCA) et au statut d'AI Solutions Partner.",
    btnText: "Accepter l'invitation",
    features: [
      "Formation e-learning complète en IA",
      "Préparation à la certification CCA",
      "Accès à la plateforme Anthropic",
      "Statut AI Solutions Partner",
    ],
    featuresTitle: "Ce qui vous attend",
    expiry: "Ce lien d'invitation expire dans 7 jours.",
    ignore: "Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.",
  } : {
    subtitle: "Program Invitation",
    greeting: `Hello <strong>${displayName}</strong>,`,
    body: `You have been invited by <strong>${data.invitedBy}</strong> to join the <strong>Neopolis Akademy</strong> training program.`,
    about: "Neopolis Akademy is a free Artificial Intelligence training program, leading to the Claude Certified Associate (CCA) certification and AI Solutions Partner status.",
    btnText: "Accept Invitation",
    features: [
      "Complete AI e-learning training",
      "CCA certification preparation",
      "Access to the Anthropic platform",
      "AI Solutions Partner status",
    ],
    featuresTitle: "What awaits you",
    expiry: "This invitation link expires in 7 days.",
    ignore: "If you did not request this invitation, you can ignore this email.",
  };

  const messageBlock = data.message ? `
    <div style="background: #f8fafc; border-left: 3px solid #e11d48; padding: 16px 20px; margin: 0 0 24px;">
      <p style="font-size: 13px; color: #64748b; margin: 0 0 4px; font-style: italic;">${lang === "fr" ? "Message de" : "Message from"} ${data.invitedBy}:</p>
      <p style="font-size: 14px; color: #1e293b; margin: 0; line-height: 1.5;">${data.message}</p>
    </div>` : "";

  const content = `
    ${emailHeader(i18n.subtitle)}
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #1e293b; margin: 0 0 24px;">${i18n.greeting}</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">${i18n.body}</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">${i18n.about}</p>
      ${messageBlock}
      <div style="text-align: center; margin: 0 0 32px;">
        <a href="${data.invitationLink}" style="display: inline-block; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">${i18n.btnText}</a>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">${i18n.featuresTitle}</h2>
        <ul style="padding-left: 20px; margin: 0; color: #475569; font-size: 14px; line-height: 2;">
          ${i18n.features.map(f => `<li>${f}</li>`).join("")}
        </ul>
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px; text-align: center;">${i18n.expiry}</p>
      <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">${i18n.ignore}</p>
    </div>
    ${emailFooter(lang)}`;

  return emailWrapper(content);
}

function buildInvitationText(data: InvitationEmailData): string {
  const lang = data.language || "fr";
  const displayName = data.name || (lang === "fr" ? "Futur(e) apprenant(e)" : "Future Learner");

  if (lang === "fr") {
    return `Bonjour ${displayName},

Vous avez été invité(e) par ${data.invitedBy} à rejoindre le programme de formation Neopolis Akademy.

Neopolis Akademy est un programme de formation gratuit en Intelligence Artificielle, menant à la certification Claude Certified Associate (CCA) et au statut d'AI Solutions Partner.
${data.message ? `\nMessage de ${data.invitedBy}: ${data.message}\n` : ""}
ACCEPTER L'INVITATION :
${data.invitationLink}

CE QUI VOUS ATTEND :
- Formation e-learning complète en IA
- Préparation à la certification CCA
- Accès à la plateforme Anthropic
- Statut AI Solutions Partner

Ce lien d'invitation expire dans 7 jours.

Cordialement,
L'équipe Neopolis Akademy`;
  }
  return `Hello ${displayName},

You have been invited by ${data.invitedBy} to join the Neopolis Akademy training program.

Neopolis Akademy is a free Artificial Intelligence training program, leading to the Claude Certified Associate (CCA) certification and AI Solutions Partner status.
${data.message ? `\nMessage from ${data.invitedBy}: ${data.message}\n` : ""}
ACCEPT INVITATION:
${data.invitationLink}

WHAT AWAITS YOU:
- Complete AI e-learning training
- CCA certification preparation
- Access to the Anthropic platform
- AI Solutions Partner status

This invitation link expires in 7 days.

Best regards,
The Neopolis Akademy Team`;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Send a confirmation email to the candidate after form submission.
 */
export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log(`[Email] RESEND_API_KEY not configured. Email NOT sent to ${data.to}`);
    return;
  }

  const resend = new Resend(resendApiKey);
  const lang = data.language || "fr";
  const subject = lang === "fr"
    ? `Neopolis Akademy — Confirmation de candidature (Score: ${data.scores.scoreTotal.toFixed(1)}%)`
    : `Neopolis Akademy — Application Confirmation (Score: ${data.scores.scoreTotal.toFixed(1)}%)`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [data.to],
    subject,
    html: buildConfirmationHtml(data),
    text: buildConfirmationText(data),
  });

  if (error) {
    console.error(`[Email] Resend error for ${data.to}:`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
  console.log(`[Email] Confirmation sent to ${data.to}`);
}

/**
 * Send acceptance or refusal email to a candidate.
 */
export async function sendDecisionEmail(data: DecisionEmailData): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log(`[Email] RESEND_API_KEY not configured. Decision email NOT sent to ${data.to}`);
    return;
  }

  const resend = new Resend(resendApiKey);
  const lang = data.language || "fr";
  const accepted = data.decision === "selectionne";
  const subject = lang === "fr"
    ? accepted
      ? "Neopolis Akademy — Votre candidature a été acceptée !"
      : "Neopolis Akademy — Résultat de votre candidature"
    : accepted
      ? "Neopolis Akademy — Your application has been accepted!"
      : "Neopolis Akademy — Your application result";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [data.to],
    subject,
    html: buildDecisionHtml(data),
    text: buildDecisionText(data),
  });

  if (error) {
    console.error(`[Email] Resend error for ${data.to}:`, error);
    throw new Error(`Decision email sending failed: ${error.message}`);
  }
  console.log(`[Email] Decision (${data.decision}) sent to ${data.to}`);
}

/**
 * Send an invitation email to join the platform.
 */
export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log(`[Email] RESEND_API_KEY not configured. Invitation email NOT sent to ${data.to}`);
    return;
  }

  const resend = new Resend(resendApiKey);
  const lang = data.language || "fr";
  const subject = lang === "fr"
    ? "Neopolis Akademy — Vous êtes invité(e) à rejoindre le programme"
    : "Neopolis Akademy — You are invited to join the program";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [data.to],
    subject,
    html: buildInvitationHtml(data),
    text: buildInvitationText(data),
  });

  if (error) {
    console.error(`[Email] Resend error for ${data.to}:`, error);
    throw new Error(`Invitation email sending failed: ${error.message}`);
  }
  console.log(`[Email] Invitation sent to ${data.to}`);
}
