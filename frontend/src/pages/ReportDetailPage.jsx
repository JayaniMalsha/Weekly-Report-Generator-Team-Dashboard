import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import VersionHistoryDrawer from '../components/VersionHistoryDrawer';
import {
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  History,
  Clock,
  ArrowLeft,
  FileEdit,
  Star,
  Flame,
  CheckSquare,
  Link as LinkIcon,
  User
} from 'lucide-react';

const ReportDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await reportApi.getReportById(id);
        setReport(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading report details...</div>;
  }

  if (error || !report) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error || 'Report not found or access denied.'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isAuthor = user?.id === report.userId;
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isEditable = isAuthor && (report.status === 'Draft' || report.status === 'Needs Correction');

  const tasksPlanned = JSON.parse(report.tasksPlannedNextWeek || '[]');
  const blockers = JSON.parse(report.blockers || '[]');
  const achievements = JSON.parse(report.achievements || '[]');
  const hoursBreakdown = JSON.parse(report.hoursBreakdown || '{}');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to reports
        </button>

        <div className="flex items-center gap-2">
          {/* Version history button */}
          <button
            onClick={() => setVersionDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            Version History ({report.versions?.length || 1})
          </button>

          {/* Edit button if author */}
          {isEditable && (
            <button
              onClick={() => navigate(`/report/edit/${report.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
            >
              <FileEdit className="w-3.5 h-3.5" /> Edit Report
            </button>
          )}

          {/* Review action if manager and submitted */}
          {isManager && report.status === 'Submitted' && (
            <button
              onClick={() => navigate(`/review/${report.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Review / Take Action
            </button>
          )}
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
        {/* Header Details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                Week {report.weekNumber}, {report.year} Work Report
              </h1>
              <StatusBadge status={report.status} isLate={report.isLate} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {report.user?.name} ({report.user?.department})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date(report.startDate).toLocaleDateString()} – {new Date(report.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <span
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                backgroundColor: `${report.project.color}15`,
                color: report.project.color
              }}
            >
              <Layers className="w-3.5 h-3.5 mr-1" />
              {report.project.name} ({report.project.code})
            </span>
          </div>
        </div>

        {/* Latest Manager Review Comment Notice (if any) */}
        {report.reviewComments && report.reviewComments.length > 0 && (
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            report.reviewComments[0].action === 'APPROVE'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              {report.reviewComments[0].action === 'APPROVE' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              Manager Review Comment ({report.reviewComments[0].action}):
            </div>
            <p className="italic pl-5 font-medium">"{report.reviewComments[0].comment}"</p>
            <div className="text-[10px] opacity-75 pl-5">
              By {report.reviewComments[0].author?.name} • {new Date(report.reviewComments[0].createdAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* 3. Tasks Completed Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            3. Tasks Completed
          </h2>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-3 py-2.5">Task Name</th>
                  <th className="px-3 py-2.5">Priority</th>
                  <th className="px-3 py-2.5">Planned %</th>
                  <th className="px-3 py-2.5">Actual %</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Plan / Spent (hrs)</th>
                  <th className="px-3 py-2.5">Output / Deliverable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {report.tasks?.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">{task.name}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'Urgent'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{task.plannedPercent}%</td>
                    <td className="px-3 py-2.5 font-bold text-blue-700">{task.actualPercent}%</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                        {task.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {task.timePlannedHours}h / <span className="font-bold text-slate-900">{task.timeSpentHours}h</span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 italic">
                      {task.outputDeliverable || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Tasks Planned Next Week */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            4. Tasks Planned for Next Week
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
            {tasksPlanned.length > 0 ? (
              tasksPlanned.map((p, i) => <li key={i}>{p}</li>)
            ) : (
              <li className="text-slate-400 italic">None specified</li>
            )}
          </ul>
        </div>

        {/* 5. Blockers & 6. Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Blockers */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> 5. Blockers & Challenges
            </h3>
            {blockers.length > 0 ? (
              <div className="space-y-2">
                {blockers.map((b, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-xs border ${
                      b.isKey ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {b.isKey && (
                      <span className="inline-block px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold uppercase mr-1.5">
                        Key Issue
                      </span>
                    )}
                    {typeof b === 'string' ? b : b.text}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No blockers reported.</p>
            )}
          </div>

          {/* Achievements */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Star className="w-4 h-4" /> 6. Achievements & Highlights
            </h3>
            {achievements.length > 0 ? (
              <div className="space-y-2">
                {achievements.map((a, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-xs border ${
                      a.isKey ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {a.isKey && (
                      <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase mr-1.5">
                        Key Win
                      </span>
                    )}
                    {typeof a === 'string' ? a : a.text}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No highlights recorded.</p>
            )}
          </div>
        </div>

        {/* 7. Hours Breakdown */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            7. Hours Worked Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {Object.entries(hoursBreakdown).map(([k, v]) => (
              <div key={k} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 capitalize block text-[10px]">{k}</span>
                <span className="font-bold text-slate-800 text-sm">{v}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Notes & Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              8. General Notes
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-wrap">
              {report.notes || 'No notes provided.'}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" /> Links & Deliverables
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-blue-600 break-all">
              {report.links || 'No links provided.'}
            </div>
          </div>
        </div>

      </div>

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        isOpen={versionDrawerOpen}
        onClose={() => setVersionDrawerOpen(false)}
        versions={report.versions || []}
      />
    </div>
  );
};

export default ReportDetailPage;
