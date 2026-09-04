import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { reportApi, projectApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Save,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  HelpCircle,
  FileCheck,
  Star,
  Flame,
  Link as LinkIcon,
  ChevronLeft
} from 'lucide-react';

const PersonalReportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: routeReportId } = useParams();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [reportId, setReportId] = useState(routeReportId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form State (STRICT & FIXED SCHEMA IN EXACT REQUIRED ORDER)
  // 1. Week & Date range
  const [weekNumber, setWeekNumber] = useState(36);
  const [year, setYear] = useState(2026);
  // 2. Project or category tag
  const [projectId, setProjectId] = useState('');
  // 3. Tasks Completed table
  const [tasks, setTasks] = useState([
    {
      name: '',
      priority: 'Medium',
      plannedPercent: 100,
      actualPercent: 100,
      status: 'Completed',
      timePlannedHours: 0,
      timeSpentHours: 0,
      outputDeliverable: ''
    }
  ]);
  // 4. Tasks planned for next week
  const [tasksPlannedNextWeek, setTasksPlannedNextWeek] = useState(['']);
  // 5. Blockers / challenges
  const [blockers, setBlockers] = useState([{ id: 'b1', text: '', isKey: false }]);
  // 6. Achievements / highlights
  const [achievements, setAchievements] = useState([{ id: 'a1', text: '', isKey: false }]);
  // 7. Hours worked broken down by task type
  const [hoursBreakdown, setHoursBreakdown] = useState({
    development: 0,
    testing: 0,
    meetings: 0,
    documentation: 0,
    devops: 0,
    other: 0
  });
  // 8. Optional notes or links
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState('');

  // Report status & reviewer comments
  const [currentStatus, setCurrentStatus] = useState('Draft');
  const [isLate, setIsLate] = useState(false);
  const [latestReviewComment, setLatestReviewComment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch projects
        const projRes = await projectApi.getProjects();
        setProjects(projRes.data.data);
        if (projRes.data.data.length > 0 && !projectId) {
          setProjectId(projRes.data.data[0].id);
        }

        // If editing specific report ID or checking current week
        const targetId = routeReportId || searchParams.get('id');
        if (targetId) {
          const repRes = await reportApi.getReportById(targetId);
          loadReportIntoState(repRes.data.data);
        } else {
          // Check if user has an existing report for this week
          const myReportsRes = await reportApi.getReports({ weekNumber: 36, year: 2026 });
          if (myReportsRes.data.data.length > 0) {
            loadReportIntoState(myReportsRes.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Error initializing report page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [routeReportId]);

  const loadReportIntoState = (rep) => {
    setReportId(rep.id);
    setWeekNumber(rep.weekNumber);
    setYear(rep.year);
    setProjectId(rep.projectId);
    setCurrentStatus(rep.status);
    setIsLate(rep.isLate);
    setNotes(rep.notes || '');
    setLinks(rep.links || '');

    if (rep.tasks && rep.tasks.length > 0) {
      setTasks(rep.tasks);
    }

    try {
      const planned = JSON.parse(rep.tasksPlannedNextWeek || '[]');
      if (planned.length > 0) setTasksPlannedNextWeek(planned);
    } catch (e) {}

    try {
      const bl = JSON.parse(rep.blockers || '[]');
      if (bl.length > 0) setBlockers(bl);
    } catch (e) {}

    try {
      const ach = JSON.parse(rep.achievements || '[]');
      if (ach.length > 0) setAchievements(ach);
    } catch (e) {}

    try {
      const hb = JSON.parse(rep.hoursBreakdown || '{}');
      setHoursBreakdown({
        development: hb.development || 0,
        testing: hb.testing || 0,
        meetings: hb.meetings || 0,
        documentation: hb.documentation || 0,
        devops: hb.devops || 0,
        other: hb.other || 0
      });
    } catch (e) {}

    if (rep.reviewComments && rep.reviewComments.length > 0) {
      setLatestReviewComment(rep.reviewComments[0]);
    }
  };

  // Task list management
  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const addTaskRow = () => {
    setTasks([
      ...tasks,
      {
        name: '',
        priority: 'Medium',
        plannedPercent: 100,
        actualPercent: 0,
        status: 'In Progress',
        timePlannedHours: 0,
        timeSpentHours: 0,
        outputDeliverable: ''
      }
    ]);
  };

  const removeTaskRow = (index) => {
    if (tasks.length === 1) return;
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Blockers management
  const handleBlockerChange = (index, field, value) => {
    const updated = [...blockers];
    if (field === 'isKey') {
      // Toggle key issue: only one can be key issue
      updated.forEach((b, i) => {
        b.isKey = i === index ? value : false;
      });
    } else {
      updated[index][field] = value;
    }
    setBlockers(updated);
  };

  const addBlocker = () => {
    setBlockers([...blockers, { id: `b_${Date.now()}`, text: '', isKey: false }]);
  };

  const removeBlocker = (index) => {
    if (blockers.length === 1) return;
    setBlockers(blockers.filter((_, i) => i !== index));
  };

  // Achievements management
  const handleAchievementChange = (index, field, value) => {
    const updated = [...achievements];
    if (field === 'isKey') {
      // Only one can be key achievement
      updated.forEach((a, i) => {
        a.isKey = i === index ? value : false;
      });
    } else {
      updated[index][field] = value;
    }
    setAchievements(updated);
  };

  const addAchievement = () => {
    setAchievements([...achievements, { id: `a_${Date.now()}`, text: '', isKey: false }]);
  };

  const removeAchievement = (index) => {
    if (achievements.length === 1) return;
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  // Planned tasks management
  const handlePlannedTaskChange = (index, value) => {
    const updated = [...tasksPlannedNextWeek];
    updated[index] = value;
    setTasksPlannedNextWeek(updated);
  };

  const addPlannedTask = () => setTasksPlannedNextWeek([...tasksPlannedNextWeek, '']);
  const removePlannedTask = (index) => {
    if (tasksPlannedNextWeek.length === 1) return;
    setTasksPlannedNextWeek(tasksPlannedNextWeek.filter((_, i) => i !== index));
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const payload = {
        id: reportId,
        projectId,
        weekNumber,
        year,
        tasks: tasks.filter((t) => t.name.trim() !== ''),
        tasksPlannedNextWeek: tasksPlannedNextWeek.filter((t) => t.trim() !== ''),
        blockers: blockers.filter((b) => b.text.trim() !== ''),
        achievements: achievements.filter((a) => a.text.trim() !== ''),
        hoursBreakdown,
        notes,
        links
      };

      const res = await reportApi.saveDraft(payload);
      setReportId(res.data.data.id);
      setCurrentStatus(res.data.data.status);
      setMessage('Draft saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Handler
  const handleSubmitReport = async () => {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      // 1. Ensure draft is saved first
      const payload = {
        id: reportId,
        projectId,
        weekNumber,
        year,
        tasks: tasks.filter((t) => t.name.trim() !== ''),
        tasksPlannedNextWeek: tasksPlannedNextWeek.filter((t) => t.trim() !== ''),
        blockers: blockers.filter((b) => b.text.trim() !== ''),
        achievements: achievements.filter((a) => a.text.trim() !== ''),
        hoursBreakdown,
        notes,
        links
      };

      const saveRes = await reportApi.saveDraft(payload);
      const activeId = saveRes.data.data.id;
      setReportId(activeId);

      // 2. Submit for review
      const subRes = await reportApi.submitReport(activeId);
      setCurrentStatus(subRes.data.data.status);
      setIsLate(subRes.data.data.isLate);
      setMessage('Report submitted successfully! Manager has been notified for review.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = currentStatus === 'Draft' || currentStatus === 'Needs Correction';

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center min-h-[400px]">
        Loading weekly report workspace...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Weekly Work Report
            </h1>
            <StatusBadge status={currentStatus} isLate={isLate} />
          </div>
          <p className="text-xs text-slate-500">
            Fixed standard structure ensuring comparability across the team.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {reportId && (
            <button
              type="button"
              onClick={() => navigate(`/report/${reportId}`)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              View Read-Only Mode
            </button>
          )}

          {isEditable && (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || submitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-60 transition shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting || saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60 transition shadow-sm shadow-blue-500/30"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : currentStatus === 'Needs Correction' ? 'Resubmit for Review' : 'Submit Report'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {/* Prominent Banner when status is 'Needs Correction' */}
      {currentStatus === 'Needs Correction' && latestReviewComment && (
        <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            Manager Requested Changes Before Approval
          </div>
          <p className="text-xs text-amber-800 pl-7 leading-relaxed font-medium">
            "{latestReviewComment.comment}"
          </p>
          <div className="text-[11px] text-amber-700 pl-7">
            Reviewed by {latestReviewComment.author?.name || 'Manager'} • Please make the requested updates below and click <strong>Resubmit for Review</strong>.
          </div>
        </div>
      )}

      {/* Read-Only Notice when Submitted or Approved */}
      {!isEditable && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          This report is currently in <strong>{currentStatus}</strong> status and cannot be modified. If changes are requested by your manager, it will become editable again.
        </div>
      )}

      {/* STRICT REPORT FORM (ALL REQUIRED FIELDS IN EXACT ORDER) */}
      <div className="space-y-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* 1. Week & Date Range + 2. Project Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Reporting Week
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                disabled={!isEditable}
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value, 10))}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Year
            </label>
            <input
              type="number"
              disabled={!isEditable}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Project / Category Tag *
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                disabled={!isEditable}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white disabled:bg-slate-50"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Tasks Completed - Task-Level Table */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Tasks Completed (Task-Level Breakdown)
              </h2>
              <p className="text-[11px] text-slate-500">
                Track task name, priority, planned % vs actual %, status, time planned vs spent, and outputs.
              </p>
            </div>
            {isEditable && (
              <button
                type="button"
                onClick={addTaskRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            )}
          </div>

          {/* Responsive Task Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-3 py-2.5">Task Name</th>
                  <th className="px-2 py-2.5 w-24">Priority</th>
                  <th className="px-2 py-2.5 w-24">Plan / Act %</th>
                  <th className="px-2 py-2.5 w-28">Status</th>
                  <th className="px-2 py-2.5 w-28">Time (Plan/Spent)</th>
                  <th className="px-3 py-2.5">Output / Deliverable Produced</th>
                  {isEditable && <th className="px-2 py-2.5 w-10"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        disabled={!isEditable}
                        placeholder="Task title..."
                        value={task.name}
                        onChange={(e) => handleTaskChange(idx, 'name', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        disabled={!isEditable}
                        value={task.priority}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                        className="w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-50"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          disabled={!isEditable}
                          placeholder="Plan"
                          value={task.plannedPercent}
                          onChange={(e) => handleTaskChange(idx, 'plannedPercent', e.target.value)}
                          className="w-11 text-xs px-1 py-1.5 border border-slate-300 rounded-lg text-center disabled:bg-slate-50"
                          title="Planned %"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          disabled={!isEditable}
                          placeholder="Act"
                          value={task.actualPercent}
                          onChange={(e) => handleTaskChange(idx, 'actualPercent', e.target.value)}
                          className="w-11 text-xs px-1 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-blue-700 disabled:bg-slate-50"
                          title="Actual %"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        disabled={!isEditable}
                        value={task.status}
                        onChange={(e) => handleTaskChange(idx, 'status', e.target.value)}
                        className="w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-50"
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Delayed">Delayed</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          disabled={!isEditable}
                          placeholder="Plan hrs"
                          value={task.timePlannedHours}
                          onChange={(e) => handleTaskChange(idx, 'timePlannedHours', e.target.value)}
                          className="w-12 text-xs px-1 py-1.5 border border-slate-300 rounded-lg text-center disabled:bg-slate-50"
                          title="Planned hours"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          step="0.5"
                          disabled={!isEditable}
                          placeholder="Spent hrs"
                          value={task.timeSpentHours}
                          onChange={(e) => handleTaskChange(idx, 'timeSpentHours', e.target.value)}
                          className="w-12 text-xs px-1 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-800 disabled:bg-slate-50"
                          title="Spent hours"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        disabled={!isEditable}
                        placeholder="Artifact, PR link, report document..."
                        value={task.outputDeliverable || ''}
                        onChange={(e) => handleTaskChange(idx, 'outputDeliverable', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
                      />
                    </td>
                    {isEditable && (
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeTaskRow(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Tasks Planned For Next Week */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Tasks Planned for Next Week
            </h2>
            {isEditable && (
              <button
                type="button"
                onClick={addPlannedTask}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition"
              >
                <Plus className="w-3 h-3" /> Add Planned Task
              </button>
            )}
          </div>
          <div className="space-y-2">
            {tasksPlannedNextWeek.map((planned, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-bold text-slate-400">{idx + 1}.</span>
                <input
                  type="text"
                  disabled={!isEditable}
                  placeholder="Planned deliverable or milestone for next iteration..."
                  value={planned}
                  onChange={(e) => handlePlannedTaskChange(idx, e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
                />
                {isEditable && tasksPlannedNextWeek.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlannedTask(idx)}
                    className="text-slate-400 hover:text-red-500 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Blockers / Challenges (with Key Issue flag) */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                5. Blockers / Challenges
                <span className="text-[10px] lowercase font-normal text-slate-400">(Flag one as Key Issue)</span>
              </h2>
            </div>
            {isEditable && (
              <button
                type="button"
                onClick={addBlocker}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 transition"
              >
                <Plus className="w-3 h-3" /> Add Blocker
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {blockers.map((b, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center gap-3 transition ${
                  b.isKey ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => handleBlockerChange(idx, 'isKey', !b.isKey)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                    b.isKey
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Flag as Key Blocker of the Week"
                >
                  <Flame className="w-3.5 h-3.5" />
                  {b.isKey ? 'Key Blocker' : 'Mark as Key'}
                </button>

                <input
                  type="text"
                  disabled={!isEditable}
                  placeholder="Describe technical impediment, external dependency, or obstacle..."
                  value={b.text}
                  onChange={(e) => handleBlockerChange(idx, 'text', e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
                />

                {isEditable && blockers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBlocker(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 6. Achievements / Highlights (with Key Achievement flag) */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                6. Achievements / Highlights
                <span className="text-[10px] lowercase font-normal text-slate-400">(Flag one as Key Achievement)</span>
              </h2>
            </div>
            {isEditable && (
              <button
                type="button"
                onClick={addAchievement}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 transition"
              >
                <Plus className="w-3 h-3" /> Add Highlight
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {achievements.map((a, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center gap-3 transition ${
                  a.isKey ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => handleAchievementChange(idx, 'isKey', !a.isKey)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                    a.isKey
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Flag as Key Achievement of the Week"
                >
                  <Star className="w-3.5 h-3.5" />
                  {a.isKey ? 'Key Highlight' : 'Mark as Key'}
                </button>

                <input
                  type="text"
                  disabled={!isEditable}
                  placeholder="Key win, feature release, performance improvement..."
                  value={a.text}
                  onChange={(e) => handleAchievementChange(idx, 'text', e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
                />

                {isEditable && achievements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 7. Hours Worked Breakdown by Task Type */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            7. Hours Worked Breakdown by Task Type (Optional)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {['development', 'testing', 'meetings', 'documentation', 'devops', 'other'].map((type) => (
              <div key={type} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <label className="block text-[11px] font-semibold text-slate-600 capitalize mb-1">
                  {type}
                </label>
                <input
                  type="number"
                  step="0.5"
                  disabled={!isEditable}
                  value={hoursBreakdown[type] || 0}
                  onChange={(e) =>
                    setHoursBreakdown({
                      ...hoursBreakdown,
                      [type]: parseFloat(e.target.value || 0)
                    })
                  }
                  className="w-full text-center text-xs font-bold py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">hrs</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Optional Notes or Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              8. General Notes & Context
            </label>
            <textarea
              rows={3}
              disabled={!isEditable}
              placeholder="Any additional remarks, sprint takeaways, or notes for the reviewer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" /> Links & Artifacts
            </label>
            <textarea
              rows={3}
              disabled={!isEditable}
              placeholder="PR URLs, Figma design boards, Jira ticket links..."
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalReportPage;
