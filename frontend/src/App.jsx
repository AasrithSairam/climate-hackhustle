import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Beaker, Info } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import Dashboard from './pages/Dashboard';
import Testing from './pages/Testing';
import About from './pages/About';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Apple-style Frosted Navbar
function Navbar() {
  const links = [
    { name: "Live Dashboard", to: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Model Simulator", to: "/testing", icon: <Beaker size={18} /> },
    { name: "Project Journey", to: "/about", icon: <Info size={18} /> },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center py-6 pointer-events-none">
      <nav className="pointer-events-auto flex items-center space-x-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 px-3 py-2 rounded-full">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ease-out flex items-center space-x-2",
              isActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/30 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{l.icon}</span>
                <span className="relative z-10">{l.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Decorative Apple Weather background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] bg-slate-600/20 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-12 px-6 max-w-[1400px] mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/testing" element={<Testing />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
