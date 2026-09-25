import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi, projectApi, userApi, reportApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  LayoutDashboard,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  UserCheck,
  ChevronRight,
  Eye,
  CheckSquare,
  FileEdit,
  Sparkles,
  Columns
} from 'lucide-react';

const TeamDashboardPage = () => {
  const navigate = useNavigate();

  const [weekNumber, setWeekNumber] = useState(36);
  const [year, setYear] = useState(2026);
  const [projectId, setProjectId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboardMetrics({
        weekNumber,
        year,
        projectId: projectId || undefined
      });
      setMetrics(res.data.data);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
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
    fetchDashboard();
  }, [weekNumber, year, projectId]);

  const summary = metrics?.summary;
  let membersList = metrics?.memberStatusOverview || [];

  // Filter members list based on UI filters
  if (statusFilter) {
    membersList = membersList.filter((m) => m.status === statusFilter);
  }
  if (memberFilter) {
    membersList = membersList.filter((m) => m.userId === memberFilter);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            Team Weekly Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated team reporting compliance, review pipeline, and status tracking.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/comparator')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition shadow-xs"
          >
            <Columns className="w-3.5 h-3.5" />
            Side-by-Side Section View
          </button>
          <button
            onClick={() => navigate('/insights')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-xs"
          >
            Visual Charts & Analytics
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Week Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Week:</span>
            <select
              value={weekNumber}
              onChange={(e) => setWeekNumber(parseInt(e.target.value, 10))}
              className="text-xs font-semibold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {[36, 35, 34, 33, 32].map((w) => (
                <option key={w} value={w}>
                  Week {w} (2026)
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Project:</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Needs Correction">Needs Correction</option>
              <option value="Draft">Draft</option>
              <option value="Not Yet Started">Not Yet Started</option>
            </select>
          </div>
        </div>

        {/* Member Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700">Member:</span>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
        >
        <option value="">All Members</option>
           {membersList.map((member) => (
        <option key={member.userId} value={member.userId}>
           {member.userName}
        </option>
         ))}
       </select>
       </div>

        {(projectId || statusFilter || memberFilter) && (
          <button
            onClick={() => {
              setProjectId('');
              setStatusFilter('');
              setMemberFilter('');
            }}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Summary KPI Metric Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Reports Submitted</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {summary.totalSubmitted} / {summary.totalTeamMembers}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {summary.approvedCount} approved, {summary.totalSubmitted - summary.approvedCount} awaiting review
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Compliance Rate</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {summary.complianceRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {summary.lateCount > 0 ? `${summary.lateCount} late submission(s)` : '100% on-time'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Needs Correction</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {summary.needsCorrectionCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Sent back to author for adjustments
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Open Team Blockers</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">
              {summary.totalBlockers}
            </div>
            <div className="text-[11px] text-rose-500 font-semibold mt-0.5">
              {summary.keyBlockers} flagged as critical
            </div>
          </div>
        </div>
      )}

      {/* Member Submission Status Table (Tracking all 5 statuses) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Team Member Submission Status — Week {weekNumber}, {year}
            </h2>
            <p className="text-xs text-slate-500">
              Tracks Draft, Submitted, Needs Correction, Approved, and Not Yet Started.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading team status...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Team Member</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assigned Project</th>
                  <th className="px-4 py-3">Status for Week {weekNumber}</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {membersList.map((member) => (
                  <tr key={member.userId} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/member/${member.userId}`)}
                        className="hover:text-indigo-600 hover:underline flex items-center gap-2 text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {member.userName.charAt(0)}
                        </div>
                        {member.userName}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {member.department}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {member.project ? (
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: `${member.project.color}15`,
                            color: member.project.color
                          }}
                        >
                          {member.project.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={member.status} isLate={member.isLate} size="sm" />
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => navigate(`/member/${member.userId}`)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Profile History
                      </button>

                      {member.reportId && (
                        <button
                          onClick={() => navigate(`/report/${member.reportId}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Open Report
                        </button>
                      )}

                      {member.reportId && member.status === 'Submitted' && (
                        <button
                          onClick={() => navigate(`/review/${member.reportId}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                        >
                          Review Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDashboardPage;
