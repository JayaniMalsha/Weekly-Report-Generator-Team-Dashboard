import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi, projectApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import VersionHistoryDrawer from '../components/VersionHistoryDrawer';
import {
  History,
  FileEdit,
  Eye,
  Calendar,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle
} from 'lucide-react';

const ReportHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Version drawer state
  const [selectedReportVersions, setSelectedReportVersions] = useState([]);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const res = await reportApi.getReports({
        page,
        limit: 10,
        status: statusFilter || undefined,
        projectId: projectFilter || undefined
      });
      setReports(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching report history:', err);
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
    fetchReports(1);
  }, [statusFilter, projectFilter]);

  const openVersions = async (reportId) => {
    try {
      const res = await reportApi.getVersions(reportId);
      setSelectedReportVersions(res.data.data);
      setVersionDrawerOpen(true);
    } catch (err) {
      console.error('Error loading versions:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            My Weekly Report History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological log of all submitted, draft, and corrected weekly reports.
          </p>
        </div>

        <button
          onClick={() => navigate('/report/current')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          {reports.length === 0 ? 'Create Your Weekly Report' : 'View / Edit Weekly Report'}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Filter className="w-3.5 h-3.5" /> Filter by:
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Needs Correction">Needs Correction</option>
            <option value="Approved">Approved</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {(statusFilter || projectFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setProjectFilter('');
              }}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Report Table / List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading report records...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No reports found matching criteria.</p>
            <button
              onClick={() => navigate('/report/current')}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Start a new report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Week / Year</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Versions</th>
                  <th className="px-4 py-3">Review Feedback</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reports.map((report) => {
                  const isEditable = report.status === 'Draft' || report.status === 'Needs Correction';
                  const latestComment = report.reviewComments && report.reviewComments.length > 0 ? report.reviewComments[0] : null;

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        Week {report.weekNumber}, {report.year}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: `${report.project.color}15`,
                            color: report.project.color
                          }}
                        >
                          {report.project.name}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                        {report.tasks?.length || 0} tasks logged
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={report.status} isLate={report.isLate} size="sm" />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => openVersions(report.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded-md transition"
                        >
                          <History className="w-3 h-3" />
                          {report._count?.versions || 1} version(s)
                        </button>
                      </td>

                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                        {latestComment ? (
                          <div className="truncate text-[11px]" title={latestComment.comment}>
                            <span className="font-semibold text-slate-800">
                              {latestComment.action === 'APPROVE' ? 'Approved:' : 'Changes Req:'}
                            </span>{' '}
                            "{latestComment.comment}"
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No feedback yet</span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => navigate(`/report/${report.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>

                        {isEditable && (
                          <button
                            onClick={() => navigate(`/report/edit/${report.id}`)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                          >
                            <FileEdit className="w-3 h-3" /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total reports)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchReports(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchReports(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        isOpen={versionDrawerOpen}
        onClose={() => setVersionDrawerOpen(false)}
        versions={selectedReportVersions}
      />
    </div>
  );
};

export default ReportHistoryPage;
