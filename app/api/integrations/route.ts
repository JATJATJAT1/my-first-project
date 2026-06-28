import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

// GET /api/integrations
// Returns the calling dealer's connected integrations and their plan.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [dealerRes, integrationsRes] = await Promise.all([
      supabaseService
        .from('dealers')
        .select('plan, plan_status')
        .eq('auth_user_id', user.id)
        .single(),
      supabaseService
        .from('dealer_integrations')
        .select('partner_id, status, connected_at, last_synced_at, metadata')
        .eq('dealer_id', user.id),
    ]);

    if (dealerRes.error) {
      return NextResponse.json({ error: dealerRes.error.message }, { status: 400 });
    }

    return NextResponse.json({
      plan:         dealerRes.data.plan,
      planStatus:   dealerRes.data.plan_status,
      integrations: integrationsRes.data ?? [],
    });
  } catch (err: any) {
    console.error('GET /api/integrations error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
