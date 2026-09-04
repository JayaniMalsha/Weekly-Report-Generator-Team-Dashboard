import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  ShieldCheck, 
  Briefcase, 
  User as UserIcon, 
  ChevronDown, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, quickSwitchUser } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = async (email) => {
    setSwitching(true);
    setSwitchOpen(false);
    try {
      await quickSwitchUser(email);
      navigate('/');
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Briefcase className="w-3 h-3" /> Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserIcon className="w-3 h-3" /> Team Member
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                TS
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  TeamSync
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-200">
                    Pro
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block">Weekly Reports & Team Dashboard</p>
              </div>
            </Link>
          </div>

          {/* User & Role Switcher Actions */}
          <div className="flex items-center gap-3">
            {/* API Docs link */}
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Open OpenAPI/Swagger Interactive Documentation"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              API Docs
            </a>

            {/* Quick Role Switcher for seamless evaluation */}
            <div className="relative">
              <button
                onClick={() => setSwitchOpen(!switchOpen)}
                disabled={switching}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition shadow-xs"
                title="Switch persona to test roles"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${switching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Switch Role:</span>
                <span className="font-bold">{user?.role}</span>
                <ChevronDown className="w-3 h-3 ml-0.5 text-indigo-500" />
              </button>

              {switchOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Test Account (One-Click)
                  </div>
                  <button
                    onClick={() => handleSwitch('admin@example.com')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Victoria Vance</div>
                      <div className="text-slate-500 text-[10px]">admin@example.com</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">ADMIN</span>
                  </button>
                  <button
                    onClick={() => handleSwitch('manager@example.com')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between border-t border-slate-50"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">David Miller</div>
                      <div className="text-slate-500 text-[10px]">manager@example.com</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">MANAGER</span>
                  </button>
                  <button
                    onClick={() => handleSwitch('alex@example.com')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between border-t border-slate-50"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Alex Rivera</div>
                      <div className="text-slate-500 text-[10px]">alex@example.com</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">MEMBER</span>
                  </button>
                  <button
                    onClick={() => handleSwitch('marcus@example.com')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between border-t border-slate-50"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Marcus Johnson</div>
                      <div className="text-slate-500 text-[10px]">marcus@example.com (Needs Correction)</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">MEMBER</span>
                  </button>
                </div>
              )}
            </div>

            {/* Current user & logout */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</div>
                <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
