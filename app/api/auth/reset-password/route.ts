import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Must use anon client — service role does not send reset emails.
    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
