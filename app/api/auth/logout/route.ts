import { NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase/client';

// POST /api/auth/logout
export async function POST() {
  try {
    const { error } = await supabaseBrowser.auth.signOut();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
