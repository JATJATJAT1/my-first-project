// Firecrawl-powered dealership website analysis.
//
// Calls the Firecrawl v2 scrape API (https://api.firecrawl.dev/v2/scrape) with a
// JSON extraction schema, then derives a "Lead Capture Score" tuned to the ShiftAI
// ICP — franchise & independent car dealerships. The score reflects how many lead
// channels a dealer's own site already exposes; the gaps are the openings ShiftAI
// closes with instant AI follow-up.

const FIRECRAWL_ENDPOINT = 'https://api.firecrawl.dev/v2/scrape';

export interface DealershipAnalysis {
  dealershipName:     string | null;
  brands:             string[];
  city:               string | null;
  state:              string | null;
  phone:              string | null;
  hasInventorySearch: boolean;
  hasContactForm:     boolean;
  hasChatWidget:      boolean;
  hasFinancingPage:   boolean;
  sellsUsedCars:      boolean;
}

export interface ScanResult {
  url:            string;
  analysis:       DealershipAnalysis;
  score:          number;    // 0–100 lead-capture readiness
  gaps:           string[];  // openings ShiftAI closes
  faviconUrl:     string | null;
  scrapedAt:      string;
}

// Extraction schema handed to Firecrawl's LLM.
const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    dealershipName:     { type: 'string' },
    brands:             { type: 'array', items: { type: 'string' } },
    city:               { type: 'string' },
    state:              { type: 'string' },
    phone:              { type: 'string' },
    hasInventorySearch: { type: 'boolean' },
    hasContactForm:     { type: 'boolean' },
    hasChatWidget:      { type: 'boolean' },
    hasFinancingPage:   { type: 'boolean' },
    sellsUsedCars:      { type: 'boolean' },
  },
} as const;

const EXTRACTION_PROMPT =
  'This is a car dealership website. Extract the dealership name, the vehicle ' +
  'brands/makes it sells, its city and state, its main phone number, and detect ' +
  'whether the site has: an inventory/vehicle search, a contact or lead form, a ' +
  'live chat widget, a financing/credit application page, and whether it sells ' +
  'used cars. Use false for any feature you cannot find.';

// Weighted lead channels — sum to 100.
const SIGNALS: Array<{
  key:   keyof DealershipAnalysis;
  weight: number;
  gap:   string;
}> = [
  { key: 'hasContactForm',     weight: 25, gap: 'No obvious lead form — ShiftAI captures every inquiry and replies in seconds.' },
  { key: 'hasInventorySearch', weight: 20, gap: 'No inventory search — shoppers leave without a trace; ShiftAI engages them before they bounce.' },
  { key: 'hasChatWidget',      weight: 15, gap: 'No live chat — ShiftAI adds 24/7 AI chat that books test drives while you sleep.' },
  { key: 'hasFinancingPage',   weight: 15, gap: 'No financing page — ShiftAI pre-qualifies buyers and routes hot credit leads to your desk.' },
  { key: 'phone',              weight: 15, gap: 'No visible phone — ShiftAI’s missed-call text-back means no caller ever goes cold.' },
  { key: 'sellsUsedCars',      weight: 10, gap: 'No used inventory detected — ShiftAI works trade-ins and used leads the same way.' },
];

function scoreAnalysis(a: DealershipAnalysis): { score: number; gaps: string[] } {
  let score = 0;
  const gaps: string[] = [];
  for (const s of SIGNALS) {
    const present = s.key === 'phone' ? Boolean(a.phone) : Boolean(a[s.key]);
    if (present) score += s.weight;
    else gaps.push(s.gap);
  }
  return { score, gaps };
}

function faviconFor(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

/**
 * Scrape and analyze a dealership website via Firecrawl.
 * Throws an Error with a user-safe message on failure.
 */
export async function analyzeDealershipSite(rawUrl: string): Promise<ScanResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw Object.assign(
      new Error('Website analysis is not configured yet. (Missing FIRECRAWL_API_KEY.)'),
      { status: 503 },
    );
  }

  // Normalize: allow users to type "galpinford.com" without a scheme.
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    new URL(url);
  } catch {
    throw Object.assign(new Error('That doesn’t look like a valid website URL.'), { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(FIRECRAWL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        url,
        onlyMainContent: true,
        maxAge:          172_800_000, // accept cached page up to 2 days old (faster, cheaper)
        formats: [
          { type: 'json', prompt: EXTRACTION_PROMPT, schema: EXTRACTION_SCHEMA },
        ],
      }),
      // Firecrawl can take a while on JS-heavy sites.
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e: any) {
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
      throw Object.assign(new Error('The site took too long to analyze. Please try again.'), { status: 504 });
    }
    throw Object.assign(new Error('Could not reach the analysis service. Please try again.'), { status: 502 });
  }

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error ?? ''; } catch { /* ignore */ }
    throw Object.assign(
      new Error(detail || `Analysis failed (${res.status}). Please check the URL and try again.`),
      { status: res.status === 402 ? 402 : 502 },
    );
  }

  const payload = await res.json();
  const json = payload?.data?.json ?? {};

  const analysis: DealershipAnalysis = {
    dealershipName:     typeof json.dealershipName === 'string' ? json.dealershipName : null,
    brands:             Array.isArray(json.brands) ? json.brands.filter((b: unknown) => typeof b === 'string') : [],
    city:               typeof json.city === 'string' ? json.city : null,
    state:              typeof json.state === 'string' ? json.state : null,
    phone:              typeof json.phone === 'string' ? json.phone : null,
    hasInventorySearch: Boolean(json.hasInventorySearch),
    hasContactForm:     Boolean(json.hasContactForm),
    hasChatWidget:      Boolean(json.hasChatWidget),
    hasFinancingPage:   Boolean(json.hasFinancingPage),
    sellsUsedCars:      Boolean(json.sellsUsedCars),
  };

  const { score, gaps } = scoreAnalysis(analysis);

  return {
    url,
    analysis,
    score,
    gaps,
    faviconUrl: faviconFor(url),
    scrapedAt:  new Date().toISOString(),
  };
}
