import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Briefcase,
  User,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Building2,
  Lock
} from 'lucide-react';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Invite user form
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState('TEAM_MEMBER');
  const [department, setDepartment] = useState('Engineering');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers();
      setUsers(res.data.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setError(null);
    setSuccess(null);
    try {
      await userApi.updateUser(userId, { role: newRole });
      setSuccess(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await userApi.createUser({ name, email, password, role, department });
      setSuccess(`User ${name} created successfully.`);
      setShowInviteModal(false);
      setName('');
      setEmail('');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, uName) => {
    if (!window.confirm(`Are you sure you want to delete user ${uName}?`)) return;
    setError(null);
    try {
      await userApi.deleteUser(userId);
      setSuccess(`User ${uName} removed.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            User & Role Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin console: Manage user accounts, role-based authorization, and team permissions.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm shadow-purple-500/20 transition"
        >
          <UserPlus className="w-4 h-4" /> Invite / Add Member
        </button>
      </div>

      {/* Alerts */}
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

      {/* Add User Modal / Box */}
      {showInviteModal && (
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Add New Team Member / Assign Role</h3>
            <button
              onClick={() => setShowInviteModal(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="TEAM_MEMBER">Team Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-xs"
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Member Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role Assignment</th>
                <th className="px-4 py-3">Reports Logged</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          {isSelf && (
                            <span className="text-[10px] text-purple-600 font-bold">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{u.email}</td>

                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{u.department}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        disabled={isSelf}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border focus:ring-1 focus:ring-purple-500 focus:outline-none ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : u.role === 'MANAGER'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <option value="TEAM_MEMBER">TEAM_MEMBER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">
                      {u._count?.reports || 0} reports
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
