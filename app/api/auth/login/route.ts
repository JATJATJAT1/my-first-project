import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase/client';
import { LoginSchema, parseBody } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    let email: string, password: string;
    try {
      ({ email, password } = parseBody(LoginSchema, body));
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      session: {
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at:    data.session.expires_at,
        token_type:    'bearer',
      },
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (err: any) {
    console.error('POST /api/auth/login error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
