import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Hero({ todayData }) {
  const isHighRisk = todayData.risk_level === "HIGH";
  const isModerateRisk = todayData.risk_level === "MODERATE";

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl p-8 lg:p-12 transition-all duration-700 ease-in-out border",
      isHighRisk ? "bg-red-500/10 border-red-500/30" : 
      isModerateRisk ? "bg-orange-500/10 border-orange-500/30" : 
      "bg-teal-500/10 border-teal-500/30"
    )}>
      <div className={cn(
        "absolute inset-0 blur-[100px] opacity-30 pointer-events-none rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full",
        isHighRisk ? "bg-red-600" : isModerateRisk ? "bg-orange-600" : "bg-teal-600"
      )} />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-xl font-medium text-slate-300">Today's Forecast</h2>
          <div className="text-5xl lg:text-7xl font-bold tracking-tighter">
            {todayData.rainfall_mm} <span className="text-3xl text-slate-400">mm</span>
          </div>
          <p className="text-lg text-slate-400">
            Flood Probability: <span className="font-semibold text-white">{todayData.flood_probability}%</span>
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-8 rounded-full aspect-square border-4 bg-slate-900/50 backdrop-blur-md"
             style={{ borderColor: isHighRisk ? "#ef4444" : isModerateRisk ? "#f97316" : "#14b8a6" }}>
          {isHighRisk ? (
            <ShieldAlert className="w-16 h-16 text-red-500 mb-2" />
          ) : isModerateRisk ? (
            <AlertTriangle className="w-16 h-16 text-orange-500 mb-2" />
          ) : (
            <ShieldCheck className="w-16 h-16 text-teal-500 mb-2" />
          )}
          <span className={cn(
            "text-2xl font-black tracking-widest uppercase",
            isHighRisk ? "text-red-500" : isModerateRisk ? "text-orange-500" : "text-teal-500"
          )}>
            {todayData.risk_level}
          </span>
        </div>
      </div>
    </div>
  );
}
