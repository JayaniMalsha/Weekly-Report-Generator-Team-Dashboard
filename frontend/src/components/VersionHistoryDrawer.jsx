import React, { useState } from 'react';
import { History, ChevronRight, MessageSquare, Clock, Calendar, CheckCircle2, AlertTriangle, Eye, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

const VersionHistoryDrawer = ({ versions = [], isOpen, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);

  if (!isOpen) return null;

  const parsedSnapshot = selectedVersion?.snapshot ? JSON.parse(selectedVersion.snapshot) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Report Version History</h3>
              <p className="text-xs text-slate-500">
                Immutable snapshots across submission & correction cycles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selected Version Snapshot Viewer (if active) */}
          {selectedVersion ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    Snapshot for Version {selectedVersion.versionNumber}
                  </span>
                  <StatusBadge status={selectedVersion.statusAtSnapshot} size="sm" />
                </div>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  ← Back to version list
                </button>
              </div>

              {parsedSnapshot && (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-600">Submitted at:</span>{' '}
                    {new Date(selectedVersion.submittedAt).toLocaleString()}
                  </div>

                  {/* Tasks in snapshot */}
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Tasks Logged in this Version:</span>
                    <div className="space-y-1.5">
                      {Array.isArray(parsedSnapshot.tasks) && parsedSnapshot.tasks.map((t, idx) => (
                        <div key={idx} className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-medium text-slate-800">{typeof t === 'string' ? t : t.name}</span>
                            {t.outputDeliverable && (
                              <p className="text-[11px] text-slate-500 italic">{t.outputDeliverable}</p>
                            )}
                          </div>
                          {typeof t === 'object' && (
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                              {t.actualPercent}% done • {t.timeSpentHours} hrs
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blockers in snapshot */}
                  {parsedSnapshot.blockers && parsedSnapshot.blockers.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-1">Blockers:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {parsedSnapshot.blockers.map((b, i) => (
                          <li key={i}>
                            {typeof b === 'string' ? b : b.text}
                            {b.isKey && <span className="ml-1 text-red-600 font-semibold">(Key Issue)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Review comment associated with this version */}
                  {selectedVersion.reviewComment && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Manager Review Comment Against This Version:
                      </div>
                      <p className="text-amber-900 text-xs italic">
                        "{selectedVersion.reviewComment.comment}"
                      </p>
                      <div className="text-[10px] text-amber-700 mt-1">
                        By {selectedVersion.reviewComment.author?.name || 'Manager'} •{' '}
                        {new Date(selectedVersion.reviewComment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Timeline List */
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {versions.map((ver, index) => {
                const isLatest = index === 0;
                return (
                  <div key={ver.id} className="relative pl-6">
                    {/* Circle marker */}
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                        isLatest ? 'border-blue-600 ring-4 ring-blue-100' : 'border-slate-400'
                      }`}
                    />

                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Version {ver.versionNumber}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                              Current / Latest
                            </span>
                          )}
                          <StatusBadge status={ver.statusAtSnapshot} size="sm" />
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ver.submittedAt).toLocaleDateString()} {new Date(ver.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mb-3">
                        Submitted by <span className="font-medium text-slate-800">{ver.submittedBy?.name}</span>
                      </div>

                      {/* Associated Review Comment if any */}
                      {ver.reviewComment ? (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs mb-3">
                          <div className="flex items-center gap-1 text-amber-900 font-semibold mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                            Review Comment on this version ({ver.reviewComment.action}):
                          </div>
                          <p className="text-amber-800 italic pl-4 border-l-2 border-amber-300">
                            "{ver.reviewComment.comment}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic mb-2">No review comment linked to this version yet.</p>
                      )}

                      <button
                        onClick={() => setSelectedVersion(ver)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Version Content Snapshot
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryDrawer;
