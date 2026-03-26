import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Droplets } from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ForecastCarousel({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {forecast.map((day, idx) => {
        const isHigh = day.risk_level === "HIGH";
        const isMod = day.risk_level === "MODERATE";
        const dateObj = new Date(day.date);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: 'short' });
        const monthDay = dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });

        return (
          <div key={idx} 
               className="group flex flex-col justify-between h-48 bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 transition-all duration-300 transform hover:-translate-y-2">
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-white">{dayName}</p>
                <p className="text-xs text-slate-400">{monthDay}</p>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isHigh ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : 
                isMod ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" : 
                "bg-teal-500"
              )}/>
            </div>

            <div className="flex flex-col items-center justify-center my-4">
              <Droplets className="w-8 h-8 text-blue-400/80 mb-2 group-hover:block transition-all" />
              <p className="text-xl font-bold">{day.rainfall_mm.toFixed(1)}</p>
              <p className="text-xs text-slate-400">mm</p>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className={cn(
                "h-full rounded-full transition-all duration-1000",
                isHigh ? "bg-red-500" : isMod ? "bg-orange-500" : "bg-teal-500"
              )} style={{ width: `${day.flood_probability}%` }} />
            </div>
            <p className="text-center text-[10px] mt-1 text-slate-500 uppercase tracking-wider">{day.risk_level}</p>
          </div>
        );
      })}
    </div>
  );
}
