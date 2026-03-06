'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const AVAILABLE_PROVIDERS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'pinecone', name: 'Pinecone' },
  { id: 'sendgrid', name: 'SendGrid' },
  { id: 'twilio', name: 'Twilio' },
  { id: 'stripe', name: 'Stripe' },
  { id: 'airtable', name: 'Airtable' },
  { id: 'slack', name: 'Slack' },
];

export default function ApiKeysClient({ userEmail }: { userEmail: string }) {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(AVAILABLE_PROVIDERS[0].id);
  const [keyValue, setKeyValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadKeys = () => {
    setLoading(true);
    fetch('/api/keys')
      .then((res) => res.json())
      .then((json) => setKeys(json.data || []))
      .catch((err) => addToast('Failed to load keys', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleAddKey = async () => {
    if (!keyValue.trim()) {
      addToast('API key is required', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: selectedProvider, key: keyValue }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error?.message || 'Failed to add key');
      
      addToast(`${selectedProvider} key added successfully`, 'success');
      setKeyValue('');
      setIsModalOpen(false);
      loadKeys();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the ${name} key?`)) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete key');
      addToast('Key deleted', 'info');
      loadKeys();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleTestKey = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/keys/${id}/test`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Test failed');
      addToast(`${name} key is valid and working`, 'success');
    } catch (err: any) {
      addToast(`Test failed: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar userEmail={userEmail} />
      <div style={{ flex: 1, overflowX: 'hidden' }}>
        <TopBar title="API Keys" />
        <PageWrapper>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--size-lg, 20px)' }}>Manage API Keys</h2>
              <p style={{ margin: 0, color: 'var(--text-muted, #6B7280)', fontSize: 'var(--size-sm, 14px)' }}>
                Connect third-party services natively into the routing layer securely.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Add Key</Button>
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
            ) : (
              <Table
                data={keys}
                emptyText="No API keys connected yet. Add one to get started."
                columns={[
                  {
                    key: 'toolName',
                    header: 'Provider',
                    render: (row) => (
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {row.toolName}
                      </div>
                    )
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (row) => <Badge variant={row.status === 'active' ? 'Connected' : 'Error'} />
                  },
                  {
                    key: 'updatedAt',
                    header: 'Last Updated',
                    render: (row) => new Date(row.updatedAt).toLocaleDateString()
                  },
                  {
                    key: 'actions',
                    header: '',
                    align: 'right',
                    render: (row) => (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" onClick={() => handleTestKey(row.id, row.toolName)}>Test</Button>
                        <Button variant="danger" onClick={() => handleDelete(row.id, row.toolName)}>Delete</Button>
                      </div>
                    )
                  }
                ]}
              />
            )}
          </Card>
        </PageWrapper>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Add API Key"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddKey} isLoading={isSubmitting}>Save Key</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem' }}>Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm, 4px)',
                border: '1px solid var(--border, #E5E7EB)',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            >
              {AVAILABLE_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="API Key"
            type="password"
            placeholder="sk-..."
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-muted, #6B7280)', margin: 0 }}>
            Keys are encrypted using AES-256-GCM before being stored in the database.
          </p>
        </div>
      </Modal>
    </div>
  );
}
