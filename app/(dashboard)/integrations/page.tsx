'use client';

import { useEffect, useState, useCallback } from 'react';
import { PARTNERS, Partner } from '@/lib/integrations/partners';
import { supabaseBrowser } from '@/lib/supabase/client';

interface ConnectedIntegration {
  partner_id:     string;
  status:         string;
  connected_at:   string;
  last_synced_at: string;
}

function ConnectModal({
  partner,
  onClose,
  onSuccess,
}: {
  partner:   Partner;
  onClose:   () => void;
  onSuccess: (id: string) => void;
}) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const fieldMap: Record<string, string[]> = {
    api_key:     ['API Key'],
    credentials: ['Username', 'Password'],
    webhook:     ['Webhook URL'],
    oauth:       [],
    none:        [],
  };
  const formFields = fieldMap[partner.authType] ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/integrations/connect', {
        method:  'POST',
        headers,
        body:    JSON.stringify({ partnerId: partner.id, credentials: fields }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? 'Connection failed. Please try again.');
        return;
      }
      onSuccess(partner.id);
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isAutomatic = partner.authType === 'none' || partner.authType === 'oauth';

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-icon" style={{ background: partner.color }}>{partner.icon}</div>
          <div>
            <h2 className="modal-title">Connect {partner.name}</h2>
            <p className="modal-desc">{partner.description}</p>
          </div>
        </div>

        {isAutomatic ? (
          <>
            <p className="hint">
              {partner.authType === 'oauth'
                ? `Click below to authorise ShiftAI via ${partner.name}'s secure OAuth flow.`
                : 'This integration is enabled automatically — no additional setup needed.'}
            </p>
            <button className="btn-primary full mt3" onClick={async () => {
              const headers = await authHeaders();
              await fetch('/api/integrations/connect', {
                method: 'POST', headers,
                body: JSON.stringify({ partnerId: partner.id, credentials: {} }),
              });
              onSuccess(partner.id); onClose();
            }}>
              {partner.authType === 'oauth' ? `Authorise with ${partner.name}` : 'Enable'}
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {formFields.map(label => (
              <div key={label} className="field">
                <label className="label">{label}</label>
                <input
                  type={label.toLowerCase().includes('password') ? 'password' : 'text'}
                  className="input"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={fields[label] ?? ''}
                  onChange={e => setFields(p => ({ ...p, [label]: e.target.value }))}
                  required
                />
              </div>
            ))}
            {error && <p className="err">{error}</p>}
            <div className="row mt3">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Connecting…' : 'Connect'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function IntegrationCard({
  partner,
  connected,
  onConnect,
  onDisconnect,
}: {
  partner:      Partner;
  connected:    boolean;
  onConnect:    (p: Partner) => void;
  onDisconnect: (id: string) => void;
}) {
  return (
    <div className={`card ${connected ? 'card-on' : ''}`}>
      <div className="card-top">
        <div className="c-icon" style={{ background: partner.color }}>{partner.icon}</div>
        <span className={`badge ${connected ? 'badge-on' : 'badge-live'}`}>
          {connected ? '✓ Connected' : '✓ Live'}
        </span>
      </div>
      <h3 className="c-name">{partner.name}</h3>
      <p className="c-desc">{partner.description}</p>
      <div className="c-foot">
        {connected ? (
          <button className="btn-dis" onClick={() => onDisconnect(partner.id)}>Disconnect</button>
        ) : (
          <button className="btn-con" onClick={() => onConnect(partner)}>Connect</button>
        )}
      </div>
    </div>
  );
}

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabaseBrowser.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

