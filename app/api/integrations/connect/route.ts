import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { PARTNERS } from '@/lib/integrations/partners';

// POST /api/integrations/connect
// Body: { partnerId: string; credentials: Record<string, string> }
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partnerId, credentials } = await req.json();

    if (!PARTNERS.find(p => p.id === partnerId)) {
      return NextResponse.json({ error: 'Unknown partner.' }, { status: 400 });
    }

    const { error: upsertError } = await supabaseService
      .from('dealer_integrations')
      .upsert(
        {
          dealer_id:      user.id,
          partner_id:     partnerId,
          status:         'connected',
          connected_at:   new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
          metadata:       { credentials },
        },
        { onConflict: 'dealer_id,partner_id' },
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, partnerId });
  } catch (err: any) {
    console.error('POST /api/integrations/connect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
