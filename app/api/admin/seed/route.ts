import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { isAdminToken } from '@/lib/admin';

const ADMIN_USERS = [
  {
    email:          'nico@dcgmotors.com',
    name:           'Nico',
    dealershipName: 'DCG Motors',
    plan:           'group_suite',
    password:       '***REDACTED***',
    isAdmin:        true,
  },
  {
    email:          'admin@shiftai.space',
    name:           'Joe',
    dealershipName: 'ShiftAI HQ',
    plan:           'group_suite',
    password:       '***REDACTED***',
    isAdmin:        true,
  },
];

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!isAdminToken(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const results = [];

    for (const user of ADMIN_USERS) {
      const { data: existingUsers } = await supabaseService.auth.admin.listUsers();
      const exists = existingUsers?.users?.find(u => u.email === user.email);

      let authUserId: string;

      if (exists) {
        await supabaseService.auth.admin.updateUserById(exists.id, {
          password: user.password,
        });
        authUserId = exists.id;
        results.push({ email: user.email, action: 'updated', authUserId });
      } else {
        const { data, error } = await supabaseService.auth.admin.createUser({
          email:         user.email,
          password:      user.password,
          email_confirm: true,
          user_metadata: {
            name:        user.name,
            dealer_name: user.dealershipName,
            plan:        user.plan,
            is_admin:    true,
          },
        });
        if (error) {
          results.push({ email: user.email, action: 'error', error: error.message });
          continue;
        }
        authUserId = data.user.id;
        results.push({ email: user.email, action: 'created', authUserId });
      }

      const { error: dealerError } = await supabaseService
        .from('dealers')
        .upsert(
          {
            auth_user_id:        authUserId,
            email:               user.email,
            name:                user.name,
            dealership_name:     user.dealershipName,
            plan:                user.plan,
            plan_status:         'active',
            is_admin:            user.isAdmin,
            onboarding_complete: true,
            ai_name:             'Alex',
            ai_tone:             'friendly',
            dealer_mode:         'standard',
          },
          { onConflict: 'auth_user_id' },
        );

      if (dealerError) {
        results.push({ email: user.email, dealerError: dealerError.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
