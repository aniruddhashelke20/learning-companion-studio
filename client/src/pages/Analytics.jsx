import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Users, Award, Zap, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import api, { track } from '../api';
import Layout from '../components/Layout';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('ALL');

  const fetchAnalytics = () => {
    setLoading(true);
    api.get('/analytics/overview')
      .then((r) => {
        setData(r.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
    track('DASHBOARD_VIEWED', {
      component: 'Analytics',
      eventContext: 'Admin Analytics Dashboard',
      resourceType: 'page'
    });
  }, []);

  const handleExportCSV = async () => {
    try {
      track('EXPORT_CLICKED', {
        component: 'Analytics',
        eventContext: 'Admin Analytics Dashboard',
        resourceType: 'button',
        metadata: { format: 'csv' }
      });
      
      const token = localStorage.getItem('learnlog_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/analytics/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnlog_clickstream_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('CSV Export failed:', e);
    }
  };

  if (loading && !data) {
    return (
      <Layout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="text-brand dark:text-indigo-400 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching real-time analytics…</p>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
          <h2 className="text-xl font-bold">Failed to load analytics</h2>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </Layout>
    );
  }

  // Cards configuration
  const cardData = [
    { 
      label: 'Total Learners', 
      value: data.totalUsers, 
      desc: 'Registered platform accounts',
      icon: <Users size={20} />, 
      color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' 
    },
    { 
      label: 'Average Quiz Score', 
      value: `${data.averageScore}%`, 
      desc: 'Aggregated quiz submission mean',
      icon: <Award size={20} />, 
      color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
    },
    { 
      label: 'Active Users (24h)', 
      value: data.dailyActiveUsers, 
      desc: 'Distinct active clickstream users',
      icon: <Zap size={20} />, 
      color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' 
    }
  ];

  // Colors for charts
  const barColors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'];

  // List of unique event names for selection filters
  const uniqueEventNames = ['ALL', ...new Set(data.recentEvents.map(e => e.eventName))];

  // Filtering recent events
  const filteredEvents = data.recentEvents.filter(e => {
    const matchesUser = e.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (!e.userId?.name && searchTerm.toLowerCase() === 'unknown');
    const matchesEvent = selectedEvent === 'ALL' || e.eventName === selectedEvent;
    return matchesUser && matchesEvent;
  });

  return (
    <Layout>
      {/* Header Title with Export CSV Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand dark:text-indigo-400">Administration Console</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Learning Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze real-time learner engagements and clickstream data pipeline logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-xl bg-brand dark:bg-indigo-600 hover:bg-brand-hover dark:hover:bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/10 hover:shadow-brand/20 dark:shadow-none transition-all active:scale-[0.98]"
        >
          <Download size={16} />
          <span>Export Clickstream (CSV)</span>
        </button>
      </div>

      {/* Stats row */}
      <section className="grid gap-5 sm:grid-cols-3 mb-8">
        {cardData.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.label}</span>
              <span className={`p-2.5 rounded-xl ${card.color}`}>
                {card.icon}
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-slate-450 dark:text-slate-500">
              {card.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Middle Section: Chart */}
      <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Most Common Learning Events
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          Frequency of tracked client-side events and server-side evaluation triggers.
        </p>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.commonEvents} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[5, 5, 0, 0]}>
                {data.commonEvents.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Bottom Section: Events Table with Filters */}
      <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Event Logs
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
              Live clickstream feed tracking learner activities across components.
            </p>
          </div>

          {/* Filtering UI elements */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Filter by name..."
                className="pl-9 pr-4 py-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-indigo-500/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Event Name dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <select
                className="pl-9 pr-6 py-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-indigo-500/30 cursor-pointer appearance-none"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {uniqueEventNames.map((name) => (
                  <option key={name} value={name}>
                    {name === 'ALL' ? 'All Events' : name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabular view */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Component</th>
                <th className="p-4">Event Name</th>
                <th className="p-4">Event Context</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-450 dark:text-slate-500 font-medium">
                    No matching clickstream events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e) => {
                  let statusStyle = 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400';
                  if (e.eventName.startsWith('QUIZ_')) statusStyle = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
                  else if (e.eventName.startsWith('VIDEO_')) statusStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
                  else if (e.eventName.includes('REGISTERED') || e.eventName.includes('LOGGED_IN')) statusStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
                  else if (e.eventName.includes('SCROLLED')) statusStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';

                  return (
                    <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors" key={e._id}>
                      <td className="p-4 whitespace-nowrap text-[11px] text-slate-450 dark:text-slate-550">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        <div>{e.userId?.name || 'Unknown'}</div>
                        <div className="text-[10px] font-normal text-slate-450 dark:text-slate-500">{e.userId?.email || 'N/A'}</div>
                      </td>
                      <td className="p-4 font-medium">{e.component}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${statusStyle}`}>
                          {e.eventName}
                        </span>
                      </td>
                      <td className="p-4 font-medium truncate max-w-[160px]">{e.eventContext}</td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
