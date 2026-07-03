export interface CompatibilityBreakdown {
  roomId: string;
  userId: string;
  overallScore: number;
  matchQuality: 'Excellent' | 'Good' | 'Fair' | 'Low';
  strengths: string[];
  missing: string[];
  aiExplanation: string;
  breakdown: {
    lifestyle: number;
    location: number;
    budget: number;
    amenities: number;
  };
  isAIBased: boolean;
}

export const mockCompatibility: Record<string, CompatibilityBreakdown> = {
  'r1-u1': {
    roomId: 'r1',
    userId: 'u1',
    overallScore: 94,
    matchQuality: 'Excellent',
    strengths: ['WiFi Available', 'Near Metro', 'Non Smoking Environment', 'Study Friendly Space'],
    missing: ['Vegetarian Kitchen (shared kitchen not exclusively vegetarian)'],
    aiExplanation: 'This studio aligns exceptionally well with your stated preferences. The high-speed fiber WiFi, metro proximity, and quiet building environment match your work-from-home needs. The only partial mismatch is the kitchen — while clean, it is a shared floor, not exclusively vegetarian. Based on your profile, we estimate a 94% compatibility — one of your top matches.',
    breakdown: { lifestyle: 96, location: 98, budget: 88, amenities: 95 },
    isAIBased: true,
  },
  'r2-u1': {
    roomId: 'r2',
    userId: 'u1',
    overallScore: 88,
    matchQuality: 'Excellent',
    strengths: ['WiFi Available', 'Study Friendly', 'Non Smoking', 'Near Metro'],
    missing: ['Balcony', 'Vegetarian Kitchen'],
    aiExplanation: 'The Koramangala 1BHK matches most of your work and lifestyle preferences. The quiet neighbourhood and study-friendly setup are a great fit. Budget slightly stretches above your comfort zone at ₹28,000, and there is no dedicated balcony or exclusive vegetarian kitchen.',
    breakdown: { lifestyle: 92, location: 90, budget: 80, amenities: 88 },
    isAIBased: true,
  },
  'r3-u1': {
    roomId: 'r3',
    userId: 'u1',
    overallScore: 76,
    matchQuality: 'Good',
    strengths: ['WiFi Available', 'Balcony', 'Pet Friendly', 'Sunlight'],
    missing: ['Near Metro', 'Study Friendly', 'Quiet Area', 'Budget Over Range'],
    aiExplanation: 'The Juhu penthouse offers premium luxury but the rent at ₹65,000 is significantly above your budget range. The location is not near a metro station, which conflicts with your commute preferences. However, the premium amenities and lifestyle match your desire for a quality living environment.',
    breakdown: { lifestyle: 80, location: 65, budget: 62, amenities: 90 },
    isAIBased: false,
  },
  'r4-u1': {
    roomId: 'r4',
    userId: 'u1',
    overallScore: 91,
    matchQuality: 'Excellent',
    strengths: ['WiFi', 'Study Friendly', 'Quiet Area', 'Near College', 'Vegetarian', 'Non Smoking'],
    missing: ['Parking', 'Balcony', 'Near Metro'],
    aiExplanation: 'This double room near IIT Delhi matches your lifestyle preferences almost perfectly. The vegetarian-only kitchen, non-smoking policy, quiet residential area, and study-friendly environment are all strong matches. The primary gap is the lack of metro connectivity, but DTC buses provide adequate connectivity.',
    breakdown: { lifestyle: 96, location: 85, budget: 98, amenities: 87 },
    isAIBased: true,
  },
};
