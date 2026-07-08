/**
 * Scoring system for Neopolis Akademy applications
 * - Technical score: 40%
 * - Business/Métier score: 35% (includes distribution network + entrepreneurial profile)
 * - Communication score: 25%
 */

type LevelMap = Record<string, number>;

const programmingLevels: LevelMap = {
  none: 0, beginner: 20, intermediate: 50, advanced: 80, expert: 100
};

const aiKnowledgeLevels: LevelMap = {
  none: 0, basic: 20, intermediate: 50, advanced: 80, expert: 100
};

const cloudLevels: LevelMap = {
  none: 0, basic: 20, intermediate: 50, advanced: 80, expert: 100
};

const sectorExpertiseLevels: LevelMap = {
  junior: 25, intermediate: 50, senior: 80, expert: 100
};

const clientNetworkLevels: LevelMap = {
  none: 0, small: 30, medium: 65, large: 100
};

const businessDevLevels: LevelMap = {
  none: 0, basic: 30, intermediate: 65, advanced: 100
};

const publicSpeakingLevels: LevelMap = {
  none: 0, basic: 30, intermediate: 65, advanced: 100
};

const salesExperienceLevels: LevelMap = {
  none: 0, less_1y: 20, "1_3y": 50, "3_5y": 75, more_5y: 100
};

// New scoring maps
const industryContactsLevels: LevelMap = {
  none: 0, few: 20, moderate: 50, extensive: 80, very_extensive: 100
};

const targetMarketKnowledgeLevels: LevelMap = {
  none: 0, basic: 25, good: 50, excellent: 80, expert: 100
};

const riskToleranceLevels: LevelMap = {
  very_low: 10, low: 30, moderate: 50, high: 80, very_high: 100
};

const autonomyLevels: LevelMap = {
  needs_guidance: 10, somewhat_autonomous: 30, autonomous: 55, very_autonomous: 80, fully_independent: 100
};

const resilienceLevels: LevelMap = {
  low: 15, moderate: 45, high: 75, very_high: 100
};

const leadershipStyleLevels: LevelMap = {
  follower: 10, collaborative: 40, situational: 60, visionary: 85, transformational: 100
};

export interface ScoringInput {
  programmingLevel: string;
  aiKnowledge: string;
  cloudExperience: string;
  technicalTools?: string;
  certifications?: string;
  sectorExpertise: string;
  clientNetwork: string;
  businessDevelopment: string;
  yearsExperience: number;
  publicSpeaking: string;
  salesExperience: string;
  languages?: string;
  motivation: string;
  // New fields
  industryContacts?: string;
  targetMarketKnowledge?: string;
  distributionNetwork?: string;
  existingPartnerships?: string;
  riskTolerance?: string;
  autonomyLevel?: string;
  resilienceLevel?: string;
  leadershipStyle?: string;
  entrepreneurialExperience?: string;
  aiAgentScenario?: string;
  aiAgentImpact?: string;
}

export interface ScoringResult {
  scoreTechnique: number;
  scoreMetier: number;
  scoreCommunication: number;
  scoreTotal: number;
}

