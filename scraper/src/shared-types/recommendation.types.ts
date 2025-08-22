import type { TRecommendationStatus } from './application.constants';

export interface Recommendation {
  recommendation_id?: number;
  application_id: number;
  recommender_id: number;
  content?: string;
  submitted_at?: Date;
  status: TRecommendationStatus;
  created_at?: Date;
  updated_at?: Date;
}