import React, { useState, useEffect } from 'react';
import { analyticsApi, projectApi } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Briefcase,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

const VisualInsightsPage = () => {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getVisualInsights({
        projectId: selectedProject || undefined
      });
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching visual insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const projRes = await projectApi.getProjects();
        setProjects(projRes.data.data);
      } catch (e) {}
    };
    fetchInit();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedProject]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center min-h-[400px]">
        Generating charts & data insights...
      </div>
    );
  }

  const { tasksTrend, memberStatusBreakdown, projectWorkload, timeSpentChartData, activityFeed } = data;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Visual Insights & Team Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven charts tracking workload, task completion velocity, and time distribution.
          </p>
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Project Scope:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects Combined</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Chart 1 & Chart 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Tasks Completed Trend Over Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Task Completion Velocity Trend</h3>
                <p className="text-[11px] text-slate-500">Completed vs total logged tasks over weeks</p>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tasksTrend}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="completedTasks" name="Completed Tasks" stroke="#2563eb" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
                <Line type="monotone" dataKey="totalTasks" name="Total Tasks Logged" stroke="#94a3b8" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Submission & Approval Status by Member */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Submission Status per Member</h3>
                <p className="text-[11px] text-slate-500">Approval vs corrections ratio across members</p>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberStatusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Approved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Submitted" stackId="a" fill="#3b82f6" />
                <Bar dataKey="NeedsCorrection" name="Needs Correction" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Late" name="Late Submissions" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Chart 3 & Chart 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Workload Distribution by Project */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workload Distribution by Project</h3>
                <p className="text-[11px] text-slate-500">Total task allocation and logged hours</p>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectWorkload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="taskCount" name="Tasks Logged" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="hours" name="Total Hours" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Time Spent by Task Type Team-Wide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Team Time Allocation by Activity</h3>
                <p className="text-[11px] text-slate-500">Development vs Meetings vs Testing vs Documentation</p>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSpentChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" name="Hours Logged" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                  {timeSpentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Live Activity & Review Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Reporting & Review Activity</h3>
            <p className="text-[11px] text-slate-500">Live audit log of submissions, reviews, and change requests</p>
          </div>
        </div>

        <div className="space-y-3">
          {activityFeed.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 flex items-start gap-3 transition"
            >
              <div className="mt-0.5">
                {item.type === 'APPROVAL' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : item.type === 'CHANGES_REQUESTED' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{item.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualInsightsPage;
