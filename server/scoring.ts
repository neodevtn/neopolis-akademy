/**
 * Scoring system for Neopolis Akademy applications
 * - Technical score: 40%
 * - Business/Métier score: 35%
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
}

export interface ScoringResult {
  scoreTechnique: number;
  scoreMetier: number;
  scoreCommunication: number;
  scoreTotal: number;
}

export function calculateScore(input: ScoringInput): ScoringResult {
  // Technical score (40% weight)
  const progScore = programmingLevels[input.programmingLevel] || 0;
  const aiScore = aiKnowledgeLevels[input.aiKnowledge] || 0;
  const cloudScore = cloudLevels[input.cloudExperience] || 0;
  const toolsBonus = input.technicalTools && input.technicalTools.split(",").length >= 3 ? 10 : 0;
  const certBonus = input.certifications && input.certifications.trim().length > 0 ? 10 : 0;
  
  // AI knowledge is weighted more heavily (40%), programming (30%), cloud (20%), bonuses (10%)
  const scoreTechnique = Math.min(100,
    (aiScore * 0.4) + (progScore * 0.3) + (cloudScore * 0.2) + toolsBonus + certBonus
  );

  // Business/Métier score (35% weight)
  const sectorScore = sectorExpertiseLevels[input.sectorExpertise] || 0;
  const networkScore = clientNetworkLevels[input.clientNetwork] || 0;
  const bizDevScore = businessDevLevels[input.businessDevelopment] || 0;
  const experienceBonus = Math.min(20, input.yearsExperience * 2); // max 20 points for 10+ years
  
  const scoreMetier = Math.min(100,
    (sectorScore * 0.35) + (networkScore * 0.25) + (bizDevScore * 0.25) + experienceBonus
  );

  // Communication score (25% weight)
  const speakingScore = publicSpeakingLevels[input.publicSpeaking] || 0;
  const salesScore = salesExperienceLevels[input.salesExperience] || 0;
  const languageBonus = input.languages ? Math.min(20, input.languages.split(",").length * 7) : 0;
  const motivationBonus = input.motivation.length >= 200 ? 15 : input.motivation.length >= 100 ? 10 : 5;
  
  const scoreCommunication = Math.min(100,
    (speakingScore * 0.3) + (salesScore * 0.3) + languageBonus + motivationBonus
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
