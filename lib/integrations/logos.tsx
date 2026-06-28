'use client';

export function PartnerLogo({ id, size = 40 }: { id: string; size?: number }) {
  const p = { width: size, height: size } as const;

  switch (id) {
    case 'facebook-ads':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#1877F2"/>
          <path d="M23 21.5h2.5l.5-4H23V16c0-1.1.5-2 2-2h1.5v-3.5C26 10.2 25 10 23.5 10c-3 0-5 1.8-5 5v2.5H16v4h2.5V30H23V21.5z" fill="white"/>
        </svg>
      );

    case 'instagram':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <defs>
            <radialGradient id="ig-logo" cx="30%" cy="107%" r="150%">
              <stop offset="0%"   stopColor="#fdf497"/>
              <stop offset="10%"  stopColor="#fdf497"/>
              <stop offset="45%"  stopColor="#fd5949"/>
              <stop offset="60%"  stopColor="#d6249f"/>
              <stop offset="90%"  stopColor="#285AEB"/>
            </radialGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill="url(#ig-logo)"/>
          <rect x="11" y="11" width="18" height="18" rx="5.5" stroke="white" strokeWidth="2" fill="none"/>
          <circle cx="20" cy="20" r="4.5" stroke="white" strokeWidth="2" fill="none"/>
          <circle cx="28" cy="12" r="1.6" fill="white"/>
        </svg>
      );

    case 'autotrader':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#F26B21"/>
          {/* AT lettermark – simplified car/A shape */}
          <path d="M16 28l4.5-16h.5L25.5 28h-3l-1-3.5h-3L17.5 28H16zm4.5-6h2l-1-4-1 4z" fill="white"/>
        </svg>
      );

    case 'cargurus':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#00873C"/>
          {/* C arc + G letterform */}
          <path d="M23 14.5c-3.1 0-5.5 2.5-5.5 5.5s2.4 5.5 5.5 5.5c2 0 3.7-.9 4.8-2.3l-2-1.5c-.6.9-1.6 1.5-2.8 1.5-1.8 0-3.2-1.4-3.2-3.2 0-1.8 1.4-3.2 3.2-3.2 1 0 1.9.5 2.5 1.2V18h-3v2.2h5.3V20c0-3-2.2-5.5-4.8-5.5z" fill="white"/>
        </svg>
      );

    case 'cars-com':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#CC0000"/>
          {/* simplified car silhouette */}
          <path d="M9 24v2h2v1h4v-1h10v1h4v-1h2v-2l-2-1-1-4c-.5-1.5-2-2-3-2H15c-1 0-2.5.5-3 2l-1 4-2 1z" fill="white" fillOpacity="0.9"/>
          <circle cx="15" cy="26.5" r="2" fill="#CC0000" stroke="white" strokeWidth="1"/>
          <circle cx="25" cy="26.5" r="2" fill="#CC0000" stroke="white" strokeWidth="1"/>
        </svg>
      );

    case 'fb-marketplace':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#0866FF"/>
          {/* Marketplace "M" lightning bolt */}
          <path d="M20 9a11 11 0 0 0 0 22v-9h-4v-4h4v-3a5 5 0 0 1 5-5h3v4h-2.5a1.5 1.5 0 0 0-1.5 1.5V18h4l-.5 4H24v9a11 11 0 0 0 0-22z" fill="none"/>
          <path d="M10 19h9V9.2A11 11 0 0 0 10 19zM21 9.2V19h9A11 11 0 0 0 21 9.2zM10 21a11 11 0 0 0 9 9.8V21H10zM21 30.8A11 11 0 0 0 30 21h-9v9.8z" fill="white"/>
        </svg>
      );

    case 'google-business':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
          <path d="M30.5 21.2c0-.8-.1-1.5-.2-2.2H20.5v4h5.7c-.3 1.3-1 2.5-2.2 3.2v2.7h3.5C29.5 27 30.5 24.4 30.5 21.2z" fill="#4285F4"/>
          <path d="M20.5 31c2.9 0 5.4-1 7.1-2.7l-3.5-2.7c-.9.6-2.1 1-3.6 1-2.8 0-5.2-1.9-6-4.5h-3.5v2.8C12.7 28.5 16.3 31 20.5 31z" fill="#34A853"/>
          <path d="M14.5 22.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1v-2.8H11c-.7 1.4-1.1 3-1.1 4.9s.4 3.5 1.1 4.9l3.5-2.8z" fill="#FBBC04"/>
          <path d="M20.5 13.4c1.6 0 3.1.5 4.2 1.7l3.1-3.1C26 10 23.5 9 20.5 9c-4.2 0-7.8 2.4-9.5 5.9l3.5 2.8c.8-2.6 3.2-4.3 6-4.3z" fill="#EA4335"/>
        </svg>
      );

    case 'truecar':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#004B93"/>
          {/* T-R lettermarks */}
          <path d="M11 14h7v2.5h-2V27h-3V16.5H11V14z" fill="white"/>
          <path d="M20 14h5c2.5 0 4 1.2 4 3.2 0 1.5-.9 2.7-2.3 3.1L30 27h-3.5l-2.8-6H23v6h-3V14zm3 2.5V21h1.5c1.2 0 1.8-.6 1.8-1.8s-.6-1.7-1.8-1.7H23z" fill="white"/>
        </svg>
      );

    case 'edmunds':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#1A1A2E"/>
          {/* E letterform */}
          <path d="M13 13h14v3H16v3h9v3h-9v3h12v3H13V13z" fill="white"/>
        </svg>
      );

    case 'kbb-ico':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#003087"/>
          <text x="20" y="23" textAnchor="middle" dominantBaseline="middle" fill="#F5A623" fontWeight="900" fontSize="13" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="-0.5">KBB</text>
          <text x="20" y="32" textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="400" fontSize="7" fontFamily="Arial, sans-serif">Instant Cash Offer</text>
        </svg>
      );

    case 'craigslist':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#6B1FB1"/>
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontWeight="700" fontSize="19" fontFamily="Georgia, serif">cl</text>
        </svg>
      );

    case 'tiktok-lead-gen':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#010101"/>
          {/* Cyan shadow layer */}
          <path d="M28 10h-4.5v14.5a4 4 0 1 1-3-3.9V16a8 8 0 1 0 7.5 8V15.5c1.4.9 3 1.5 4.5 1.5V13a6 6 0 0 1-4.5-3z" fill="#69C9D0" transform="translate(-1.5 -0.5)"/>
          {/* Red shadow layer */}
          <path d="M28 10h-4.5v14.5a4 4 0 1 1-3-3.9V16a8 8 0 1 0 7.5 8V15.5c1.4.9 3 1.5 4.5 1.5V13a6 6 0 0 1-4.5-3z" fill="#EE1D52" transform="translate(1.5 0.5)" opacity="0.7"/>
          {/* White main shape */}
          <path d="M28 10h-4.5v14.5a4 4 0 1 1-3-3.9V16a8 8 0 1 0 7.5 8V15.5c1.4.9 3 1.5 4.5 1.5V13a6 6 0 0 1-4.5-3z" fill="white"/>
        </svg>
      );

    case 'dealer-website':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#1E40AF"/>
          <circle cx="20" cy="20" r="9.5" stroke="white" strokeWidth="1.8" fill="none"/>
          <path d="M20 10.5c-2.5 4-2.5 15 0 19" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M20 10.5c2.5 4 2.5 15 0 19" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <line x1="10.5" y1="20" x2="29.5" y2="20" stroke="white" strokeWidth="1.5"/>
          <line x1="12.5" y1="15" x2="27.5" y2="15" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
          <line x1="12.5" y1="25" x2="27.5" y2="25" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
        </svg>
      );

    case 'missed-call':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#7C3AED"/>
          {/* phone handset */}
          <path d="M14 12c-.5 0-1 .2-1.4.6l-1.4 1.4c-.9.9-1.2 2.3-.5 3.5l8 8c1.1 1.2 2.6 1 3.5.1l1.4-1.4c.4-.4.6-.9.6-1.4s-.2-1-.6-1.4l-2.5-2.5c-.4-.4-.9-.6-1.4-.6s-1 .2-1.4.6l-.6.6L16 17l.6-.6c.4-.4.6-.9.6-1.4s-.2-1-.6-1.4L14.6 12a2 2 0 0 0-.6-.6V12z" fill="white" fillOpacity="0.85"/>
          {/* curved return arrow */}
          <path d="M24 9c-2.8 0-5 2.2-5 5h2c0-1.7 1.3-3 3-3V9z" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <polyline points="22,8 25,11 22,14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      );

    case 'email-leads':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#059669"/>
          <rect x="9" y="13" width="22" height="15" rx="2.5" stroke="white" strokeWidth="1.8" fill="none"/>
          <path d="M9 16l11 7 11-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'oem-dealer-com':
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#374151"/>
          {/* house/dealership icon */}
          <path d="M8 30V21L20 12l12 9v9H8z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
          <rect x="16" y="22" width="8" height="8" rx="1" stroke="white" strokeWidth="1.6" fill="none"/>
          <rect x="18" y="22" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.25"/>
        </svg>
      );

    default:
      return (
        <svg {...p} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#334155"/>
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontWeight="700" fontSize="13" fontFamily="Arial, sans-serif">
            {id.slice(0, 2).toUpperCase()}
          </text>
        </svg>
      );
  }
}
