'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

export default function SettingsClient({ userEmail }: { userEmail: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadSessions = () => {
    setLoading(true);
    fetch('/api/settings/sessions')
      .then(res => res.json())
      .then(json => setSessions(json.data || []))
      .catch(err => addToast('Failed to load sessions', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevokeSession = async (id: string) => {
    if (!confirm('Revoke this session? The device will immediately be logged out.')) return;
    setRevoking(id);
    try {
      const res = await fetch(`/api/settings/sessions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke session');
      addToast('Session revoked successfully', 'success');
      loadSessions();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setRevoking(null);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt(`To delete your account, type "DELETE". This cannot be undone.`);
    if (confirmText !== 'DELETE') return;

    try {
      const res = await fetch('/api/settings/account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      window.location.href = '/';
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar userEmail={userEmail} />
      <div style={{ flex: 1, overflowX: 'hidden' }}>
        <TopBar title="Settings" />
        <PageWrapper>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Account Info */}
            <section>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: 'var(--size-md, 16px)' }}>Account Profile</h3>
              <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, max-content) 1fr', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted, #6B7280)', fontSize: '14px', fontWeight: 600 }}>Login ID:</span>
                  <span style={{ fontWeight: 500 }}>{userEmail}</span>
                  
                  <span style={{ color: 'var(--text-muted, #6B7280)', fontSize: '14px', fontWeight: 600 }}>Account Type:</span>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>Standard</span>
                </div>
              </Card>
            </section>

            {/* Active Sessions */}
            <section>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: 'var(--size-md, 16px)' }}>Active Sessions</h3>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>
                ) : (
                  <Table
                    data={sessions}
                    emptyText="No active sessions found."
                    columns={[
                      {
                        key: 'deviceInfo',
                        header: 'Device',
                        render: (row) => row.deviceInfo || 'Unknown Device'
                      },
                      {
                        key: 'ipAddress',
                        header: 'IP Address',
                        render: (row) => row.ipAddress || 'Unknown IP'
                      },
                      {
                        key: 'createdAt',
                        header: 'Started At',
                        render: (row) => new Date(row.createdAt).toLocaleDateString()
                      },
                      {
                        key: 'actions',
                        header: '',
                        align: 'right',
                        render: (row) => (
                          <Button 
                            variant="danger" 
                            isLoading={revoking === row.id}
                            disabled={revoking !== null}
                            onClick={() => handleRevokeSession(row.id)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '11px' }}
                          >
                            Revoke
                          </Button>
                        )
                      }
                    ]}
                  />
                )}
              </Card>
            </section>

            {/* Danger Zone */}
            <section>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: 'var(--size-md, 16px)', color: 'var(--error, #DC2626)' }}>Danger Zone</h3>
              <Card style={{ border: '1px solid var(--error, #DC2626)', background: '#FEF2F2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--error, #DC2626)', fontSize: '15px' }}>Delete Account</h4>
                    <p style={{ margin: 0, color: '#991B1B', fontSize: '13px' }}>
                      Permanently delete your account, connected tools, API keys, and all logs.
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleDeleteAccount}>Delete Account</Button>
                </div>
              </Card>
            </section>

          </div>
        </PageWrapper>
      </div>
    </div>
  );
}
