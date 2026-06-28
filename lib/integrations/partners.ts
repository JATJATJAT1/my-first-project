export interface Partner {
  id:          string;
  name:        string;
  description: string;
  authType:    'oauth' | 'api_key' | 'credentials' | 'webhook' | 'none';
  color:       string;
  icon:        string;
}

export const PARTNERS: Partner[] = [
  {
    id:          'dealer-website',
    name:        'Dealer Website',
    description: 'ShiftAI responds instantly to leads that come in through your dealer website contact forms and chat widgets.',
    authType:    'webhook',
    color:       '#1e40af',
    icon:        '🌐',
  },
  {
    id:          'missed-call',
    name:        'Missed Call Text-Back',
    description: 'Automatically texts back any customer who called and didn\'t get answered — so no lead ever goes cold.',
    authType:    'none',
    color:       '#7c3aed',
    icon:        '📞',
  },
  {
    id:          'autotrader',
    name:        'AutoTrader',
    description: 'Pull AutoTrader leads into ShiftAI the moment they submit — AI responds within seconds.',
    authType:    'api_key',
    color:       '#ea580c',
    icon:        'AV',
  },
  {
    id:          'facebook-ads',
    name:        'Facebook Ads',
    description: 'Capture Facebook Lead Ads form submissions and have ShiftAI follow up automatically.',
    authType:    'oauth',
    color:       '#1877f2',
    icon:        'f',
  },
  {
    id:          'cargurus',
    name:        'CarGurus',
    description: 'Receive CarGurus leads with Instant Market Value context so ShiftAI can respond with pricing intelligence.',
    authType:    'api_key',
    color:       '#16a34a',
    icon:        'CG',
  },
  {
    id:          'instagram',
    name:        'Instagram',
    description: 'Respond to Instagram DMs and ad form leads from car shoppers automatically.',
    authType:    'oauth',
    color:       '#db2777',
    icon:        '📷',
  },
  {
    id:          'email-leads',
    name:        'Email Leads',
    description: 'Forward any lead email to ShiftAI\'s dedicated inbox and AI handles the reply instantly.',
    authType:    'credentials',
    color:       '#059669',
    icon:        '✉️',
  },
  {
    id:          'google-business',
    name:        'Google Business',
    description: 'Respond to Google Business Profile messages and manage review replies through ShiftAI.',
    authType:    'oauth',
    color:       '#4285f4',
    icon:        'G',
  },
  {
    id:          'cars-com',
    name:        'Cars.com',
    description: 'Sync Cars.com leads and reviews so ShiftAI can act on them the moment they arrive.',
    authType:    'api_key',
    color:       '#ef4444',
    icon:        '🚗',
  },
  {
    id:          'fb-marketplace',
    name:        'FB Marketplace',
    description: 'Capture Facebook Marketplace vehicle inquiries and have ShiftAI follow up automatically.',
    authType:    'oauth',
    color:       '#1877f2',
    icon:        '🛒',
  },
  {
    id:          'truecar',
    name:        'TrueCar',
    description: 'Surface TrueCar certified-price leads directly inside ShiftAI so you respond before the competition.',
    authType:    'credentials',
    color:       '#0ea5e9',
    icon:        'TC',
  },
  {
    id:          'edmunds',
    name:        'Edmunds',
    description: 'Receive Edmunds leads enriched with pricing and review data for smarter AI follow-up.',
    authType:    'api_key',
    color:       '#1e293b',
    icon:        'E',
  },
  {
    id:          'oem-dealer-com',
    name:        'OEM / Dealer.com',
    description: 'Connect your OEM-provided Dealer.com website to route manufacturer leads through ShiftAI.',
    authType:    'credentials',
    color:       '#374151',
    icon:        'OEM',
  },
  {
    id:          'kbb-ico',
    name:        'KBB / ICO',
    description: 'Pull Kelley Blue Book Instant Cash Offer leads and trade-in appraisal data into ShiftAI.',
    authType:    'api_key',
    color:       '#d97706',
    icon:        'KBB',
  },
  {
    id:          'craigslist',
    name:        'Craigslist',
    description: 'Monitor Craigslist vehicle inquiries and route them into ShiftAI for instant follow-up.',
    authType:    'webhook',
    color:       '#7c3aed',
    icon:        'cl',
  },
  {
    id:          'tiktok-lead-gen',
    name:        'TikTok Lead Gen',
    description: 'Capture TikTok Lead Generation form submissions and have ShiftAI respond while interest is hot.',
    authType:    'oauth',
    color:       '#000000',
    icon:        '♪',
  },
];
