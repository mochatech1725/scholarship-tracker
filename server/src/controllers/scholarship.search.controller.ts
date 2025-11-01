import { Request, Response } from 'express';
import ScholarshipSearchService from '../services/scholarship-search.service.js';
import { SearchService } from '../services/database.service.js';
import { Scholarship } from '../shared-types/scholarship.types.js';
import { subjectAreasOptions, SubjectArea } from '../shared-types/application.constants.js';
import { MAX_SCHOLARSHIP_SEARCH_RESULTS, NODE_ENV } from '../utils/constants.js';

let searchService: ScholarshipSearchService;

export async function initScholarshipSearchController() {
  const searchDbService = new SearchService();
  searchService = new ScholarshipSearchService(searchDbService);
}

const SUBJECT_AREA_LOOKUP = new Map<string, SubjectArea>(
  subjectAreasOptions.map(area => [area.toLowerCase(), area])
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
  return scholarships.map(scholarship => {
    let eligibility = scholarship.eligibility;
    let subjectAreas: SubjectArea[] | undefined;
    const rawSubjectAreas = (scholarship as unknown as { subject_areas?: unknown }).subject_areas;
    if (eligibility && typeof eligibility === 'object') {
      if (Array.isArray(eligibility)) {
        // Convert array to comma-separated string
        eligibility = (eligibility as unknown[]).map(item => String(item)).join(', ');
      } else {
        // Convert object values to comma-separated string
        eligibility = Object.values(eligibility as Record<string, unknown>)
          .map(value => String(value))
          .join(', ');
      }
    }

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
      eligibility,
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