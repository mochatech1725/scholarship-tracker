import type { Recommendation } from './recommendation.types.js';
import type { Essay } from './essay.types.js';
import type { TApplicationStatus, TTargetType } from './application.constants';

// Original Application interface (converted to snake_case for MySQL)
export interface Application {
  application_id?: number;
  student_id: number;
  scholarship_name: string;
  target_type: TTargetType;
  organization: string;
  org_website: string;
  platform: string;
  application_link: string;
  theme: string;
  min_award: number;
  max_award: number;
  requirements: string;
  renewable: boolean;
  renewable_terms?: string;
  document_info_link: string;
  current_action: string;
  status: TApplicationStatus;
  submission_date?: Date;
  open_date?: Date;
  due_date: Date;
  created_at?: Date;
  updated_at?: Date;
  recommendations?: Recommendation[];
  essays?: Essay[];
}
