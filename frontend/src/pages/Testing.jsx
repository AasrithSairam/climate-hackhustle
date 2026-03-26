import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Calendar, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.4 } }
};

export default function Testing() {
  const [date, setDate] = useState('2024-01-01');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/test_forecast?start_date=${date}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred fetching the simulation data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          Model Simulator
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          Travel back in time. Pick any historical date, and watch our Random Forest Engine simulate what it would have forecasted for the next 7 days without peeking at the future.
        </p>
      </header>

      <div className="bg-slate-800/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-slate-400">Target Date (YYYY-MM-DD)</label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
              />
            </div>
            <button 
              onClick={handleTest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run Engine"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        
        <div className="h-24 w-px bg-white/10 hidden md:block"></div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/5 w-full md:w-auto">
          {result ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <p className="text-sm font-medium text-slate-400 mb-1">Engine Accuracy Score</p>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-baseline justify-center gap-1">
                {result.accuracy_score}<span className="text-2xl">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Mean Abs. Error: {result.mae} mm</p>
            </motion.div>
          ) : (
            <div className="text-center text-slate-500 flex flex-col items-center gap-2">
              <Target className="w-8 h-8 opacity-50" />
              <p className="text-sm">Awaiting simulation run</p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.7 }}
          className="bg-slate-800/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 pb-8 md:p-10 shadow-2xl h-[500px]"
        >
          <h2 className="text-2xl font-semibold mb-8 text-white/90">7-Day Actual vs. Simulation</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={result.graph} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}mm`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
              <Line type="monotone" name="Actual Intelligence" dataKey="actual" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 8 }} />
              <Line type="monotone" name="Model Prediction" dataKey="predicted" stroke="#10b981" strokeWidth={4} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}
