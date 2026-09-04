import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { CheckSquare, Clock, ArrowRight, User, Calendar, CheckCircle2 } from 'lucide-react';

const ReviewsListPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      // Fetch reports with status Submitted
      const res = await reportApi.getReports({ status: 'Submitted', limit: 20 });
      setReports(res.data.data);
    } catch (err) {
      console.error('Error loading submitted reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-indigo-600" />
          Pending Submissions Awaiting Manager Review
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review submitted weekly reports, approve them, or send them back with feedback for correction.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading pending reviews...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">All Caught Up!</h3>
            <p className="text-xs text-slate-500">No reports are currently awaiting review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Team Member</th>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3">Submission Status</th>
                  <th className="px-5 py-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {report.user.name.charAt(0)}
                        </div>
                        {report.user.name}
                      </div>
                    </td>

                    <td className="px-4 py-3">Week {report.weekNumber}, {report.year}</td>

                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: `${report.project.color}15`, color: report.project.color }}
                      >
                        {report.project.name}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {report.tasks?.length || 0} tasks
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={report.status} isLate={report.isLate} size="sm" />
                    </td>

                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => navigate(`/review/${report.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                      >
                        Review & Decide <ArrowRight className="w-3.5 h-3.5" />
                      </button>
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

export default ReviewsListPage;
