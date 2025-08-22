export interface Essay {
  essay_id?: number;
  application_id: number;
  theme?: string;
  units?: string;
  essay_link?: string;
  word_count?: number;
  created_at?: Date;
  updated_at?: Date;
}