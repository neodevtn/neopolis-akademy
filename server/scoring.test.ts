import { describe, expect, it } from "vitest";
import { calculateScore, ScoringInput } from "./scoring";

describe("calculateScore", () => {
  it("returns zero scores for minimum inputs", () => {
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
    expect(result.scoreMetier).toBeLessThanOrEqual(25); // junior gives 25 * 0.35 = 8.75
    expect(result.scoreCommunication).toBeGreaterThanOrEqual(0);
    expect(result.scoreTotal).toBeGreaterThanOrEqual(0);
    expect(result.scoreTotal).toBeLessThanOrEqual(100);
  });

  it("returns high scores for expert inputs", () => {
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
    };

    const result = calculateScore(input);

    expect(result.scoreTechnique).toBeGreaterThan(80);
    expect(result.scoreMetier).toBeGreaterThan(70);
    expect(result.scoreCommunication).toBeGreaterThan(60);
    expect(result.scoreTotal).toBeGreaterThan(70);
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
    };

    const result = calculateScore(input);

    expect(result.scoreTechnique).toBeLessThanOrEqual(100);
    expect(result.scoreMetier).toBeLessThanOrEqual(100);
    expect(result.scoreCommunication).toBeLessThanOrEqual(100);
    expect(result.scoreTotal).toBeLessThanOrEqual(100);
  });

  it("gives bonus for certifications and tools", () => {
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
    };

    const resultWithout = calculateScore(withoutBonus);
    const resultWith = calculateScore(withBonus);

    expect(resultWith.scoreTechnique).toBeGreaterThan(resultWithout.scoreTechnique);
    expect(resultWith.scoreTotal).toBeGreaterThan(resultWithout.scoreTotal);
  });
});
