import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { Columns, Calendar, Flame, Star, ListOrdered, ArrowLeft, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const SectionComparatorPage = () => {
  const navigate = useNavigate();
  const [weekNumber, setWeekNumber] = useState(36);
  const [year, setYear] = useState(2026);
  const [section, setSection] = useState('blockers'); // 'blockers', 'achievements', 'planned'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComparator = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getSectionComparator({ weekNumber, year, section });
      setData(res.data.data.comparatorData);
    } catch (err) {
      console.error('Failed to load comparator data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparator();
  }, [weekNumber, year, section]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
          </button>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Columns className="w-6 h-6 text-indigo-600" />
            Side-by-Side Section Comparator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare a single section across all team members side by side for Week {weekNumber}.
          </p>
        </div>

        {/* Week Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Week:</span>
          <select
            value={weekNumber}
            onChange={(e) => setWeekNumber(parseInt(e.target.value, 10))}
            className="text-xs font-semibold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
          >
            {[36, 35, 34, 33].map((w) => (
              <option key={w} value={w}>
                Week {w}, {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setSection('blockers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            section === 'blockers'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          Blockers & Challenges
        </button>

        <button
          onClick={() => setSection('achievements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            section === 'achievements'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          Key Achievements & Highlights
        </button>

        <button
          onClick={() => setSection('planned')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            section === 'planned'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Tasks Planned for Next Week
        </button>
      </div>

      {/* Grid of Team Members */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading comparator cards...</div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">
          No reports found for this week.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div
              key={item.reportId}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.user.name}</h3>
                    <p className="text-[11px] text-slate-400">{item.user.department}</p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ backgroundColor: `${item.project.color}15`, color: item.project.color }}
                  >
                    {item.project.code}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {item.items.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">None logged for this section</p>
                  ) : (
                    item.items.map((entry, idx) => {
                      const text = typeof entry === 'string' ? entry : entry.text;
                      const isKey = typeof entry === 'object' && entry.isKey;

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl text-xs border ${
                            isKey
                              ? section === 'blockers'
                                ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                              : 'bg-slate-50 border-slate-100 text-slate-700'
                          }`}
                        >
                          {isKey && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase mr-1 bg-black/10">
                              {section === 'blockers' ? 'Key Issue' : 'Key Win'}
                            </span>
                          )}
                          {text}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <StatusBadge status={item.status} size="sm" />
                <button
                  onClick={() => navigate(`/report/${item.reportId}`)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View Full Report →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionComparatorPage;
