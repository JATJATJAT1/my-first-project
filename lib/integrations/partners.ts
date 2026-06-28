export interface Partner {
  id:          string;
  name:        string;
  description: string;
  authType:    'oauth' | 'api_key' | 'credentials' | 'webhook' | 'none';
}

export const PARTNERS: Partner[] = [
  {
    id:          'dealer-website',
    name:        'Dealer Website',
    description: 'ShiftAI responds instantly to leads from your dealer website contact forms and chat widgets.',
    authType:    'webhook',
  },
  {
    id:          'missed-call',
    name:        'Missed Call Text-Back',
    description: "Automatically texts back any customer who called and didn't get answered — so no lead ever goes cold.",
    authType:    'none',
  },
  {
    id:          'autotrader',
    name:        'AutoTrader',
    description: 'Pull AutoTrader leads into ShiftAI the moment they submit — AI responds within seconds.',
    authType:    'api_key',
  },
  {
    id:          'facebook-ads',
    name:        'Facebook Lead Ads',
    description: 'Capture Facebook Lead Ads form submissions and have ShiftAI follow up automatically.',
    authType:    'oauth',
  },
  {
    id:          'cargurus',
    name:        'CarGurus',
    description: 'Receive CarGurus leads with Instant Market Value context so ShiftAI can respond with pricing intelligence.',
    authType:    'api_key',
  },
  {
    id:          'instagram',
    name:        'Instagram',
    description: 'Respond to Instagram DMs and ad form leads from car shoppers automatically.',
    authType:    'oauth',
  },
  {
    id:          'email-leads',
    name:        'Email Leads',
    description: "Forward any lead email to ShiftAI's dedicated inbox and AI handles the reply instantly.",
    authType:    'credentials',
  },
  {
    id:          'google-business',
    name:        'Google Business',
    description: 'Respond to Google Business Profile messages and manage review replies through ShiftAI.',
    authType:    'oauth',
  },
  {
    id:          'cars-com',
    name:        'Cars.com',
    description: 'Sync Cars.com leads and reviews so ShiftAI can act on them the moment they arrive.',
    authType:    'api_key',
  },
  {
    id:          'fb-marketplace',
    name:        'FB Marketplace',
    description: 'Capture Facebook Marketplace vehicle inquiries and have ShiftAI follow up automatically.',
    authType:    'oauth',
  },
  {
    id:          'truecar',
    name:        'TrueCar',
    description: 'Surface TrueCar certified-price leads directly inside ShiftAI so you respond before the competition.',
    authType:    'credentials',
  },
  {
    id:          'edmunds',
    name:        'Edmunds',
    description: 'Receive Edmunds leads enriched with pricing and review data for smarter AI follow-up.',
    authType:    'api_key',
  },
  {
    id:          'oem-dealer-com',
    name:        'OEM / Dealer.com',
    description: 'Connect your OEM-provided Dealer.com website to route manufacturer leads through ShiftAI.',
    authType:    'credentials',
  },
  {
    id:          'kbb-ico',
    name:        'KBB / ICO',
    description: 'Pull Kelley Blue Book Instant Cash Offer leads and trade-in appraisal data into ShiftAI.',
    authType:    'api_key',
  },
  {
    id:          'craigslist',
    name:        'Craigslist',
    description: 'Monitor Craigslist vehicle inquiries and route them into ShiftAI for instant follow-up.',
    authType:    'webhook',
  },
  {
    id:          'tiktok-lead-gen',
    name:        'TikTok Lead Gen',
    description: 'Capture TikTok Lead Generation form submissions and have ShiftAI respond while interest is hot.',
    authType:    'oauth',
  },
];
