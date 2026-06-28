import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { storeCredential } from '@/lib/vault';
import { PARTNERS } from '@/lib/integrations/partners';
import { ConnectIntegrationSchema, parseBody } from '@/lib/validation';

export async function POST(req: NextRequest) {
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
    let credentials: Record<string, string> = {};
    try {
      ({ partnerId, credentials } = parseBody(ConnectIntegrationSchema, body) as { partnerId: string; credentials: Record<string, string> });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    if (!PARTNERS.find(p => p.id === partnerId)) {
      return NextResponse.json({ error: 'Unknown partner.' }, { status: 400 });
    }

    // Store credentials in Supabase Vault (AES-256-GCM encrypted).
    // Only the vault_secret_id UUID is stored in the integrations table.
    let vaultSecretId: string | null = null;
    if (Object.keys(credentials).length > 0) {
      vaultSecretId = await storeCredential(user.id, partnerId, credentials);
    }

    const { error: upsertError } = await supabaseService
      .from('dealer_integrations')
      .upsert(
        {
          dealer_id:       user.id,
          partner_id:      partnerId,
          status:          'connected',
          vault_secret_id: vaultSecretId,
          connected_at:    new Date().toISOString(),
          last_synced_at:  new Date().toISOString(),
        },
        { onConflict: 'dealer_id,partner_id' },
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Write to audit log (fire-and-forget — don't block the response).
    supabaseService.from('integration_audit_log').insert({
      dealer_id:  user.id,
      partner_id: partnerId,
      action:     'connected',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
    }).then(() => {});

    return NextResponse.json({ success: true, partnerId });
  } catch (err: any) {
    console.error('POST /api/integrations/connect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
