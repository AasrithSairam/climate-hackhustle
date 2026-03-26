import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// This is the only path that reliably exports WidthProvider in the new v2.2.2 build for Vite
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

import Hero from '../components/Hero';
import ForecastCarousel from '../components/ForecastCarousel';
import MonthlyGraph from '../components/MonthlyGraph';
import HistoryTable from '../components/HistoryTable';

const API_BASE = "http://localhost:8000/api";

const pageVariants = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.8 } },
  exit: { opacity: 0, filter: "blur(10px)", transition: { duration: 0.4 } }
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, foreRes] = await Promise.all([
          axios.get(`${API_BASE}/dashboard`),
          axios.get(`${API_BASE}/forecast`)
        ]);
        setDashboardData(dashRes.data);
        setForecastData(foreRes.data.forecast);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </motion.div>
    );
  }

  const todayForecast = forecastData?.length > 0 ? forecastData[0] : null;

  const layout = [
    { i: 'hero', x: 0, y: 0, w: 2, h: 2 },
    { i: 'history', x: 2, y: 0, w: 1, h: 4 },
    { i: 'forecast', x: 0, y: 2, w: 2, h: 2 },
    { i: 'graph', x: 0, y: 4, w: 3, h: 3 }
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white/90">
          Live Overview
        </h1>
        <p className="mt-2 text-slate-400 font-medium text-lg">Drag and drop widgets to customize your layout.</p>
      </header>

      <ResponsiveGridLayout 
        className="layout"
        layouts={{ lg: layout, md: layout, sm: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 3, md: 3, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={180}
        useCSSTransforms={true}
        margin={[24, 24]}
        isDraggable={true}
        isResizable={true}
      >
        <div key="hero" className="flex overflow-hidden cursor-move rounded-3xl shadow-2xl">
          <div className="w-full h-full relative pointer-events-none">
            {todayForecast && <Hero todayData={todayForecast} />}
          </div>
        </div>

        <div key="forecast" className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl cursor-move flex flex-col justify-center overflow-hidden">
           <h2 className="text-sm font-semibold text-slate-200 mb-2 pointer-events-none">Weekly Outlook</h2>
           <div className="flex-1 pointer-events-none">
             <ForecastCarousel forecast={forecastData} />
           </div>
        </div>

        <div key="graph" className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl cursor-move flex flex-col overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 pointer-events-none">Past 30 Days Trend</h2>
          <div className="flex-1 pointer-events-none h-full">
            {dashboardData?.graph_data && <MonthlyGraph data={dashboardData.graph_data} />}
          </div>
        </div>

        <div key="history" className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl cursor-move flex flex-col overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 pointer-events-none">Warning Log</h2>
          <div className="flex-1 h-full overflow-y-auto pointer-events-auto custom-scrollbar">
            {dashboardData?.historical_floods && <HistoryTable records={dashboardData.historical_floods} />}
          </div>
        </div>
      </ResponsiveGridLayout>
    </motion.div>
  );
}
