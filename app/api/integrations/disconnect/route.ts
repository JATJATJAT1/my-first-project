import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { deleteCredential } from '@/lib/vault';
import { DisconnectIntegrationSchema, parseBody } from '@/lib/validation';

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    let partnerId: string;
    try {
      ({ partnerId } = parseBody(DisconnectIntegrationSchema, body));
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    // Fetch existing record to get the vault_secret_id before deleting.
    const { data: existing } = await supabaseService
      .from('dealer_integrations')
      .select('vault_secret_id')
      .eq('dealer_id', user.id)
      .eq('partner_id', partnerId)
      .single();

    // Delete the Vault secret if one exists — removes encrypted credentials.
    if (existing?.vault_secret_id) {
      await deleteCredential(existing.vault_secret_id);
    }

    const { error } = await supabaseService
      .from('dealer_integrations')
      .delete()
      .eq('dealer_id', user.id)
      .eq('partner_id', partnerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log (fire-and-forget).
    supabaseService.from('integration_audit_log').insert({
      dealer_id:  user.id,
      partner_id: partnerId,
      action:     'disconnected',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
    }).then(() => {});

    return NextResponse.json({ success: true, partnerId });
  } catch (err: any) {
    console.error('DELETE /api/integrations/disconnect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
