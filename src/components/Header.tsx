import React from 'react';
import { Luxarion } from '../luxarion';
import { Cpu, ShieldCheck, Database, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu size={22} className="text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100 font-sans">
                Luxarion Engine Studio
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v{Luxarion.getVersion().VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive WebGL 3D Engine, Dependency Injection Container & Security Cybork Shield
            </p>
          </div>
        </div>

        {/* Engine Status Badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <Database size={14} className="text-cyan-400" />
            <span>DI Container: <strong className="text-cyan-300">{Luxarion.getContainer().listServices().length} Services</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Cybork: <strong className="text-emerald-300">Active</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
