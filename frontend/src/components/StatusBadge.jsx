import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, FileEdit, XCircle } from 'lucide-react';

const StatusBadge = ({ status, isLate = false, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const configs = {
    'Draft': {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <FileEdit className="w-3.5 h-3.5 mr-1 text-slate-500" />
    },
    'Submitted': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-blue-600 animate-pulse" />
    },
    'Needs Correction': {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
    },
    'Approved': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
    },
    'Not Yet Started': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
    }
  };

  const config = configs[status] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: null
  };

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}>
        {config.icon}
        {status}
      </span>
      {isLate && (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700">
          <AlertCircle className="w-3 h-3 mr-0.5" />
          Late
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
