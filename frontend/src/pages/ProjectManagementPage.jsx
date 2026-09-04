import React, { useState, useEffect } from 'react';
import { projectApi } from '../services/api';
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  Users
} from 'lucide-react';

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State for Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [status, setStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectApi.getProjects();
      setProjects(res.data.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setDescription('');
    setColor('#3b82f6');
    setStatus('Active');
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEditForm = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setCode(p.code);
    setDescription(p.description || '');
    setColor(p.color || '#3b82f6');
    setStatus(p.status || 'Active');
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await projectApi.updateProject(editingId, { name, code, description, color, status });
        setSuccess('Project updated successfully.');
      } else {
        await projectApi.createProject({ name, code, description, color, status });
        setSuccess('Project created successfully.');
      }
      setIsFormOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, pName) => {
    if (!window.confirm(`Are you sure you want to delete project '${pName}'?`)) return;
    setError(null);
    try {
      await projectApi.deleteProject(id);
      setSuccess(`Project '${pName}' deleted.`);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-blue-600" />
            Projects & Work Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage project tags attached to team weekly reports and deliverables.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> {error}
        </div>
      )}

      {/* CRUD Form (inline dedicated workspace) */}
      {isFormOpen && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingId ? 'Edit Project / Category' : 'Create New Project / Category'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Client A - Fintech Portal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unique Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CLIENT-A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-level objectives and domain scope..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Color Identifier</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 p-0.5 border border-slate-300 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-slate-600">{color}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs"
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Project Name & Code</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reports Linked</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <div>
                        <div>{p.name}</div>
                        <span className="text-[10px] font-mono text-slate-400">{p.code}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600 max-w-sm truncate">
                    {p.description || <span className="text-slate-400 italic">No description</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      p.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    <span className="font-bold">{p._count?.reports || 0}</span> report(s)
                  </td>

                  <td className="px-5 py-3 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => openEditForm(p)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default ProjectManagementPage;
