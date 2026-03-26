import React from 'react';

export default function HistoryTable({ records }) {
  if (!records || records.length === 0) return null;

  return (
    <div className="flex-1 overflow-auto pr-2 custom-scrollbar mt-4">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
          <tr>
            <th className="pb-3 text-slate-400 font-medium">Date</th>
            <th className="pb-3 text-slate-400 font-medium">Rainfall (mm)</th>
            <th className="pb-3 text-slate-400 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {records.map((record, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors group">
              <td className="py-3 text-slate-300 group-hover:text-white transition-colors">{record.Date}</td>
              <td className="py-3 font-mono text-blue-300">{record.Rainfall_mm_day.toFixed(2)}</td>
              <td className="py-3 text-right">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                  FLOOD
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
