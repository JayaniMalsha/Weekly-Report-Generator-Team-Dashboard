import React, { useState } from 'react';
import { aiApi } from '../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  Calendar,
  AlertTriangle,
  Award,
  BarChart2,
  CheckCircle2,
  FileText
} from 'lucide-react';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Welcome to the AI Team Intelligence Workspace! I am grounded in your database of weekly reports, tasks, and blockers. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Summary generation state
  const [summaryWeek, setSummaryWeek] = useState(36);
  const [teamSummary, setTeamSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleSend = async (queryToSend) => {
    const text = queryToSend || input;
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(text);
      setMessages((prev) => [...prev, { sender: 'assistant', text: res.data.data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Error querying team records. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await aiApi.getSummary({ weekNumber: summaryWeek, year: 2026 });
      setTeamSummary(res.data.data);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const promptSuggestions = [
    'What are the critical blockers across all projects?',
    'Summarize Alex Rivera’s achievements',
    'What did Sarah Chen work on in AI R&D?',
    'Identify any workload imbalances across the team'
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          AI Team Intelligence Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Context-grounded assistant with retrieval over team reports, task outputs, and recurring blockers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Conversational Chat */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[600px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-bl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl w-fit text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Querying stored reports & synthesizing answer...
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
            {promptSuggestions.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-full text-xs transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about team reports, blockers, or workload..."
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 transition flex items-center gap-1 text-xs"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>

        {/* Right Column: AI Executive Team Summary Generator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Generate Team Summary
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Target Week</label>
              <select
                value={summaryWeek}
                onChange={(e) => setSummaryWeek(parseInt(e.target.value, 10))}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
              >
                <option value={36}>Week 36 (Current)</option>
                <option value={35}>Week 35 (Previous)</option>
                <option value={34}>Week 34</option>
              </select>
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {generatingSummary ? 'Analyzing Reports...' : 'Generate Executive Summary'}
            </button>
          </div>

          {/* Render Summary if generated */}
          {teamSummary && (
            <div className="flex-1 overflow-y-auto space-y-3.5 pt-2 text-xs border-t border-slate-100">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">Executive Overview:</span>
                <p className="text-slate-600 leading-relaxed">{teamSummary.overview}</p>
              </div>

              {/* Workload Analysis */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 block mb-1">Workload Distribution:</span>
                <p className="text-amber-800">{teamSummary.workloadAnalysis}</p>
              </div>

              {/* Key Blockers */}
              {teamSummary.keyBlockers && teamSummary.keyBlockers.length > 0 && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                  <span className="font-bold text-rose-900 block mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Escalated Blockers:
                  </span>
                  <ul className="list-disc pl-4 text-rose-800 space-y-1">
                    {teamSummary.keyBlockers.map((b, i) => (
                      <li key={i}>
                        <strong>{b.member}</strong> ({b.project}): {b.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIAssistantPage;
