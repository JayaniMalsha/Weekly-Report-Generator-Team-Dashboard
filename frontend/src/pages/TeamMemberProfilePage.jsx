import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  User,
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  FileText,
  Eye,
  Shield
} from 'lucide-react';

const TeamMemberProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userApi.getUserProfile(id);
        setProfile(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading team member profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl">Go Back</button>
      </div>
    );
  }

  const { user: member, stats, reports } = profile;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Member Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {member.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{member.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {member.email}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {member.department}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                <Shield className="w-3 h-3 mr-0.5" /> {member.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            Compliance Rate
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.complianceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{stats.onTimeReports} on-time, {stats.lateReports} late</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            Reports Logged
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalReports}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{stats.approvedReports} approved</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            Tasks Completed
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalTasksCompleted}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all project cycles</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            Hours Logged
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalHoursLogged}h</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total productive time</div>
        </div>
      </div>

      {/* Member Full Report History */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Weekly Reporting History</h3>
          <span className="text-xs text-slate-400">{reports.length} report(s) found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Week</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Tasks</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Review Feedback</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Week {r.weekNumber}, {r.year}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{ backgroundColor: `${r.project.color}15`, color: r.project.color }}
                    >
                      {r.project.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.tasks.length} tasks</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} isLate={r.isLate} size="sm" />
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                    {r.reviewComments && r.reviewComments.length > 0 ? (
                      `"${r.reviewComments[0].comment}"`
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/report/${r.id}`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfilePage;
