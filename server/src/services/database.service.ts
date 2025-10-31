import { Knex } from 'knex';
import { SearchCriteria } from '../shared-types/scholarship-search.types.js';
import { Scholarship } from '../shared-types/scholarship.types.js';
import { getKnex } from '../config/database.config.js';

export class SearchService {
  private db: Knex;

  constructor() {
    this.db = getKnex();
  }

  private buildLikePattern(input: string): string {
    const trimmed = input?.trim();
    if (!trimmed) {
      return '%';
    }

    const escaped = trimmed.replace(/[\\%_]/g, match => `\\${match}`);
    return `%${escaped}%`;
  }

  async searchScholarships(criteria: SearchCriteria): Promise<Scholarship[]> {
    const validatedCriteria = this.validateSearchCriteria(criteria);
    let query = this.db<Scholarship>('scholarships').select('*');

    if (validatedCriteria.academic_level) {
      const academicLevelPattern = this.buildLikePattern(validatedCriteria.academic_level);
      query = query.where('academic_level', 'like', academicLevelPattern);
    }
    if (validatedCriteria.ethnicity) {
      query = query.where('ethnicity', validatedCriteria.ethnicity);
    }
    if (validatedCriteria.gender) {
      query = query.where('gender', validatedCriteria.gender);
    }
    if (validatedCriteria.subject_areas && validatedCriteria.subject_areas.length > 0) {
      const subjectTerms = validatedCriteria.subject_areas
        .map(subject => subject?.trim())
        .filter(Boolean);

      if (subjectTerms.length > 0) {
        query = query.where(qb => {
          subjectTerms.forEach((subject, index) => {
            const subjectPattern = this.buildLikePattern(subject);
            if (index === 0) {
              qb.where('eligibility', 'like', subjectPattern);
            } else {
              qb.orWhere('eligibility', 'like', subjectPattern);
            }
          });
        });
      }
    }
    if (validatedCriteria.target_type && validatedCriteria.target_type !== 'Both') {
      query = query.where('target_type', validatedCriteria.target_type);
    }
    if (validatedCriteria.min_award !== undefined && validatedCriteria.min_award !== null) {
      query = query.where('max_award', '>=', validatedCriteria.min_award);
    }
    if (validatedCriteria.max_award !== undefined && validatedCriteria.max_award !== null) {
      query = query.where('min_award', '<=', validatedCriteria.max_award);
    }
    if (validatedCriteria.keywords) {
      // Simple keyword search in name, description, eligibility
      query = query.where(qb => {
        qb.where('name', 'like', `%${validatedCriteria.keywords}%`)
          .orWhere('description', 'like', `%${validatedCriteria.keywords}%`)
          .orWhere('eligibility', 'like', `%${validatedCriteria.keywords}%`);
      });
    }
    if (
      validatedCriteria.deadline_range &&
      validatedCriteria.deadline_range.start_date &&
      validatedCriteria.deadline_range.end_date
    ) {
      query = query.whereBetween('deadline', [
        validatedCriteria.deadline_range.start_date,
        validatedCriteria.deadline_range.end_date
      ]);
    }
    query = query.where('active', true);
    return await query.limit(100);
  }

  async getScholarshipById(scholarship_id: number): Promise<Scholarship | null> {
    const result = await this.db<Scholarship>('scholarships').where('scholarship_id', scholarship_id).first();
    return result || null;
  }

  validateSearchCriteria(criteria: SearchCriteria): SearchCriteria {
    // TODO: Implement validation and sanitization logic
    // For now, just return the input
    return criteria;
  }
}

export default SearchService;
