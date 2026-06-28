import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase/client';

// POST /api/auth/login
// Body: { email: string; password: string }
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
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
      user: {
        id:    data.user.id,
        email: data.user.email,
      },
    });
  } catch (err: any) {
    console.error('POST /api/auth/login error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
