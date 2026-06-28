'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

const NAV = [
  { href: '/dashboard',              label: 'Overview',       icon: <BarChartIcon /> },
  { href: '/dashboard/leads',        label: 'Leads',          icon: <LeadsIcon /> },
  { href: '/dashboard/conversations',label: 'Conversations',  icon: <ChatIcon /> },
  { href: '/dashboard/scheduler',    label: 'Scheduler',      icon: <CalendarIcon /> },
  { href: '/dashboard/auctions',     label: 'Auctions',       icon: <AuctionIcon /> },
  { href: '/dashboard/integrations', label: 'Integrations',   icon: <IntegIcon /> },
  { href: '/dashboard/settings',     label: 'Settings',       icon: <SettingsIcon /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [email, setEmail]     = useState('');
  const [plan, setPlan]       = useState('');

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }
      setEmail(session.user.email ?? '');
      setPlan((session.user.user_metadata?.plan as string) ?? 'starter');
    });
  }, [router]);

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    router.replace('/login');
  }

  const displayName = email.split('@')[0] ?? 'User';
  const isPro       = ['pro', 'group_suite'].includes(plan);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f0f4f8' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#0d1520',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: '#0ea5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0,
          }}>S</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>ShiftAI</span>
        </div>

        {/* User info */}
        <div style={{ padding: '10px 16px 16px' }}>
          <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Logged in as</p>
          <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName || '…'}</p>
          <span style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 600,
            padding: '2px 8px', borderRadius: 20,
            background: isPro ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
            color:      isPro ? '#34d399'               : '#fbbf24',
            border:     `1px solid ${isPro ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
          }}>
            {isPro ? 'Pro' : '14-day trial'}
          </span>
        </div>

        <div style={{ height: 1, background: '#1e293b', margin: '0 16px' }} />

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <a key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, marginBottom: 2,
                color: active ? '#f1f5f9' : '#64748b',
                background: active ? '#1e293b' : 'transparent',
                textDecoration: 'none', fontSize: 13.5, fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
              }}>
                <span style={{ color: active ? '#0ea5e9' : '#475569', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Upgrade / Sign out */}
        <div style={{ padding: '12px 12px 20px' }}>
          {!isPro && (
            <div style={{
              background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
              borderRadius: 10, padding: '14px 12px', marginBottom: 10,
            }}>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>Upgrade to go live</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: '0 0 10px' }}>Start responding to real leads today.</p>
              <a href="/dashboard/settings?tab=billing" style={{
                display: 'block', textAlign: 'center',
                background: '#fff', color: '#0ea5e9',
                fontSize: 12, fontWeight: 700,
                padding: '7px 0', borderRadius: 6,
                textDecoration: 'none',
              }}>Choose a Plan</a>
            </div>
          )}
          <button onClick={handleSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', background: 'none', border: 'none',
            color: '#475569', fontSize: 13, cursor: 'pointer',
            padding: '8px 10px', borderRadius: 6,
          }}>
            <SignOutIcon />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  );
}

/* ── SVG icons ─────────────────────────────────────────────── */
function BarChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>;
}
function LeadsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ChatIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function AuctionIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function IntegIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function SignOutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
