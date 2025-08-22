export interface Scholarship {
  scholarship_id?: string;
  title: string;
  description?: string;
  organization?: string;
  orga_website?: string;
  target_type?: string;
  min_award?: number;
  max_award?: number;
  deadline?: string;
  eligibility?: string;
  gender?: string;
  ethnicity?: string;
  academic_level?: string;
  essay_required?: boolean;
  recommendation_required?: boolean;
  renewable?: boolean;
  geographic_restrictions?: string;
  apply_url?: string;
  url?: string;
  source?: string;
  country?: string;
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}