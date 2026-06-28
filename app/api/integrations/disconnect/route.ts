import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

// DELETE /api/integrations/disconnect
// Body: { partnerId: string }
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partnerId } = await req.json();
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required.' }, { status: 400 });
    }

    const { error } = await supabaseService
      .from('dealer_integrations')
      .delete()
      .eq('dealer_id', user.id)
      .eq('partner_id', partnerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, partnerId });
  } catch (err: any) {
    console.error('DELETE /api/integrations/disconnect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
