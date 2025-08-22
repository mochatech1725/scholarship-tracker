
export interface SearchCriteria {
  subjectAreas: string[]
  keywords: string
  academic_level: string | null
  target_type: string | null
  gender: string | null
  ethnicity: string | null
  geographic_restrictions: string | null
  essay_required: boolean | null
  recommendations_required: boolean | null
  academic_gpa?: number
  minAmount?: number
  maxAmount?: number
  deadlineRange?: {
    startDate?: string 
    endDate?: string
  }
}


export interface SearchOptions {
  maxResults?: number;
  sortBy?: 'relevance' | 'deadline' | 'amount' | 'title';
  sortOrder?: 'asc' | 'desc';
  includeExpired?: boolean;
}