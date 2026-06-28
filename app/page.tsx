'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? '/dashboard/integrations' : '/login');
    });
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1520',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9,
          background: '#0ea5e9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 17,
        }}>S</div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>ShiftAI</span>
      </div>
    </div>
  );
}
