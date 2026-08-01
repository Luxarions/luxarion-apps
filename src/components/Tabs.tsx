import React from 'react';
import { ActiveTab } from '../types';
import { Box, Database, Shield, Terminal, Code, BookOpen } from 'lucide-react';

interface TabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabsList: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'viewport', label: 'WebGL 3D Render Engine', icon: <Box size={16} /> },
    { id: 'container', label: 'DI Container Inspector', icon: <Database size={16} /> },
    { id: 'security', label: 'Security Cybork Shield', icon: <Shield size={16} /> },
    { id: 'tests', label: 'Vitest Engine Runner', icon: <Terminal size={16} /> },
    { id: 'playground', label: 'Code Execution Sandbox', icon: <Code size={16} /> },
    { id: 'constants', label: '300+ Constants & API', icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-px">
      {tabsList.map((t) => (
        <button
          key={t.id}
          id={`tab-${t.id}`}
          onClick={() => onTabChange(t.id)}
          className={`py-3 px-4 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all border-t border-x ${
            activeTab === t.id
              ? 'bg-slate-900 text-cyan-300 border-slate-800 border-t-cyan-400 font-bold shadow-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <span className={activeTab === t.id ? 'text-cyan-400' : 'text-slate-500'}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
};
