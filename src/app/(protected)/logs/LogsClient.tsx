'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LogsClient({ userEmail }: { userEmail: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTool, setFilterTool] = useState('');
  
  const loadLogs = (p: number, tool: string) => {
    setLoading(true);
    let url = `/api/logs?page=${p}`;
    if (tool) url += `&tool=${encodeURIComponent(tool)}`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        setLogs(json.data || []);
        setTotalPages(json.meta?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs(page, filterTool);
  }, [page, filterTool]);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar userEmail={userEmail} />
      <div style={{ flex: 1, overflowX: 'hidden' }}>
        <TopBar title="Activity Log" />
        <PageWrapper>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--size-lg, 20px)' }}>System Logs</h2>
              <p style={{ margin: 0, color: 'var(--text-muted, #6B7280)', fontSize: 'var(--size-sm, 14px)' }}>
                Audit trail of API routing, verifications, and auth events.
              </p>
            </div>
            <div style={{ width: '250px' }}>
              <Input 
                placeholder="Filter by tool (e.g. openai)" 
                value={filterTool}
                onChange={(e) => {
                  setFilterTool(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {loading && logs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
            ) : (
              <>
                <Table
                  data={logs}
                  emptyText="No logs found."
                  columns={[
                    {
                      key: 'createdAt',
                      header: 'Timestamp',
                      render: (row) => new Date(row.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium', timeStyle: 'medium'
                      })
                    },
                    {
                      key: 'toolName',
                      header: 'Integration',
                      render: (row) => <strong style={{ textTransform: 'capitalize' }}>{row.toolName}</strong>
                    },
                    {
                      key: 'actionType',
                      header: 'Action',
                      render: (row) => <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{row.actionType}</span>
                    },
                    {
                      key: 'status',
                      header: 'Result',
                      render: (row) => row.responseStatus ? (
                        <span style={{ 
                          color: row.responseStatus < 400 ? 'var(--success, #16A34A)' : 'var(--error, #DC2626)',
                          fontWeight: 600
                        }}>
                          {row.responseStatus}
                        </span>
                      ) : '-'
                    },
                    {
                      key: 'errorMessage',
                      header: 'Details',
                      render: (row) => (
                        <span style={{ color: 'var(--text-muted, #6B7280)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', display: 'inline-block' }}>
                          {row.errorMessage || 'Success'}
                        </span>
                      )
                    }
                  ]}
                />
                
                {/* Pagination */}
                <div style={{ 
                  padding: '1rem 1.5rem', 
                  borderTop: '1px solid var(--border, #E5E7EB)',
                  background: '#F9FAFB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted, #6B7280)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      variant="ghost" 
                      disabled={page <= 1 || loading}
                      onClick={() => setPage(p => p - 1)}
                    >
                      &larr; Prev
                    </Button>
                    <Button 
                      variant="ghost" 
                      disabled={page >= totalPages || loading}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next &rarr;
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </PageWrapper>
      </div>
    </div>
  );
}
