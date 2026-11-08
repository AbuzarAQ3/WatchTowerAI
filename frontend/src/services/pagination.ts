import api from '../lib/api';
import type { PaginatedResponse } from '../types/api';

/**
 * Extracts pathname + search from an absolute or relative URL string.
 * Ensures axios stays on the configured baseURL/proxy and prevents leaking
 * headers (like X-Session-Token) to unexpected external hosts.
 */
export function extractRelativePath(urlStr: string): string {
  try {
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      const parsed = new URL(urlStr);
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // If URL parsing fails, return as-is
  }
  return urlStr;
}

/**
 * Fetches all pages for a paginated list endpoint.
 * - Extracts pathname+search from DRF's absolute next URL.
 * - Caps pagination at a maximum of 20 pages to protect against infinite loops.
 */
export async function fetchAllPages<T>(initialUrl: string, maxPages = 20): Promise<T[]> {
  let currentUrl: string | null = initialUrl;
  const allResults: T[] = [];
  let pageCount = 0;

  while (currentUrl && pageCount < maxPages) {
    pageCount++;
    const relativeUrl = extractRelativePath(currentUrl);
    const response = await api.get<PaginatedResponse<T> | T[]>(relativeUrl);

    if (Array.isArray(response.data)) {
      allResults.push(...response.data);
      break;
    }

    const results = response.data?.results || [];
    allResults.push(...results);

    const nextUrl = response.data?.next;
    currentUrl = nextUrl ? nextUrl : null;
  }

  return allResults;
}
