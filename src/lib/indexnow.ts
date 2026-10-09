/**
 * Official IndexNow Integration for DholeraMap
 * 
 * Supports immediate indexing notifications across Bing, Yandex, Seznam, and Naver
 * for DholeraMap's 3,600+ programmatic survey pages and statutory TP hubs.
 */

import { VILLAGES } from '@/lib/villages';
import { allSurveyPairs } from '@/lib/gazetted-surveys';

export const INDEXNOW_KEY = '7f9b2d84a1e64c538209e7c3b1a45d82';
export const INDEXNOW_HOST = 'dholeramap.com';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;

export const STATIC_PRIMARY_ROUTES = [
  'https://dholeramap.com',
  'https://dholeramap.com/map',
  'https://dholeramap.com/dholera-tp-map',
  'https://dholeramap.com/dholera-plot-price',
  'https://dholeramap.com/tata-semiconductor-dholera-map',
  'https://dholeramap.com/dholera-expressway-airport-map',
  'https://dholeramap.com/dholera-7-12-anyror-land-records',
  'https://dholeramap.com/guide',
  'https://dholeramap.com/blog',
  'https://dholeramap.com/brokers',
  'https://dholeramap.com/pricing',
  'https://dholeramap.com/about',
  'https://dholeramap.com/contact',
  'https://dholeramap.com/terms',
  'https://dholeramap.com/privacy',
  'https://dholeramap.com/refund',
  'https://dholeramap.com/shipping',
  'https://dholeramap.com/disclaimer',
];

/**
 * Returns all indexable canonical URLs across DholeraMap:
 * primary hubs + 22 village directories + 3,635+ gazetted survey numbers.
 */
export function getAllIndexableUrls(): string[] {
  const urls: string[] = [...STATIC_PRIMARY_ROUTES];

  // 22 Village Hubs
  for (const v of VILLAGES) {
    urls.push(`https://dholeramap.com/village/${v.slug}`);
  }

  // 3,635+ Gazetted Survey Parcels
  const surveyPairs = allSurveyPairs();
  for (const p of surveyPairs) {
    urls.push(`https://dholeramap.com/survey/${p.village}/${p.surveyNo}`);
  }

  return urls;
}

export interface IndexNowResult {
  success: boolean;
  statusCode: number;
  submittedCount: number;
  endpoint: string;
  message: string;
  timestamp: string;
}

/**
 * Submits an array of URLs to the IndexNow protocol endpoints (IndexNow.org and Bing).
 * Batch size up to 10,000 URLs per API call according to the IndexNow specification.
 */
export async function submitToIndexNow(
  urls: string[],
  endpoint: 'api.indexnow.org' | 'www.bing.com' = 'api.indexnow.org'
): Promise<IndexNowResult> {
  const timestamp = new Date().toISOString();

  if (!urls || urls.length === 0) {
    return {
      success: false,
      statusCode: 400,
      submittedCount: 0,
      endpoint,
      message: 'No URLs provided for submission.',
      timestamp,
    };
  }

  // Maximum 10,000 URLs per IndexNow specification request
  const cappedUrls = urls.slice(0, 10000);

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: cappedUrls,
  };

  try {
    const res = await fetch(`https://${endpoint}/indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'DholeraMap-IndexNow/1.0',
      },
      body: JSON.stringify(payload),
    });

    const isSuccess = res.status === 200 || res.status === 202;
    let message = '';

    if (res.status === 200) {
      message = `IndexNow accepted ${cappedUrls.length} URLs successfully (HTTP 200 OK).`;
    } else if (res.status === 202) {
      message = `IndexNow accepted ${cappedUrls.length} URLs (HTTP 202 Accepted; key verification in progress).`;
    } else if (res.status === 400) {
      message = 'Invalid format or parameter in IndexNow submission (HTTP 400).';
    } else if (res.status === 403) {
      message = 'IndexNow key invalid or key file not found on host (HTTP 403).';
    } else if (res.status === 422) {
      message = 'URLs in list do not match the specified host (HTTP 422).';
    } else if (res.status === 429) {
      message = 'Too many requests; rate limited by IndexNow engine (HTTP 429).';
    } else {
      message = `IndexNow responded with status ${res.status}.`;
    }

    return {
      success: isSuccess,
      statusCode: res.status,
      submittedCount: isSuccess ? cappedUrls.length : 0,
      endpoint,
      message,
      timestamp,
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      submittedCount: 0,
      endpoint,
      message: err instanceof Error ? err.message : 'Network error submitting to IndexNow',
      timestamp,
    };
  }
}
