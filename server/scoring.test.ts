import { describe, expect, it } from "vitest";
import { calculateScore, ScoringInput } from "./scoring";

describe("calculateScore", () => {
  it("returns low scores for minimum inputs", () => {
    const input: ScoringInput = {
      programmingLevel: "none",
      aiKnowledge: "none",
      cloudExperience: "none",
      technicalTools: "",
      certifications: "",
      sectorExpertise: "junior",
      clientNetwork: "none",
      businessDevelopment: "none",
      yearsExperience: 0,
      publicSpeaking: "none",
      salesExperience: "none",
      languages: "",
      motivation: "Short motivation text for testing purposes only.",
    };

    const result = calculateScore(input);

    expect(result.scoreTechnique).toBe(0);
    expect(result.scoreMetier).toBeLessThanOrEqual(30);
    expect(result.scoreCommunication).toBeGreaterThanOrEqual(0);
    expect(result.scoreTotal).toBeGreaterThanOrEqual(0);
    expect(result.scoreTotal).toBeLessThanOrEqual(100);
  });

  it("returns high scores for expert inputs with all new fields", () => {
    const input: ScoringInput = {
      programmingLevel: "expert",
      aiKnowledge: "expert",
      cloudExperience: "expert",
      technicalTools: "Python,JavaScript,Docker,Kubernetes,LangChain",
      certifications: "AWS Solutions Architect",
      sectorExpertise: "expert",
      clientNetwork: "large",
      businessDevelopment: "advanced",
      yearsExperience: 15,
      publicSpeaking: "advanced",
      salesExperience: "more_5y",
      languages: "Français,Anglais,Arabe",
      motivation: "Je suis passionné par l'IA et je souhaite contribuer à la transformation digitale de l'Afrique. Mon expérience de 15 ans dans le secteur technologique me permet d'apporter une expertise unique à ce programme.",
      // New fields
      industryContacts: "very_extensive",
      targetMarketKnowledge: "expert",
      distributionNetwork: "J'ai un réseau étendu de partenaires B2B dans le secteur bancaire en Afrique de l'Ouest, incluant plus de 50 contacts directs avec des décideurs.",
      existingPartnerships: "Partenaire officiel de SAP pour l'Afrique francophone, distributeur Microsoft 365.",
      riskTolerance: "very_high",
      autonomyLevel: "fully_independent",
      resilienceLevel: "very_high",
      leadershipStyle: "transformational",
      entrepreneurialExperience: "Fondateur de deux startups tech en Afrique, dont une levée de fonds de 2M$ en 2023. Expérience de 8 ans en tant qu'entrepreneur indépendant.",
      aiAgentScenario: "Un agent IA qui remplace le processus de comptabilité manuelle dans les PME africaines. L'agent collecte automatiquement les factures par email et WhatsApp, les catégorise, génère les écritures comptables, produit les déclarations fiscales mensuelles et alerte le dirigeant en cas d'anomalie. Cela remplace un comptable à temps partiel pour les entreprises de moins de 50 employés.",
      aiAgentImpact: "Impact : réduction de 80% du coût comptable pour les PME. Marché cible : 500,000 PME en Afrique francophone. Modèle : abonnement mensuel de 50-200$/mois selon la taille.",
    };

    const result = calculateScore(input);

    expect(result.scoreTechnique).toBeGreaterThan(80);
    expect(result.scoreMetier).toBeGreaterThan(80);
    expect(result.scoreCommunication).toBeGreaterThan(60);
    expect(result.scoreTotal).toBeGreaterThan(75);
    expect(result.scoreTotal).toBeLessThanOrEqual(100);
  });

  it("correctly weights technical score at 40%", () => {
    const baseInput: ScoringInput = {
      programmingLevel: "none",
      aiKnowledge: "none",
      cloudExperience: "none",
      technicalTools: "",
      certifications: "",
      sectorExpertise: "junior",
      clientNetwork: "none",
      businessDevelopment: "none",
      yearsExperience: 0,
      publicSpeaking: "none",
      salesExperience: "none",
      languages: "",
      motivation: "Short motivation text for testing purposes only.",
    };

    const techInput: ScoringInput = {
      ...baseInput,
      programmingLevel: "expert",
      aiKnowledge: "expert",
      cloudExperience: "expert",
    };

    const baseResult = calculateScore(baseInput);
    const techResult = calculateScore(techInput);

    // Technical improvement should contribute ~40% to total
    const totalDiff = techResult.scoreTotal - baseResult.scoreTotal;
    const techDiff = techResult.scoreTechnique - baseResult.scoreTechnique;
    
    // The total diff should be approximately 40% of the tech diff
    expect(totalDiff).toBeCloseTo(techDiff * 0.4, 0);
  });

  it("caps all scores at 100", () => {
    const input: ScoringInput = {
      programmingLevel: "expert",
      aiKnowledge: "expert",
      cloudExperience: "expert",
      technicalTools: "Python,JavaScript,Docker,Kubernetes,LangChain,React,Node,Go",
      certifications: "AWS,GCP,Azure,CKA",
      sectorExpertise: "expert",
      clientNetwork: "large",
      businessDevelopment: "advanced",
      yearsExperience: 30,
      publicSpeaking: "advanced",
      salesExperience: "more_5y",
      languages: "Fr,En,Ar,Es,De",
      motivation: "A".repeat(500),
      industryContacts: "very_extensive",
      targetMarketKnowledge: "expert",
      distributionNetwork: "A".repeat(200),
      existingPartnerships: "A".repeat(100),
      riskTolerance: "very_high",
      autonomyLevel: "fully_independent",
      resilienceLevel: "very_high",
      leadershipStyle: "transformational",
      entrepreneurialExperience: "A".repeat(200),
      aiAgentScenario: "A".repeat(600),
      aiAgentImpact: "A".repeat(200),
    };

    const result = calculateScore(input);

    expect(result.scoreTechnique).toBeLessThanOrEqual(100);
    expect(result.scoreMetier).toBeLessThanOrEqual(100);
    expect(result.scoreCommunication).toBeLessThanOrEqual(100);
    expect(result.scoreTotal).toBeLessThanOrEqual(100);
  });

  it("gives bonus for certifications, tools, and AI scenario", () => {
    const withoutBonus: ScoringInput = {
      programmingLevel: "intermediate",
      aiKnowledge: "intermediate",
      cloudExperience: "intermediate",
      technicalTools: "",
      certifications: "",
      sectorExpertise: "intermediate",
      clientNetwork: "small",
      businessDevelopment: "basic",
      yearsExperience: 5,
      publicSpeaking: "basic",
      salesExperience: "1_3y",
      languages: "Français",
      motivation: "Motivation text that is long enough to pass validation requirements.",
    };

    const withBonus: ScoringInput = {
      ...withoutBonus,
      technicalTools: "Python,Docker,Kubernetes,React",
      certifications: "AWS Solutions Architect",
      aiAgentScenario: "Un agent IA pour automatiser le support client des PME. L'agent répond aux questions fréquentes, escalade les cas complexes, et génère des rapports hebdomadaires sur les tendances des demandes clients. Il s'intègre avec WhatsApp, email et chat web.",
    };

    const resultWithout = calculateScore(withoutBonus);
    const resultWith = calculateScore(withBonus);

    expect(resultWith.scoreTechnique).toBeGreaterThan(resultWithout.scoreTechnique);
    expect(resultWith.scoreTotal).toBeGreaterThan(resultWithout.scoreTotal);
  });

  it("new distribution and entrepreneurial fields improve métier score", () => {
    const baseInput: ScoringInput = {
      programmingLevel: "intermediate",
      aiKnowledge: "intermediate",
      cloudExperience: "basic",
      sectorExpertise: "intermediate",
      clientNetwork: "small",
      businessDevelopment: "basic",
      yearsExperience: 5,
      publicSpeaking: "basic",
      salesExperience: "1_3y",
      languages: "Français",
      motivation: "Motivation text that is long enough to pass validation requirements.",
    };

    const enhancedInput: ScoringInput = {
      ...baseInput,
      industryContacts: "extensive",
      targetMarketKnowledge: "excellent",
      distributionNetwork: "Réseau de 30 partenaires dans le secteur de la santé en Afrique de l'Ouest, contacts avec les ministères de la santé du Sénégal et de la Côte d'Ivoire.",
      existingPartnerships: "Partenaire de distribution pour 3 éditeurs de logiciels médicaux.",
      riskTolerance: "high",
      autonomyLevel: "very_autonomous",
      resilienceLevel: "very_high",
      leadershipStyle: "visionary",
      entrepreneurialExperience: "Création d'une société de conseil en santé digitale en 2020, 15 clients actifs, CA de 200K$/an.",
    };

    const baseResult = calculateScore(baseInput);
    const enhancedResult = calculateScore(enhancedInput);

    expect(enhancedResult.scoreMetier).toBeGreaterThan(baseResult.scoreMetier);
    expect(enhancedResult.scoreTotal).toBeGreaterThan(baseResult.scoreTotal);
  });
});
