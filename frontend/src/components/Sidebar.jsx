import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  History,
  LayoutDashboard,
  BarChart3,
  Columns,
  FolderGit2,
  Users,
  CheckSquare,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Personal Reporting Section */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Personal Workspace
          </div>
          <nav className="space-y-1">
            <NavLink to="/report/current" className={linkClass}>
              <FileText className="w-4 h-4" />
              Weekly Report
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              <History className="w-4 h-4" />
              Report History
            </NavLink>
          </nav>
        </div>

        {/* Manager Workspace (Manager & Admin) */}
        {isManager && (
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2">
              Manager & Team View
            </div>
            <nav className="space-y-1">
              <NavLink to="/" className={linkClass} end>
                <LayoutDashboard className="w-4 h-4" />
                Team Dashboard
              </NavLink>
              <NavLink to="/insights" className={linkClass}>
                <BarChart3 className="w-4 h-4" />
                Visual Insights
              </NavLink>
              <NavLink to="/comparator" className={linkClass}>
                <Columns className="w-4 h-4" />
                Section Matrix
              </NavLink>
              <NavLink to="/reviews" className={linkClass}>
                <CheckSquare className="w-4 h-4" />
                Review Reports
              </NavLink>
              <NavLink to="/projects" className={linkClass}>
                <FolderGit2 className="w-4 h-4" />
                Projects & Categories
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Workspace */}
        {isAdmin && (
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-2">
              Administration
            </div>
            <nav className="space-y-1">
              <NavLink to="/users" className={linkClass}>
                <Users className="w-4 h-4" />
                User Management
              </NavLink>
            </nav>
          </div>
        )}

        {/* AI Assistant Section */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Intelligence
          </div>
          <nav className="space-y-1">
            <NavLink to="/assistant" className={linkClass}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Team Assistant
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Role info footer card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
        <div className="font-semibold text-slate-700">Role: {user?.role}</div>
        <div className="text-[11px] text-slate-400 truncate">{user?.department}</div>
      </div>
    </aside>
  );
};

export default Sidebar;
