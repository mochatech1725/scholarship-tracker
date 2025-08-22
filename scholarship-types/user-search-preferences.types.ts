import type { 
  EducationLevel, 
  TargetType, 
  SubjectArea, 
  Gender, 
  Ethnicity,
} from './application.constants.js';

export interface UserSearchPreferences {
  student_id: number;
  target_type?: TargetType;
  subject_areas?: SubjectArea[];
  gender?: Gender;
  ethnicity?: Ethnicity;
  essay_required?: boolean;
  recommendations_required?: boolean;
  academic_level?: EducationLevel;
  created_at?: Date;
  updated_at?: Date;
}