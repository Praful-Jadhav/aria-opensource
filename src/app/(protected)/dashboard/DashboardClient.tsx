'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface DashboardSummary {
  apiCallsToday: number;
  activeSessionsCount: number;
  connections: Array<{ id: string; toolName: string; status: string; expiresAt: string | null }>;
  apiKeys: Array<{ id: string; toolName: string; status: string }>;
  recentLogs: Array<{ id: string; toolName: string; actionType: string; responseStatus: number | null; errorMessage: string | null; createdAt: string }>;
  expiringTokens: Array<{ id: string; toolName: string; expiresAt: string | null }>;
}

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = () => {
    fetch('/api/dashboard/summary')
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error?.message || 'Failed to load dashboard data');
        setData(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnectOAuth = async (tool: 'google-workspace' | 'github') => {
    setActionLoading(`connect_${tool}`);
    try {
      const res = await fetch(`/api/connections/${tool}/init`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to initialize connection');
      window.location.href = json.url;
    } catch (err: any) {
      alert(err.message);
      setActionLoading(null);
    }
  };

  const handleDisconnectTool = async (id: string, toolType: 'oauth' | 'apikey', toolName: string) => {
    if (!confirm(`Disconnect ${toolName}? This will stop all related routing capabilities.`)) return;
    
    setActionLoading(`disconnect_${id}`);
    try {
      let endpoint = '';
      if (toolType === 'oauth') {
         endpoint = `/api/connections/${toolName.replace('_', '-')}/disconnect`;
      } else {
         endpoint = `/api/keys/${id}`;
      }

      const res = await fetch(endpoint, {
        method: toolType === 'oauth' ? 'POST' : 'DELETE'
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to disconnect');
      }

      loadData(); // refresh dashboard
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar userEmail={userEmail} />
        <div style={{ flex: 1 }}>
          <TopBar title="Overview" />
          <PageWrapper>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <Spinner size={32} />
            </div>
          </PageWrapper>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar userEmail={userEmail} />
        <div style={{ flex: 1 }}>
          <TopBar title="Overview" />
          <PageWrapper>
            <Card style={{ textAlign: 'center', color: 'var(--error, #DC2626)' }}>
              <h3>Error loading dashboard</h3>
              <p>{error || 'Unknown error'}</p>
              <Button onClick={() => window.location.reload()} variant="primary">Retry</Button>
            </Card>
          </PageWrapper>
        </div>
      </div>
    );
  }

  const allTools = [...data.connections, ...data.apiKeys];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar userEmail={userEmail} />
      
      <div style={{ flex: 1, overflowX: 'hidden' }}>
        <TopBar title="Overview" />
        
        <PageWrapper>
          {/* Overview Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            <Card>
              <div style={{ fontSize: 'var(--size-xs, 11px)', color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase', fontWeight: 600 }}>Connected Tools</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text, #111827)' }}>{allTools.length}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 'var(--size-xs, 11px)', color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase', fontWeight: 600 }}>Active Sessions</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text, #111827)' }}>{data.activeSessionsCount}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 'var(--size-xs, 11px)', color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase', fontWeight: 600 }}>API Calls Today</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text, #111827)' }}>{data.apiCallsToday}</div>
            </Card>
            <Card style={{ borderLeft: data.expiringTokens.length > 0 ? '4px solid var(--warning, #D97706)' : undefined }}>
              <div style={{ fontSize: 'var(--size-xs, 11px)', color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase', fontWeight: 600 }}>Tokens Expiring Soon</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: data.expiringTokens.length > 0 ? 'var(--warning, #D97706)' : 'var(--text, #111827)' }}>
                {data.expiringTokens.length}
              </div>
            </Card>
          </div>

          {/* Connected Tools List */}
          <section id="tools">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--size-md, 16px)', color: 'var(--text, #111827)' }}>Connected Tools</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button onClick={() => handleConnectOAuth('google-workspace')} isLoading={actionLoading === 'connect_google-workspace'}>Connect Google</Button>
                <Button onClick={() => handleConnectOAuth('github')} isLoading={actionLoading === 'connect_github'}>Connect GitHub</Button>
                <Link href="/api-keys" className="btn-outline" style={{ textDecoration: 'none', padding: '0.625rem 1rem' }}>Manage API Keys</Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {allTools.length === 0 ? (
                <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-muted, #6B7280)', marginBottom: '1rem' }}>No tools connected yet.</p>
                  <Button onClick={() => handleConnectOAuth('google-workspace')}>Connect your first tool &rarr;</Button>
                </Card>
              ) : (
                allTools.map((tool) => {
                  const isApiKey = !('expiresAt' in tool); // hacky check based on projection mapping
                  return (
                    <Card key={tool.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--size-md, 16px)', color: 'var(--text, #111827)', textTransform: 'capitalize' }}>
                            {tool.toolName.replace('_', ' ')}
                          </div>
                          <div style={{ fontSize: 'var(--size-xs, 11px)', color: 'var(--text-muted, #6B7280)', marginTop: '0.25rem' }}>
                            {'expiresAt' in tool && tool.expiresAt ? `Expires: ${new Date(tool.expiresAt as string).toLocaleDateString()}` : 'API Key'}
                          </div>
                        </div>
                        <Badge 
                          variant={tool.status === 'active' ? 'Connected' : tool.status === 'revoked' || tool.status === 'deleted' ? 'Pending' : 'Error'} 
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        {isApiKey ? (
                          <Link href="/api-keys" className="btn-outline" style={{ flex: 1, padding: '0.375rem', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>Manage Key</Link>
                        ) : (
                          <Button 
                            variant="secondary" 
                            style={{ flex: 1, padding: '0.375rem' }} 
                            onClick={() => handleConnectOAuth(tool.toolName.replace('_', '-') as any)}
                          >
                            Reconnect
                          </Button>
                        )}
                        <Button 
                          variant="danger" 
                          style={{ padding: '0.375rem' }}
                          isLoading={actionLoading === `disconnect_${tool.id}`}
                          onClick={() => handleDisconnectTool(tool.id, isApiKey ? 'apikey' : 'oauth', tool.toolName)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>

          {/* Recent Activity Table */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--size-md, 16px)', color: 'var(--text, #111827)' }}>Recent Activity</h3>
              <Link href="/logs" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '0.875rem' }}>View All &rarr;</Link>
            </div>
            
            <Table
              data={data.recentLogs}
              emptyText="No recent routing activity."
              columns={[
                {
                  key: 'createdAt',
                  header: 'Time',
                  render: (row) => new Date(row.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                },
                {
                  key: 'toolName',
                  header: 'Tool',
                  render: (row) => <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{row.toolName}</span>
                },
                {
                  key: 'actionType',
                  header: 'Action',
                  render: (row) => row.actionType
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => row.responseStatus === 200 ? (
                    <span style={{ color: 'var(--success, #16A34A)' }}>✅ 200</span>
                  ) : (
                    <span style={{ color: 'var(--error, #DC2626)' }}>❌ {row.responseStatus || 'ERR'}</span>
                  )
                }
              ]}
            />
          </section>

        </PageWrapper>
      </div>
    </div>
  );
}
