import React, { useEffect, useState } from 'react';
import { Luxarion } from './luxarion';
import { ActiveTab } from './types';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { Viewport3D } from './components/Viewport3D';
import { ContainerInspector } from './components/ContainerInspector';
import { SecurityShield } from './components/SecurityShield';
import { TestRunner } from './components/TestRunner';
import { CodePlayground } from './components/CodePlayground';
import { ConstantsExplorer } from './components/ConstantsExplorer';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('viewport');

  useEffect(() => {
    // Initialize Luxarion Engine on app mount
    Luxarion.init({ debug: true });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="pt-2">
          {activeTab === 'viewport' && <Viewport3D />}
          {activeTab === 'container' && <ContainerInspector />}
          {activeTab === 'security' && <SecurityShield />}
          {activeTab === 'tests' && <TestRunner />}
          {activeTab === 'playground' && <CodePlayground />}
          {activeTab === 'constants' && <ConstantsExplorer />}
        </div>
      </main>
    </div>
  );
}

export default App;
