import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function About() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="relative max-w-4xl mx-auto py-12 px-6 overflow-hidden">
      <motion.div 
        style={{ y }} 
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" 
      />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-6">
          The Journey from Data to Intelligence
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed font-medium mb-16">
          Chennai FloodWatch v2.0 represents a leap from raw 25-year historical Excel spreadsheets into a fully autonomous Machine Learning ecosystem predicting floods in real-time.
        </p>

        <section className="space-y-12 relative z-10">
          <div className="bg-slate-800/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-12">
            <h2 className="text-3xl font-semibold mb-4 text-white">1. Data Extraction & Labeling</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              Our journey began in <code className="text-blue-400 bg-blue-900/30 px-2 py-1 rounded">flood.ipynb</code>. We imported a quarter-century of highly granular rainfall data for Chennai. But raw rainfall isn't a flood. We engineered a rule-based logic algorithm to automatically label "Flood Risk" by tracking rolling historical sums: specifically highlighting days where rainfall exceeded 100mm, or multi-day cumulative sums surpassed 200mm threshold limits, fundamentally triggering flood indicators.
            </p>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-12">
            <h2 className="text-3xl font-semibold mb-4 text-white">2. Machine Learning</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              Once the data was mapped to Flood Risk identifiers, we deployed two powerful AI engines: a <span className="text-indigo-400 font-semibold">RandomForestClassifier</span> and a <span className="text-emerald-400 font-semibold">RandomForestRegressor</span>. The Classifier maps weather patterns directly into probability percentages to calculate real-world flood risks. The Regressor predicts precise sequence rainfall amounts, acting as the foundation for our historical simulator engine.
            </p>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-12">
            <h2 className="text-3xl font-semibold mb-4 text-white">3. Live APIs & The Modern Edge</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              The Python backend continuously syncs with the <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline decoration-blue-500/30 underline-offset-4">Open-Meteo Archive & Forecast APIs</a>. This ensures that the engine is never obsolete. The moment the day ends, the ML model automatically ingests the day's meteorological data, retraining its memory banks to adapt to Earth's evolving climate dynamically.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
