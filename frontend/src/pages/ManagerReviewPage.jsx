import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import VersionHistoryDrawer from '../components/VersionHistoryDrawer';
import {
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  History,
  Calendar,
  Layers,
  ArrowLeft,
  User,
  Clock,
  Flame,
  Star,
  Link as LinkIcon
} from 'lucide-react';

const ManagerReviewPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [action, setAction] = useState('APPROVE'); // 'APPROVE' | 'REQUEST_CHANGES'
  const [comment, setComment] = useState('');
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
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
    fetchReport();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (action === 'REQUEST_CHANGES' && !comment.trim()) {
      setError('Please provide a general comment explaining what needs correction.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await reportApi.reviewReport(id, { action, comment });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading report for review...</div>;
  }

  if (error && !report) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl">Go Back</button>
      </div>
    );
  }

  const tasksPlanned = JSON.parse(report.tasksPlannedNextWeek || '[]');
  const blockers = JSON.parse(report.blockers || '[]');
  const achievements = JSON.parse(report.achievements || '[]');
  const hoursBreakdown = JSON.parse(report.hoursBreakdown || '{}');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900">
              Manager Review Workspace
            </h1>
            <StatusBadge status={report.status} isLate={report.isLate} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Reviewing report submitted by <span className="font-semibold text-slate-800">{report.user.name}</span> for Week {report.weekNumber}, {report.year}
          </p>
        </div>

        <button
          onClick={() => setVersionDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition"
        >
          <History className="w-4 h-4 text-blue-600" />
          Inspect Version History ({report.versions?.length || 1})
        </button>
      </div>

      {/* Two Column Layout: Left (Report Content), Right (Review Action Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Report Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            {/* Meta Row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-800">{report.user.name}</span>
                <span className="text-slate-400">({report.user.department})</span>
              </div>
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ backgroundColor: `${report.project.color}15`, color: report.project.color }}
              >
                {report.project.name}
              </span>
            </div>

            {/* Tasks Completed Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tasks Completed
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                    <tr>
                      <th className="px-3 py-2">Task</th>
                      <th className="px-2 py-2">Priority</th>
                      <th className="px-2 py-2">Plan/Act %</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2">Time (hrs)</th>
                      <th className="px-3 py-2">Deliverable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {report.tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-3 py-2 font-medium text-slate-900">{task.name}</td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-2 py-2 font-bold text-blue-700">
                          {task.plannedPercent}% / {task.actualPercent}%
                        </td>
                        <td className="px-2 py-2">{task.status}</td>
                        <td className="px-2 py-2">{task.timePlannedHours}h / {task.timeSpentHours}h</td>
                        <td className="px-3 py-2 text-slate-500 italic">{task.outputDeliverable || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blockers & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                <div className="font-bold text-rose-800 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Blockers & Obstacles
                </div>
                {blockers.map((b, i) => (
                  <div key={i} className="text-slate-800">
                    {b.isKey && <span className="text-red-700 font-bold mr-1">[KEY]</span>}
                    {typeof b === 'string' ? b : b.text}
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                <div className="font-bold text-emerald-800 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" /> Key Wins & Highlights
                </div>
                {achievements.map((a, i) => (
                  <div key={i} className="text-slate-800">
                    {a.isKey && <span className="text-emerald-700 font-bold mr-1">[KEY]</span>}
                    {typeof a === 'string' ? a : a.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Next week plan */}
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Tasks Planned for Next Week:
              </h4>
              <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                {tasksPlanned.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Manager Review Action Panel */}
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 space-y-5 shadow-lg lg:sticky lg:top-20">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Submit Review Decision</h3>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            {/* Action Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Review Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAction('APPROVE');
                    setComment('Report looks complete and well documented. Approved!');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                    action === 'APPROVE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-600" />
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAction('REQUEST_CHANGES');
                    setComment('');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                    action === 'REQUEST_CHANGES'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mb-1 text-amber-600" />
                  Request Changes
                </button>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {action === 'APPROVE' ? 'Approval Note (Optional)' : 'Correction Feedback Comment *'}
              </label>
              <textarea
                rows={4}
                required={action === 'REQUEST_CHANGES'}
                placeholder={
                  action === 'REQUEST_CHANGES'
                    ? 'Clearly describe what needs to be changed before this report can be approved...'
                    : 'Add positive reinforcement or comments on deliverables...'
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {action === 'REQUEST_CHANGES' && (
                <p className="text-[11px] text-amber-700 mt-1">
                  Status will change to <strong>Needs Correction</strong>. The team member will see this comment and must resubmit.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-2 ${
                action === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              }`}
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Review...' : action === 'APPROVE' ? 'Confirm Approval' : 'Send Back for Correction'}
            </button>
          </form>
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

export default ManagerReviewPage;
