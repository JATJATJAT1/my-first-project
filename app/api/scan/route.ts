import { NextRequest, NextResponse } from 'next/server';
import { analyzeDealershipSite } from '@/lib/firecrawl';
import { supabaseService } from '@/lib/supabase/service';
import { ScanSchema, parseBody } from '@/lib/validation';

// GET /api/scan
// Returns the signed-in dealer's saved scan history (most recent first).
export async function GET(req: NextRequest) {
  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseService
      .from('dealer_scans')
      .select('id, url, dealership_name, brands, city, state, phone, features, score, gaps, favicon_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ scans: data ?? [] });
  } catch (err: any) {
    console.error('GET /api/scan error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// POST /api/scan
// Body: { url: string }
// Runs a Firecrawl-powered dealership-site analysis. Works anonymously (landing
// page lead magnet) and, when an Authorization bearer token is present, saves the
// scan to the signed-in dealer's history in Supabase.
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    let url: string;
    try {
      ({ url } = parseBody(ScanSchema, body));
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    // Run the analysis.
    let result;
    try {
      result = await analyzeDealershipSite(url);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: e.status ?? 502 });
    }

    // If the caller is signed in, persist the scan to their history.
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
    let saved = false;
    if (token) {
      const { data: { user } } = await supabaseService.auth.getUser(token);
      if (user) {
        const { error } = await supabaseService.from('dealer_scans').insert({
          user_id:         user.id,
          url:             result.url,
          dealership_name: result.analysis.dealershipName,
          brands:          result.analysis.brands,
          city:            result.analysis.city,
          state:           result.analysis.state,
          phone:           result.analysis.phone,
          features: {
            hasInventorySearch: result.analysis.hasInventorySearch,
            hasContactForm:     result.analysis.hasContactForm,
            hasChatWidget:      result.analysis.hasChatWidget,
            hasFinancingPage:   result.analysis.hasFinancingPage,
            sellsUsedCars:      result.analysis.sellsUsedCars,
          },
          score:       result.score,
          gaps:        result.gaps,
          favicon_url: result.faviconUrl,
        });
        saved = !error;
      }
    }

    return NextResponse.json({ ...result, saved });
  } catch (err: any) {
    console.error('POST /api/scan error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
