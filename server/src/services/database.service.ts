import knex, { Knex } from 'knex';
import { SearchCriteria } from '../shared-types/scholarship-search.types.js';
import { Scholarship } from '../shared-types/scholarship.types.js';
import { getKnex } from '../config/database.config.js';

export class SearchService {
  private db: Knex;

  constructor() {
    this.db = getKnex();
  }

  async searchScholarships(criteria: SearchCriteria): Promise<Scholarship[]> {
    const validatedCriteria = this.validateSearchCriteria(criteria);
    let query = this.db<Scholarship>('scholarships').select('*');

    if (validatedCriteria.academic_level) {
      query = query.where('academic_level', validatedCriteria.academic_level);
    }
    if (validatedCriteria.ethnicity) {
      query = query.where('ethnicity', validatedCriteria.ethnicity);
    }
    if (validatedCriteria.gender) {
      query = query.where('gender', validatedCriteria.gender);
    }
    if (validatedCriteria.subjectAreas && validatedCriteria.subjectAreas.length > 0) {
      query = query.whereIn('subject_area', validatedCriteria.subjectAreas);
    }
    if (validatedCriteria.target_type && validatedCriteria.target_type !== 'Both') {
      query = query.where('target_type', validatedCriteria.target_type);
    }
    if (validatedCriteria.minAmount) {
      query = query.where('max_award', '>=', validatedCriteria.minAmount);
    }
    if (validatedCriteria.maxAmount) {
      query = query.where('min_award', '<=', validatedCriteria.maxAmount);
    }
    if (validatedCriteria.keywords) {
      // Simple keyword search in name, description, eligibility
      query = query.where(qb => {
        qb.where('name', 'like', `%${validatedCriteria.keywords}%`)
          .orWhere('description', 'like', `%${validatedCriteria.keywords}%`)
          .orWhere('eligibility', 'like', `%${validatedCriteria.keywords}%`);
      });
    }
    if (validatedCriteria.deadlineRange && validatedCriteria.deadlineRange.startDate && validatedCriteria.deadlineRange.endDate) {
      query = query.whereBetween('deadline', [validatedCriteria.deadlineRange.startDate, validatedCriteria.deadlineRange.endDate]);
    }
    query = query.where('is_active', true);
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
