import { Resend } from "resend";

const FROM_ADDRESS = "Neopolis Akademy <info@neopolis-dev.com>";
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function buildDirectExamInvitationMessage(input: { name?: string; examTitle: string; url: string; existingAccount: boolean; language: "fr" | "en" }) {
  const french = input.language === "fr";
  const greeting = input.name?.trim() || (french ? "Bonjour" : "Hello");
  const introduction = french
    ? `Vous êtes invité(e) à passer directement l’examen de pratique « ${input.examTitle} » sur Neopolis Akademy, sans devoir parcourir les cours.`
    : `You are invited to take the “${input.examTitle}” practice exam directly on Neopolis Akademy, without having to complete the courses.`;
  const account = input.existingAccount
    ? (french ? "Connectez-vous avec votre compte existant pour accepter l’invitation." : "Sign in with your existing account to accept the invitation.")
    : (french ? "Créez votre compte apprenant et complétez votre profil (prénom, nom, téléphone) avant de commencer." : "Create a learner account and complete your profile (first name, last name, phone) before starting.");
  const notice = french
    ? "Cette invitation est valable sans limite de temps jusqu’à sa révocation par l’administration. Il s’agit d’un examen de pratique, et non de la certification officielle de l’organisme éditeur. Vous pouvez le repasser."
    : "This invitation does not expire unless the administration revokes it. This is a practice exam, not an official certification exam. You may retake it.";
  const subject = french ? `Neopolis Akademy — Invitation à l’examen ${input.examTitle}` : `Neopolis Akademy — Exam invitation: ${input.examTitle}`;
  const text = `${greeting},\n\n${introduction}\n\n${account}\n\n${notice}\n\n${french ? "Accepter l’invitation" : "Accept the invitation"}: ${input.url}\n\n${french ? "L’équipe Neopolis Akademy" : "Neopolis Akademy Team"}`;
  const html = `<!doctype html><html lang="${input.language}"><head><meta charset="utf-8"></head><body style="background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;padding:24px"><main style="max-width:580px;margin:auto;background:white;border-radius:12px;padding:32px"><h1 style="color:#16213e">Neopolis Akademy</h1><p>${escapeHtml(greeting)},</p><p>${escapeHtml(introduction)}</p><p>${escapeHtml(account)}</p><p>${escapeHtml(notice)}</p><p><a href="${escapeHtml(input.url)}" style="display:inline-block;background:#16213e;color:white;padding:12px 18px;border-radius:6px">${french ? "Accepter l’invitation" : "Accept the invitation"}</a></p><p><a href="${escapeHtml(input.url)}">${escapeHtml(input.url)}</a></p></main></body></html>`;
  return { subject, text, html };
}

export async function sendDirectExamInvitationEmail(input: {
  to: string; name?: string; examTitle: string; url: string; existingAccount: boolean; language: "fr" | "en";
}): Promise<{ delivered: boolean; messageId?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { delivered: false };
  const message = buildDirectExamInvitationMessage(input);
  const { data, error } = await new Resend(apiKey).emails.send({ from: FROM_ADDRESS, to: [input.to], ...message });
  if (error) throw new Error(`Échec de livraison de l’invitation : ${error.message}`);
  return { delivered: true, messageId: data?.id };
}
