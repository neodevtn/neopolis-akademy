import { Resend } from "resend";

interface ConfirmationEmailData {
  to: string;
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  currentRole: string;
  scores: {
    scoreTotal: number;
    scoreTechnique: number;
    scoreMetier: number;
    scoreCommunication: number;
  };
}

function buildEmailHtml(data: ConfirmationEmailData): string {
  const scoreColor = (score: number) => {
    if (score >= 70) return "#16a34a";
    if (score >= 50) return "#ca8a04";
    return "#dc2626";
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f1b2d 0%, #1a2d4a 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: -0.5px;">Neopolis <span style="color: #e11d48;">Akademy</span></h1>
      <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Confirmation de candidature</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #1e293b; margin: 0 0 24px;">Bonjour <strong>${data.firstName} ${data.lastName}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">Nous avons bien reçu votre candidature au programme Neopolis Akademy. Merci pour votre intérêt !</p>

      <!-- Score Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Vos Scores</h2>
        
        <div style="text-align: center; margin: 0 0 20px;">
          <span style="font-size: 48px; font-weight: 700; color: ${scoreColor(data.scores.scoreTotal)};">${data.scores.scoreTotal.toFixed(1)}%</span>
          <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0;">Score total</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #475569;">Technique (40%)</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${scoreColor(data.scores.scoreTechnique)};">${data.scores.scoreTechnique.toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #475569; border-top: 1px solid #f1f5f9;">Métier (35%)</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${scoreColor(data.scores.scoreMetier)}; border-top: 1px solid #f1f5f9;">${data.scores.scoreMetier.toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #475569; border-top: 1px solid #f1f5f9;">Communication (25%)</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${scoreColor(data.scores.scoreCommunication)}; border-top: 1px solid #f1f5f9;">${data.scores.scoreCommunication.toFixed(1)}%</td>
          </tr>
        </table>
      </div>

      <!-- Recap -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Récapitulatif</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Pays</td><td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${data.country}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Secteur</td><td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${data.sector}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Poste actuel</td><td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${data.currentRole}</td></tr>
        </table>
      </div>

      <!-- Next Steps -->
      <div style="margin: 0 0 24px;">
        <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Prochaines étapes</h2>
        <ol style="padding-left: 20px; margin: 0; color: #475569; font-size: 14px; line-height: 2;">
          <li>Examen de votre candidature par notre comité de sélection</li>
          <li>Si sélectionné(e) : accès à la formation e-learning IA (7 jours)</li>
          <li>Accès plateforme Anthropic pour préparer la certification CCA</li>
          <li>Passage de la certification avant le <strong style="color: #e11d48;">31 Août 2026</strong></li>
        </ol>
      </div>

      <!-- Reminder -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #166534;">✓ Programme 100% GRATUIT · Formation + Certification + Statut AI Solutions Partner</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">Neopolis Development — FINTECH & Éditeur d'Intelligence</p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">www.neopolis-dev.com</p>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(data: ConfirmationEmailData): string {
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

/**
 * Send a confirmation email to the candidate after form submission.
 * Uses Resend as the email provider. Falls back to logging if not configured.
 */
export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Graceful fallback: log the email for manual follow-up
    console.log(`[Email] RESEND_API_KEY not configured. Email NOT sent to ${data.to}`);
    console.log(`[Email] Candidate: ${data.firstName} ${data.lastName} | Score: ${data.scores.scoreTotal.toFixed(1)}%`);
    return;
  }

  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: "Neopolis Akademy <noreply@neopolis-dev.com>",
    to: [data.to],
    subject: `Neopolis Akademy — Confirmation de candidature (Score: ${data.scores.scoreTotal.toFixed(1)}%)`,
    html: buildEmailHtml(data),
    text: buildEmailText(data),
  });

  if (error) {
    console.error(`[Email] Resend error for ${data.to}:`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }

  console.log(`[Email] Confirmation sent successfully to ${data.to}`);
}