export function calculateScore(input: ScoringInput): ScoringResult {
  // === Technical score (40% weight) ===
  const progScore = programmingLevels[input.programmingLevel] || 0;
  const aiScore = aiKnowledgeLevels[input.aiKnowledge] || 0;
  const cloudScore = cloudLevels[input.cloudExperience] || 0;
  const toolsBonus = input.technicalTools && input.technicalTools.split(",").length >= 3 ? 10 : 0;
  const certBonus = input.certifications && input.certifications.trim().length > 0 ? 10 : 0;
  
  // AI Agent scenario bonus (significant for technical score)
  const scenarioBonus = input.aiAgentScenario
    ? (input.aiAgentScenario.length >= 500 ? 15 : input.aiAgentScenario.length >= 200 ? 10 : 5)
    : 0;
  
  // AI knowledge is weighted more heavily (35%), programming (20%), cloud (15%), scenario (20%), bonuses (10%)
  const scoreTechnique = Math.min(100,
    (aiScore * 0.35) + (progScore * 0.20) + (cloudScore * 0.15) + (scenarioBonus) + toolsBonus + certBonus
  );

  // === Business/Métier score (35% weight) ===
  // Includes: sector expertise, client network, biz dev, distribution network, entrepreneurial profile
  const sectorScore = sectorExpertiseLevels[input.sectorExpertise] || 0;
  const networkScore = clientNetworkLevels[input.clientNetwork] || 0;
  const bizDevScore = businessDevLevels[input.businessDevelopment] || 0;
  const experienceBonus = Math.min(15, input.yearsExperience * 1.5);
  
  // Distribution network scoring
  const industryContactsScore = industryContactsLevels[input.industryContacts || "none"] || 0;
  const targetMarketScore = targetMarketKnowledgeLevels[input.targetMarketKnowledge || "none"] || 0;
  const distributionBonus = input.distributionNetwork && input.distributionNetwork.length >= 100 ? 10 : 
                            input.distributionNetwork && input.distributionNetwork.length >= 50 ? 5 : 0;
  const partnershipsBonus = input.existingPartnerships && input.existingPartnerships.length >= 50 ? 5 : 0;
  
  // Entrepreneurial profile scoring
  const riskScore = riskToleranceLevels[input.riskTolerance || "moderate"] || 50;
  const autonomyScore = autonomyLevels[input.autonomyLevel || "autonomous"] || 55;
  const resilienceScore = resilienceLevels[input.resilienceLevel || "moderate"] || 45;
  const leadershipScore = leadershipStyleLevels[input.leadershipStyle || "collaborative"] || 40;
  const entrepreneurialBonus = input.entrepreneurialExperience && input.entrepreneurialExperience.length >= 100 ? 8 : 
                               input.entrepreneurialExperience && input.entrepreneurialExperience.length >= 50 ? 4 : 0;
  
  // Weighted business score combining all factors
  const entrepreneurialAvg = (riskScore + autonomyScore + resilienceScore + leadershipScore) / 4;
  const distributionAvg = (industryContactsScore + targetMarketScore) / 2;
  
  const scoreMetier = Math.min(100,
    (sectorScore * 0.15) + (networkScore * 0.15) + (bizDevScore * 0.10) +
    (distributionAvg * 0.20) + (entrepreneurialAvg * 0.20) +
    experienceBonus + distributionBonus + partnershipsBonus + entrepreneurialBonus
  );

  // === Communication score (25% weight) ===
  const speakingScore = publicSpeakingLevels[input.publicSpeaking] || 0;
  const salesScore = salesExperienceLevels[input.salesExperience] || 0;
  const languageBonus = input.languages ? Math.min(15, input.languages.split(",").length * 5) : 0;
  const motivationBonus = input.motivation.length >= 200 ? 15 : input.motivation.length >= 100 ? 10 : 5;
  const impactBonus = input.aiAgentImpact && input.aiAgentImpact.length >= 100 ? 10 : 
                      input.aiAgentImpact && input.aiAgentImpact.length >= 50 ? 5 : 0;
  
  const scoreCommunication = Math.min(100,
    (speakingScore * 0.25) + (salesScore * 0.25) + languageBonus + motivationBonus + impactBonus
  );

  // Total weighted score
  const scoreTotal = (scoreTechnique * 0.4) + (scoreMetier * 0.35) + (scoreCommunication * 0.25);

  return {
    scoreTechnique: Math.round(scoreTechnique * 100) / 100,
    scoreMetier: Math.round(scoreMetier * 100) / 100,
    scoreCommunication: Math.round(scoreCommunication * 100) / 100,
    scoreTotal: Math.round(scoreTotal * 100) / 100,
  };
}
