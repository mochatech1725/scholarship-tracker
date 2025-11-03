import { Request, Response } from 'express';
import ScholarshipSearchService from '../services/scholarship-search.service.js';
import { SearchService } from '../services/database.service.js';
import { Scholarship } from '../shared-types/scholarship.types.js';
import { subjectAreasOptions, SubjectArea, ethnicityOptions } from '../shared-types/application.constants.js';
import { MAX_SCHOLARSHIP_SEARCH_RESULTS, NODE_ENV } from '../utils/constants.js';

let searchService: ScholarshipSearchService;

export async function initScholarshipSearchController() {
  const searchDbService = new SearchService();
  searchService = new ScholarshipSearchService(searchDbService);
}

const SUBJECT_AREA_LOOKUP = new Map<string, SubjectArea>(
  subjectAreasOptions.map(area => [area.toLowerCase(), area])
);

const ETHNICITY_LOOKUP = new Map<string, string>(
  ethnicityOptions.map(option => [option.toLowerCase(), option])
);

const toSubjectArea = (value: unknown): SubjectArea | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return SUBJECT_AREA_LOOKUP.get(normalized) ?? null;
};

/**
 * Convert scholarship results, handling eligibility field conversion
 * @param scholarships - Array of scholarship results from the service
 * @returns Processed scholarship results with eligibility as string
 */
const convertScholarshipItems = (scholarships: Scholarship[]): Scholarship[] => {
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
        // Not JSON, fall back
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
    const output: string[] = [];
    items.forEach(item => {
      const key = item.trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        output.push(key);
      }
    });
    return output;
  };

  return scholarships.map(scholarship => {
    const eligibilityArray = dedupeStrings(parseStringArray((scholarship as unknown as { eligibility?: unknown }).eligibility ?? scholarship.eligibility));
    const formattedEligibility = eligibilityArray.map(item => item.replace(/\b([a-z])/g, (_, letter: string) => letter.toUpperCase()));
    const ethnicityArray = dedupeStrings(parseStringArray((scholarship as unknown as { ethnicity?: unknown }).ethnicity ?? scholarship.ethnicity)).map(item => ETHNICITY_LOOKUP.get(item.toLowerCase()) ?? item);
    const academicLevelArray = dedupeStrings(parseStringArray((scholarship as unknown as { academic_level?: unknown }).academic_level ?? scholarship.academic_level));
    const geographicRestrictionsArray = dedupeStrings(parseStringArray((scholarship as unknown as { geographic_restrictions?: unknown }).geographic_restrictions ?? scholarship.geographic_restrictions));
    let subjectAreas: SubjectArea[] | undefined;
    const rawSubjectAreas = (scholarship as unknown as { subject_areas?: unknown }).subject_areas;

    if (Array.isArray(rawSubjectAreas)) {
      const converted = rawSubjectAreas
        .map(item => toSubjectArea(item))
        .filter((item): item is SubjectArea => item !== null);
      subjectAreas = converted.length > 0 ? converted : undefined;
    } else if (typeof rawSubjectAreas === 'string') {
      let converted: SubjectArea[] | undefined;
      try {
        const parsed = JSON.parse(rawSubjectAreas);
        if (Array.isArray(parsed)) {
          const filtered = parsed
            .map(item => toSubjectArea(item))
            .filter((item): item is SubjectArea => item !== null);
          if (filtered.length > 0) {
            converted = filtered;
          }
        }
      } catch (error) {
        // Swallow parse error and treat as delimited string
      }

      if (!converted) {
        const fallbackItems = rawSubjectAreas
          .split(',')
          .map(item => toSubjectArea(item))
          .filter((item): item is SubjectArea => item !== null);
        converted = fallbackItems.length > 0 ? fallbackItems : undefined;
      }
      subjectAreas = converted;
    } else if (rawSubjectAreas) {
      const single = toSubjectArea(rawSubjectAreas);
      subjectAreas = single ? [single] : undefined;
    } else {
      subjectAreas = scholarship.subject_areas;
    }
    return {
      ...scholarship,
      eligibility: formattedEligibility,
      ethnicity: ethnicityArray,
      academic_level: academicLevelArray,
      geographic_restrictions: geographicRestrictionsArray,
      subject_areas: subjectAreas
    };
  });
};

export const getScholarshipSources = async (req: Request, res: Response) => {
  try {
    res.json({ sources: ['mysql'] });
  } catch (error) {
    console.error('Error getting scholarship sources:', error);
    res.status(500).json({
      message: 'Error fetching scholarship sources',
      error: 'INTERNAL_ERROR'
    });
  }
};

export const findScholarships = async (req: Request, res: Response) => {
  try {
    const { searchCriteria, maxResults = MAX_SCHOLARSHIP_SEARCH_RESULTS } = req.body;
    if (!searchCriteria || typeof searchCriteria !== 'object') {
      return res.status(400).json({
        message: 'Search criteria object is required',
        error: 'INVALID_INPUT'
      });
    }
    const result = await searchService.searchScholarships(searchCriteria, { maxResults });
    const sources = [...new Set(result.scholarships.map(s => s.source))];
    console.log('🔍 Scholarship sources found:', sources);
    console.log('📊 Total scholarships:', result.scholarships.length);
    const convertedScholarships = convertScholarshipItems(result.scholarships);
    res.json({
      success: true,
      data: {
        scholarships: convertedScholarships,
        totalFound: result.totalFound,
        searchTimestamp: new Date().toISOString()
      },
      metadata: {
        sourcesUsed: ['mysql'],
        processingTime: `${result.searchTime}ms`,
        filters: result.filters
      }
    });
  } catch (error) {
    console.error('Error in scholarship search:', error);
    res.status(500).json({
      message: 'Error in scholarship search',
      error: 'SEARCH_ERROR',
      details: NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};