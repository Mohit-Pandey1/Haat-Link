export type TrendDirection = 'up' | 'down';

export interface TrendingCrop {
  name: string;
  price: string;
  trend: TrendDirection;
  demand: string;
  history?: Array<{ date: string; price: number }>;
}

export interface Mandi {
  name: string;
  distance: string;
  bestFor: string;
}

export interface VerifiedBuyer {
  name: string;
  type: string;
  contact: string;
  requirements: string;
}

export interface MarketAnalysis {
  trendingCrops: TrendingCrop[];
  mandis: Mandi[];
  buyers: VerifiedBuyer[];
  advisory: string;
}
