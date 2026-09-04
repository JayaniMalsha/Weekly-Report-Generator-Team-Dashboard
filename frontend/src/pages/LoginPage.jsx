import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Briefcase, User as UserIcon, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, quickSwitchUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async (demoEmail) => {
    setError('');
    setSubmitting(true);
    try {
      await quickSwitchUser(demoEmail);
      navigate('/');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
            TS
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to TeamSync
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Weekly Report Generator & Role-Based Team Dashboard
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-60"
            >
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Evaluators */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              One-Click Instant Evaluation Logins
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('admin@example.com')}
                className="flex items-center gap-2 p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-purple-900">Admin Role</div>
                  <div className="text-[10px] text-purple-700 truncate">Victoria Vance</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('manager@example.com')}
                className="flex items-center gap-2 p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition"
              >
                <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-indigo-900">Manager Role</div>
                  <div className="text-[10px] text-indigo-700 truncate">David Miller</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('alex@example.com')}
                className="flex items-center gap-2 p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition"
              >
                <UserIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-blue-900">Team Member</div>
                  <div className="text-[10px] text-blue-700 truncate">Alex Rivera</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('marcus@example.com')}
                className="flex items-center gap-2 p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition"
              >
                <UserIcon className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-amber-900">Needs Correction</div>
                  <div className="text-[10px] text-amber-700 truncate">Marcus Johnson</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
