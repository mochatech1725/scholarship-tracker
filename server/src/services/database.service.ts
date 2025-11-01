import { Knex } from 'knex';
import { SearchCriteria } from '../shared-types/scholarship-search.types.js';
import { Scholarship } from '../shared-types/scholarship.types.js';
import { subjectAreasOptions, SubjectArea } from '../shared-types/application.constants.js';
import { getKnex } from '../config/database.config.js';

export class SearchService {
  private db: Knex;
  private static subjectAreaLookup = new Map<string, SubjectArea>(
    subjectAreasOptions.map(area => [area.toLowerCase(), area])
  );

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
      const normalizedAcademicLevel = validatedCriteria.academic_level.toLowerCase();
      const academicLevelPattern = this.buildLikePattern(normalizedAcademicLevel);
      query = query.whereRaw('LOWER(academic_level) LIKE ?', [academicLevelPattern]);
    }
    if (validatedCriteria.ethnicity) {
      query = query.where('ethnicity', validatedCriteria.ethnicity);
    }
    if (validatedCriteria.gender) {
      query = query.where('gender', validatedCriteria.gender);
    }
    if (validatedCriteria.subject_areas && validatedCriteria.subject_areas.length > 0) {
      const subjectTerms = validatedCriteria.subject_areas
        .map(subject => subject?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value));

      if (subjectTerms.length > 0) {
        query = query.where(qb => {
          subjectTerms.forEach((subject, index) => {
            const subjectPattern = this.buildLikePattern(subject);
            if (index === 0) {
              qb.whereRaw('LOWER(eligibility) LIKE ?', [subjectPattern]);
            } else {
              qb.orWhereRaw('LOWER(eligibility) LIKE ?', [subjectPattern]);
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
      const keyword = validatedCriteria.keywords.trim().toLowerCase();
      if (keyword) {
        const keywordPattern = this.buildLikePattern(keyword);
        query = query.whereRaw(
          '(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(eligibility) LIKE ?)',
          [keywordPattern, keywordPattern, keywordPattern]
        );
      }
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
    const results = await query.limit(100);

    if (!results || results.length === 0) {
      return results;
    }

    const criteriaSubjectPairs = (validatedCriteria.subject_areas ?? [])
      .map(subject => {
        const trimmed = subject?.trim();
        if (!trimmed) {
          return null;
        }
        return {
          original: trimmed,
          normalized: trimmed.toLowerCase()
        };
      })
      .filter((pair): pair is { original: string; normalized: string } => pair !== null);

    const toSubjectArea = (value: unknown): SubjectArea | null => {
      if (typeof value !== 'string') {
        return null;
      }
      const normalized = value.trim().toLowerCase();
      if (!normalized) {
        return null;
      }
      return SearchService.subjectAreaLookup.get(normalized) ?? null;
    };

    return results.map(result => {
      let subjectAreas: SubjectArea[] = [];
      const rawSubjectAreas = (result as unknown as { subject_areas?: unknown }).subject_areas;

      if (Array.isArray(rawSubjectAreas)) {
        subjectAreas = rawSubjectAreas
          .map(item => toSubjectArea(item))
          .filter((item): item is SubjectArea => item !== null);
      } else if (typeof rawSubjectAreas === 'string') {
        try {
          const parsed = JSON.parse(rawSubjectAreas);
          if (Array.isArray(parsed)) {
            subjectAreas = parsed
              .map(item => toSubjectArea(item))
              .filter((item): item is SubjectArea => item !== null);
          }
        } catch (error) {
          if (rawSubjectAreas.includes(',')) {
            subjectAreas = rawSubjectAreas
              .split(',')
              .map(item => toSubjectArea(item))
              .filter((item): item is SubjectArea => item !== null);
          } else {
            const singleSubject = toSubjectArea(rawSubjectAreas);
            subjectAreas = singleSubject ? [singleSubject] : [];
          }
        }
      }

      if (criteriaSubjectPairs.length > 0) {
        const eligibilityText = (result.eligibility ?? '').toLowerCase();
        const titleText = (result.title ?? '').toLowerCase();
        const descriptionText = (result.description ?? '').toLowerCase();

        const matchedSubjects = criteriaSubjectPairs
          .filter(({ normalized }) =>
            eligibilityText.includes(normalized) ||
            titleText.includes(normalized) ||
            descriptionText.includes(normalized)
          )
          .map(({ normalized }) => SearchService.subjectAreaLookup.get(normalized))
          .filter((subject): subject is SubjectArea => subject !== undefined);

        if (matchedSubjects.length > 0) {
          const merged = new Set<SubjectArea>(subjectAreas);
          matchedSubjects.forEach(item => {
            merged.add(item);
          });
          subjectAreas = Array.from(merged);
        }
      }

      return {
        ...result,
        subject_areas: subjectAreas
      };
    });
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
