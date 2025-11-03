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
      const normalizedAcademicLevel = validatedCriteria.academic_level.trim().toLowerCase();
      if (normalizedAcademicLevel) {
        query = query.whereRaw("JSON_SEARCH(academic_level, 'one', ?, NULL, '$') IS NOT NULL", [normalizedAcademicLevel]);
      }
    }
    if (validatedCriteria.ethnicity) {
      const normalizedEthnicity = validatedCriteria.ethnicity.trim().toLowerCase();
      if (normalizedEthnicity) {
        query = query.whereRaw("JSON_SEARCH(ethnicity, 'one', ?, NULL, '$') IS NOT NULL", [normalizedEthnicity]);
      }
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
            const clause = "JSON_SEARCH(eligibility, 'one', ?, NULL, '$') IS NOT NULL";
            if (index === 0) {
              qb.whereRaw(clause, [subjectPattern]);
            } else {
              qb.orWhereRaw(clause, [subjectPattern]);
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
    if (validatedCriteria.academic_gpa !== undefined && validatedCriteria.academic_gpa !== null) {
      const gpaValue = validatedCriteria.academic_gpa;
      query = query.where(qb => {
        qb.whereNull('min_gpa').orWhere('min_gpa', '<=', gpaValue);
      });
    }
    if (validatedCriteria.keywords) {
      const keyword = validatedCriteria.keywords.trim().toLowerCase();
      if (keyword) {
        const keywordPattern = this.buildLikePattern(keyword);
        query = query.whereRaw(
          "(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR JSON_SEARCH(eligibility, 'one', ?, NULL, '$') IS NOT NULL)",
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

    const parseStringArray = (value: unknown): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value
          .map(item => (typeof item === 'string' ? item.trim() : String(item).trim()))
          .filter((item): item is string => Boolean(item));
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parseStringArray(parsed);
          }
        } catch (error) {
          // Not JSON, fall back to delimiter split
        }
        return trimmed
          .split(/[|,]/)
          .map(item => item.trim())
          .filter((item): item is string => Boolean(item));
      }
      return [];
    };

    const dedupeStrings = (items: string[]): string[] => {
      const seen = new Set<string>();
      const result: string[] = [];
      items.forEach(item => {
        const key = item.trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          result.push(key);
        }
      });
      return result;
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

      const eligibilityArray = dedupeStrings(parseStringArray((result as unknown as { eligibility?: unknown }).eligibility));
      const ethnicityArray = dedupeStrings(parseStringArray((result as unknown as { ethnicity?: unknown }).ethnicity)).map(item => item.toLowerCase());
      const academicLevelArray = dedupeStrings(parseStringArray((result as unknown as { academic_level?: unknown }).academic_level));
      const geographicRestrictionsArray = dedupeStrings(parseStringArray((result as unknown as { geographic_restrictions?: unknown }).geographic_restrictions));

      if (criteriaSubjectPairs.length > 0) {
        const eligibilityText = eligibilityArray.join(' ').toLowerCase();
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

      const rawMinGpa = (result as unknown as { min_gpa?: unknown }).min_gpa;
      let minGpa: number | undefined;
      if (rawMinGpa !== undefined && rawMinGpa !== null) {
        const numeric = Number(rawMinGpa);
        if (!Number.isNaN(numeric)) {
          minGpa = numeric;
        }
      }

      return {
        ...result,
        subject_areas: subjectAreas,
        eligibility: eligibilityArray,
        ethnicity: ethnicityArray,
        academic_level: academicLevelArray,
        geographic_restrictions: geographicRestrictionsArray,
        min_gpa: minGpa
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
