// src/app/admin/page.tsx — Complete admin dashboard
// Route: /admin (protected — isAdmin only)
'use client'
import { useEffect, useState } from 'react'

interface Stats {
  users: { total: number; newToday: number; paid: number; activeToday: number }
  revenue: { mrr: number; mrrFormatted: string }
  leads: { byStatus: Record<string, number>; totalEstimatedValue: number }
  tokens: { totalCirculating: number; totalEverEarned: number }
  health: { atRiskClients: number }
}

interface Lead {
  id: string; name: string; company?: string; jobTitle?: string
  qualityScore: number; status: string; source: string; createdAt: string
  useCase?: string
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [leads, setLeads]   = useState<Lead[]>([])
  const [tab, setTab]       = useState<'overview'|'leads'|'users'|'content'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/crm/leads').then(r => r.json()),
    ]).then(([s, l]) => {
      setStats(s.data)
      setLeads(l.data ?? [])
      setLoading(false)
    })
  }, [])

  // Launch countdown
  const [countdown, setCountdown] = useState('')
  useEffect(() => {
    const launch = new Date('2026-03-05T18:29:00Z')
    const tick = () => {
      const diff = launch.getTime() - Date.now()
      if (diff <= 0) { setCountdown('LIVE NOW'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setCountdown(`${d}d ${h}h ${m}m`)
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])

  const statusColor: Record<string, string> = {
    NEW: 'bg-gray-700 text-gray-300', CONTACTED: 'bg-blue-900 text-blue-300',
    RESPONDED: 'bg-cyan-900 text-cyan-300', DEMO_SCHEDULED: 'bg-yellow-900 text-yellow-300',
    DEMO_DONE: 'bg-orange-900 text-orange-300', NEGOTIATING: 'bg-purple-900 text-purple-300',
    CLOSED_WON: 'bg-green-900 text-green-300', CLOSED_LOST: 'bg-red-900 text-red-300',
    PASSIVE: 'bg-gray-800 text-gray-500',
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080b0f] flex items-center justify-center">
      <div className="text-[#f0c030] font-mono text-sm animate-pulse">LOADING ADMIN...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080b0f] text-gray-100 font-mono">

      {/* Top bar */}
      <div className="border-b border-[#21262d] bg-[#0d1117] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-[#f0c030] font-bold tracking-widest text-sm">ARIA ADMIN</span>
          <span className="text-xs text-gray-600">Internal — Not for users</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-gray-500">Launch in: <span className="text-red-400 font-bold">{countdown}</span></span>
          <span className="text-xs text-gray-500">{new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#21262d] pb-0">
          {(['overview','leads','users','content'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border-b-2 transition-colors ${tab===t ? 'border-[#f0c030] text-[#f0c030]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">

            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'MRR', value: stats.revenue.mrrFormatted, sub: 'Target ₹14,500 Mar 10', color: 'text-yellow-400' },
                { label: 'Paid Users', value: stats.users.paid, sub: 'Target 5 by Mar 10', color: 'text-green-400' },
                { label: 'Total Users', value: stats.users.total, sub: `${stats.users.newToday} today`, color: 'text-blue-400' },
                { label: 'Active Today', value: stats.users.activeToday, sub: 'Unique sessions', color: 'text-cyan-400' },
                { label: 'Hot Leads', value: stats.leads.byStatus?.DEMO_SCHEDULED ?? 0, sub: 'Demo scheduled', color: 'text-orange-400' },
                { label: 'Pipeline', value: Object.values(stats.leads.byStatus ?? {}).reduce((a,b) => a+b, 0), sub: 'Total leads', color: 'text-purple-400' },
                { label: 'At-Risk', value: stats.health.atRiskClients, sub: 'Health score ≤3', color: stats.health.atRiskClients > 0 ? 'text-red-400' : 'text-green-400' },
                { label: 'Tokens Out', value: (stats.tokens.totalCirculating / 1000).toFixed(1) + 'K', sub: 'Circulating balance', color: 'text-yellow-300' },
              ].map(m => (
                <div key={m.label} className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">{m.label}</div>
                  <div className={`text-2xl font-bold font-sans ${m.color}`}>{m.value}</div>
                  <div className="text-[10px] text-gray-600 mt-1">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Pipeline status */}
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#21262d] bg-[#161b22]">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Pipeline Breakdown</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-9 divide-x divide-[#21262d]">
                {Object.entries(stats.leads.byStatus ?? {}).map(([status, count]) => (
                  <div key={status} className="p-3 text-center">
                    <div className="text-lg font-bold text-white">{count}</div>
                    <div className="text-[9px] text-gray-500 mt-1">{status.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot leads quick view */}
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#21262d] bg-[#161b22] flex justify-between">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Hot Leads (Score ≥7)</span>
                <button onClick={() => setTab('leads')} className="text-[10px] text-blue-400 hover:text-blue-300">View all →</button>
              </div>
              {leads.filter(l => l.qualityScore >= 7).length === 0 ? (
                <div className="p-8 text-center text-gray-600 text-xs">No hot leads yet. Add your first 20 personal contacts.</div>
              ) : (
                <div className="divide-y divide-[#21262d]">
                  {leads.filter(l => l.qualityScore >= 7).slice(0, 5).map(lead => (
                    <div key={lead.id} className="px-4 py-3 flex items-center gap-4 hover:bg-[#161b22]">
                      <div className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                        {lead.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white">{lead.name}</div>
                        <div className="text-[10px] text-gray-500">{lead.company} · {lead.jobTitle}</div>
                      </div>
                      <div className="text-xs text-green-400 font-bold">{lead.qualityScore}/10</div>
                      <span className={`text-[9px] px-2 py-1 rounded-full ${statusColor[lead.status]}`}>{lead.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* LEADS TAB */}
        {tab === 'leads' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{leads.length} total leads</span>
              <AddLeadForm onAdd={(lead) => setLeads(prev => [lead, ...prev])} />
            </div>
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#21262d] bg-[#161b22]">
                    {['Name','Company','Source','Score','Status','Use Case','Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[9px] uppercase tracking-widest text-gray-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {leads.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-600">
                      No leads yet. Add your first 20 personal contacts above.
                    </td></tr>
                  ) : leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-[#161b22] transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white">{lead.name}</div>
                        <div className="text-gray-500 text-[10px]">{lead.jobTitle}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{lead.company ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{lead.source}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-green-500" style={{ width: `${lead.qualityScore * 10}%`, background: lead.qualityScore >= 7 ? '#3fb950' : lead.qualityScore >= 4 ? '#ffa657' : '#f85149' }} />
                          </div>
                          <span className={lead.qualityScore >= 7 ? 'text-green-400' : lead.qualityScore >= 4 ? 'text-orange-400' : 'text-red-400'}>{lead.qualityScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] px-2 py-1 rounded-full ${statusColor[lead.status]}`}>{lead.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{lead.useCase ?? '—'}</td>
                      <td className="px-4 py-3">
                        <select className="bg-[#21262d] text-gray-300 text-[10px] px-2 py-1 rounded border border-[#30363d]"
                          onChange={async (e) => {
                            await fetch(`/api/crm/leads/${lead.id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: e.target.value }) })
                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: e.target.value } : l))
                          }}
                          defaultValue={lead.status}>
                          {['NEW','CONTACTED','RESPONDED','DEMO_SCHEDULED','DEMO_DONE','NEGOTIATING','CLOSED_WON','CLOSED_LOST','PASSIVE'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && <UsersTab />}

        {/* CONTENT TAB */}
        {tab === 'content' && <ContentTab />}

      </div>
    </div>
  )
}

// ─── SUB COMPONENTS ──────────────────────────────────────────────────────────

function AddLeadForm({ onAdd }: { onAdd: (lead: Lead) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', company:'', jobTitle:'', source:'LINKEDIN', useCase:'', city:'Pune' })

  const submit = async () => {
    const res = await fetch('/api/crm/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.success) { onAdd({ ...form, id: data.data.id, qualityScore: 5, status: 'NEW', createdAt: new Date().toISOString() } as Lead); setOpen(false) }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-[#f0c030] text-black text-xs px-4 py-2 rounded font-bold hover:bg-[#d4a017]">+ Add Lead</button>
      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-6 w-[480px] space-y-4">
            <div className="text-sm font-bold text-white">Add Lead</div>
            {[['name','Name *'],['email','Email'],['company','Company'],['jobTitle','Job Title'],['city','City']].map(([k,l]) => (
              <div key={k}>
                <label className="text-[9px] uppercase text-gray-500 tracking-widest block mb-1">{l}</label>
                <input className="w-full bg-[#080b0f] border border-[#30363d] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f0c030]"
                  value={(form as any)[k]} onChange={e => setForm(p => ({...p, [k]: e.target.value}))} />
              </div>
            ))}
            <div>
              <label className="text-[9px] uppercase text-gray-500 tracking-widest block mb-1">Source</label>
              <select className="w-full bg-[#080b0f] border border-[#30363d] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f0c030]"
                value={form.source} onChange={e => setForm(p => ({...p, source: e.target.value}))}>
                {['LINKEDIN','TWITTER','WHATSAPP','REDDIT','REFERRAL','DIRECT','COLD_OUTREACH'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase text-gray-500 tracking-widest block mb-1">Use Case</label>
              <input className="w-full bg-[#080b0f] border border-[#30363d] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f0c030]"
                placeholder="What do they want to use ARIA for?" value={form.useCase} onChange={e => setForm(p => ({...p, useCase: e.target.value}))} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setOpen(false)} className="text-xs px-4 py-2 rounded border border-[#30363d] text-gray-400 hover:text-white">Cancel</button>
              <button onClick={submit} className="text-xs px-4 py-2 rounded bg-[#f0c030] text-black font-bold hover:bg-[#d4a017]">Add Lead</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.data?.users ?? [])) }, [])
  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead><tr className="border-b border-[#21262d] bg-[#161b22]">
          {['User','Plan','Status','Tokens','Joined','Last Active'].map(h => (
            <th key={h} className="text-left px-4 py-3 text-[9px] uppercase tracking-widest text-gray-500 font-normal">{h}</th>
          ))}
        </tr></thead>
        <tbody className="divide-y divide-[#21262d]">
          {users.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-600">No users yet. Launch March 5 →</td></tr>
          ) : users.map((u: any) => (
            <tr key={u.id} className="hover:bg-[#161b22]">
              <td className="px-4 py-3"><div className="text-white">{u.name ?? u.email}</div><div className="text-gray-500 text-[10px]">{u.email}</div></td>
              <td className="px-4 py-3"><span className={`text-[9px] px-2 py-1 rounded-full ${u.plan==='FREE'?'bg-gray-800 text-gray-400':'bg-green-900 text-green-300'}`}>{u.plan}</span></td>
              <td className="px-4 py-3 text-gray-400">{u.status}</td>
              <td className="px-4 py-3 text-yellow-400">{u.tokens?.balance ?? 0}</td>
              <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="px-4 py-3 text-gray-500">{new Date(u.lastActiveAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ContentTab() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { day: 'Monday', type: 'LinkedIn Post', topic: '"What I built this week" — founder update + ARIA output screenshot', status: 'pending' },
        { day: 'Wednesday', type: 'LinkedIn Post', topic: '"Problem → Solution" — specific pro use case ARIA solves in the post itself', status: 'pending' },
        { day: 'Friday', type: 'LinkedIn Post', topic: 'Beta user result (anonymous until they agree)', status: 'pending' },
        { day: 'Daily', type: 'Twitter/X Thread', topic: '1 AI efficiency tip for professionals', status: 'pending' },
        { day: '3x/week', type: 'WhatsApp Status', topic: '30-sec screen recording of one ARIA task', status: 'pending' },
        { day: 'Mar 5', type: 'Launch Post', topic: '"7 days building → ARIA live on GitHub. Made in Pune 🇮🇳"', status: 'draft' },
        { day: 'Mar 6', type: 'Paid Launch', topic: '"Paid version live. First 10 get 40% off forever. [X] spots left."', status: 'draft' },
        { day: 'Mar 10', type: 'Milestone Post', topic: '"50 users in 5 days, built in Pune" — with real numbers', status: 'waiting' },
      ].map((item, i) => (
        <div key={i} className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] uppercase text-gray-500">{item.day} · {item.type}</span>
            <span className={`text-[9px] px-2 py-1 rounded-full ${item.status==='draft'?'bg-yellow-900 text-yellow-300':item.status==='waiting'?'bg-gray-800 text-gray-500':'bg-[#21262d] text-gray-400'}`}>{item.status}</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{item.topic}</p>
        </div>
      ))}
    </div>
  )
}
