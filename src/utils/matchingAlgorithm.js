// Algorithmic matching engine implementing Jaccard Index and Cosine Similarity

/**
 * Calculates Jaccard Index between two arrays of skills/tokens.
 * Jaccard Index = |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardIndex(skillsA = [], skillsB = []) {
  if (!skillsA.length || !skillsB.length) return 0;
  
  const setA = new Set(skillsA.map(s => s.toLowerCase().trim()));
  const setB = new Set(skillsB.map(s => s.toLowerCase().trim()));
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  return Number((intersection.size / union.size).toFixed(3));
}

/**
 * Calculates Cosine Similarity between two skill frequency / weight vectors.
 * Cosine Similarity = (A · B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(userSkills = [], targetSkills = []) {
  if (!userSkills.length || !targetSkills.length) return 0;

  const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
  const normalizedTarget = targetSkills.map(s => s.toLowerCase().trim());

  // Build unified vocabulary
  const vocab = Array.from(new Set([...normalizedUser, ...normalizedTarget]));
  
  if (vocab.length === 0) return 0;

  // Build binary/frequency vectors
  const vectorA = vocab.map(term => (normalizedUser.includes(term) ? 1 : 0));
  const vectorB = vocab.map(term => (normalizedTarget.includes(term) ? 1 : 0));

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vocab.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return Number((dotProduct / (magnitudeA * magnitudeB)).toFixed(3));
}

/**
 * Compute overall hybrid compatibility score (0 to 100%)
 * Combining:
 * 1. Skill overlap (Cosine Similarity & Jaccard Index)
 * 2. Technical niche alignment
 * 3. Availability match
 */
export function computeCompatibilityScore(student, target, options = {}) {
  const studentSkills = student?.skills || [];
  const targetSkills = target?.skills || target?.requiredSkills || [];

  const jaccard = calculateJaccardIndex(studentSkills, targetSkills);
  const cosine = calculateCosineSimilarity(studentSkills, targetSkills);

  // Hybrid formula: 60% Cosine + 40% Jaccard
  const skillMatchRatio = (0.6 * cosine) + (0.4 * jaccard);

  // Bonus for niche or availability match
  let nicheBonus = 0;
  if (student?.niche && target?.niche && student.niche.toLowerCase() === target.niche.toLowerCase()) {
    nicheBonus = 0.15;
  }

  let availabilityBonus = 0;
  if (student?.availability && target?.availability && student.availability === target.availability) {
    availabilityBonus = 0.1;
  }

  const rawScore = Math.min(1.0, (skillMatchRatio * 0.75) + nicheBonus + availabilityBonus);
  const finalPercentage = Math.round(rawScore * 100);

  // Find shared & missing skills
  const targetSet = new Set(targetSkills.map(s => s.toLowerCase()));
  const sharedSkills = studentSkills.filter(s => targetSet.has(s.toLowerCase()));
  const missingSkills = targetSkills.filter(s => !studentSkills.map(x => x.toLowerCase()).includes(s.toLowerCase()));

  return {
    score: Math.max(15, finalPercentage), // Baseline floor for visual appeal
    jaccardScore: Math.round(jaccard * 100),
    cosineScore: Math.round(cosine * 100),
    sharedSkills,
    missingSkills
  };
}