export default function IntegrationsPage() {
  const [connected, setConnected]     = useState<Set<string>>(new Set());
  const [modal, setModal]             = useState<Partner | null>(null);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState('');
  const [confirmId, setConfirmId]     = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const loadIntegrations = useCallback(async () => {
    const headers = await authHeaders();
    fetch('/api/integrations', { headers })
      .then(r => r.json())
      .then(data => {
        if (data.integrations) {
          setConnected(new Set(
            (data.integrations as ConnectedIntegration[])
              .filter(i => i.status === 'connected')
              .map(i => i.partner_id),
          ));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadIntegrations(); }, [loadIntegrations]);

  async function handleDisconnect(partnerId: string) {
    const name = PARTNERS.find(p => p.id === partnerId)?.name ?? partnerId;
    if (!window.confirm(`Disconnect ${name}? ShiftAI will stop receiving leads from this source.`)) return;
    const headers = await authHeaders();
    await fetch('/api/integrations/disconnect', {
      method: 'DELETE',
      headers,
      body:   JSON.stringify({ partnerId }),
    });
    setConnected(prev => { const n = new Set(prev); n.delete(partnerId); return n; });
    showToast(`${name} disconnected.`);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Platform Integrations</h1>
          <p className="page-sub">Every lead source. One inbox. Connect the platforms you use and ShiftAI handles the rest.</p>
        </div>
        <a href="mailto:admin@shiftai.space" className="wh-link">
          Don't see your source?{' '}
          <span>We integrate via webhook with any platform →</span>
        </a>
      </div>

      <div className="section-label">
        <span className="dot" />
        <strong>LIVE NOW</strong>
        <span className="sub">— ShiftAI responds instantly to leads from all these platforms</span>
      </div>

      {loading ? (
        <p className="loading">Loading integrations…</p>
      ) : (
        <div className="grid">
          {PARTNERS.map(p => (
            <IntegrationCard
              key={p.id}
              partner={p}
              connected={connected.has(p.id)}
              onConnect={setModal}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}

      <p className="footer-note">
        Don't see your lead source?{' '}
        <a href="mailto:admin@shiftai.space" className="wh-link-inline">
          Tell us — we integrate via webhook with any platform.
        </a>
      </p>

      {modal && (
        <ConnectModal
          partner={modal}
          onClose={() => setModal(null)}
          onSuccess={id => {
            setConnected(prev => new Set([...prev, id]));
            const name = PARTNERS.find(p => p.id === id)?.name ?? id;
            showToast(`${name} connected ✓`);
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">{toast}</div>
      )}

      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Inter', system-ui, sans-serif;
          color: #f1f5f9;
        }
        .page-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 36px;
        }
        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin: 0 0 6px;
        }
        .page-sub { font-size: 0.9rem; color: #64748b; margin: 0; }
        .wh-link { font-size: 0.8125rem; color: #64748b; text-decoration: none; align-self: flex-end; }
        .wh-link span { color: #0ea5e9; }
        .section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 6px #34d399;
          flex-shrink: 0;
        }
        .sub { font-weight: 400; }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 16px;
        }
        .card {
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.15s;
        }
        .card:hover { border-color: #334155; }
        .card-on {
          border-color: rgba(52, 211, 153, 0.3);
          background: rgba(52, 211, 153, 0.04);
        }
        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .c-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .badge-live {
          background: rgba(52, 211, 153, 0.1);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .badge-on {
          background: rgba(52, 211, 153, 0.18);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.35);
        }
        .c-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
        }
        .c-desc {
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }
        .c-foot { margin-top: 4px; }
        .btn-con {
          width: 100%;
          padding: 8px 0;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-con:hover { opacity: 0.88; }
        .btn-dis {
          width: 100%;
          padding: 8px 0;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #f87171;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 7px;
          cursor: pointer;
        }
        .btn-dis:hover { background: rgba(248,113,113,0.14); }
        .loading { color: #64748b; text-align: center; padding: 60px 0; }
        .footer-note {
          margin-top: 40px;
          font-size: 0.8125rem;
          color: #475569;
          text-align: center;
        }
        .wh-link-inline { color: #0ea5e9; text-decoration: none; }
        .wh-link-inline:hover { text-decoration: underline; }

        /* Modal */
        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 24px;
        }
        .modal {
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }
        .modal-head {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .modal-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .modal-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }
        .modal-desc {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .hint { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; margin: 0; }
        .field { margin-bottom: 16px; }
        .label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .input {
          width: 100%;
          background: #0d1520;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.9375rem;
          color: #f1f5f9;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
        }
        .err {
          font-size: 0.8125rem;
          color: #f87171;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 6px;
          padding: 8px 12px;
          margin: 0 0 16px;
        }
        .row { display: flex; gap: 10px; }
        .btn-primary {
          flex: 1;
          padding: 10px 20px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-primary.full { width: 100%; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .btn-ghost {
          flex: 1;
          padding: 10px 20px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          background: transparent;
          border: 1px solid #1e293b;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-ghost:hover { color: #94a3b8; border-color: #334155; }
        .mt3 { margin-top: 0.75rem; }
        .toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          border: 1px solid #334155;
          color: #f1f5f9;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          z-index: 100;
          white-space: nowrap;
          animation: slide-up 0.2s ease;
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateX(-50%) translateY(8px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
