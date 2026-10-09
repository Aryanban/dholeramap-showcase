/**
 * A small, hand-verified featured set of real parcel records shown on the
 * homepage's internal-link nav.
 *
 * Kept deliberately tiny (10 entries) so it costs nothing in client bundle
 * size. Every entry is drawn from the generated registry
 * (`gazetted-surveys-data.ts`) — these are real parcels that resolve to real
 * pages, chosen to spread internal link equity across many villages rather
 * than concentrating it on one.
 *
 * Regenerate with: node -e (see scripts) or re-run the picker after
 * scripts/build_gazetted_surveys.py updates the registry.
 */

export interface FeaturedSurvey {
  village: string;
  surveyNo: string;
  area: number;
}

export const FEATURED_SURVEYS: FeaturedSurvey[] = [
  { village: 'bhadiyad', surveyNo: '302', area: 750 },
  { village: 'bhimtalav', surveyNo: '976', area: 750 },
  { village: 'umargadh', surveyNo: '502', area: 750 },
  { village: 'ambli', surveyNo: '443', area: 750 },
  { village: 'khun', surveyNo: '717', area: 750 },
  { village: 'kadipur', surveyNo: '102', area: 750 },
  { village: 'gogla', surveyNo: '306', area: 750 },
  { village: 'hebatpur', surveyNo: '616', area: 1250 },
  { village: 'sangasar', surveyNo: '203', area: 1250 },
  { village: 'mundi', surveyNo: '75', area: 1250 },
];
