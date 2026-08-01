import React, { useState } from 'react';
import { Luxarion, Container, ServiceLifetime } from '../luxarion';
import { Database, Plus, RefreshCw, Layers, CheckCircle2, AlertTriangle, ArrowRight, Play, Server, Code } from 'lucide-react';

export const ContainerInspector: React.FC = () => {
  const [activeContainer, setActiveContainer] = useState<any>(Luxarion.getContainer());
  const [childContainer, setChildContainer] = useState<any | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceLifetime, setServiceLifetime] = useState<'singleton' | 'factory' | 'instance'>('singleton');
  const [serviceValue, setServiceValue] = useState('{\n  timestamp: Date.now(),\n  status: "active"\n}');
  const [resolutionOutput, setResolutionOutput] = useState<{
    service: string;
    value: string;
    timeMs: number;
    error?: string;
  } | null>(null);

  const [registeredList, setRegisteredList] = useState<string[]>(Luxarion.getContainer().listServices());

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    try {
      if (serviceLifetime === 'instance') {
        const parsed = eval(`(${serviceValue})`);
        activeContainer.register(serviceName, parsed);
      } else {
        const factory = eval(`(container) => (${serviceValue})`);
        activeContainer.register(serviceName, factory, { type: serviceLifetime });
      }

      setRegisteredList(activeContainer.listServices());
      setServiceName('');
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    }
  };

  const handleResolve = (name: string) => {
    const start = performance.now();
    try {
      const res = activeContainer.get(name);
      const timeMs = performance.now() - start;
      
      let strVal = '';
      if (typeof res === 'object') {
        try {
          strVal = JSON.stringify(res, null, 2) || String(res);
        } catch {
          strVal = String(res);
        }
      } else {
        strVal = String(res);
      }

      setResolutionOutput({
        service: name,
        value: strVal,
        timeMs
      });
    } catch (err: any) {
      setResolutionOutput({
        service: name,
        value: '',
        timeMs: performance.now() - start,
        error: err.message
      });
    }
  };

  const handleCreateChild = () => {
    const child = activeContainer.createChild();
    setChildContainer(child);
    setActiveContainer(child);
    setRegisteredList(child.listServices());
  };

  const handleTestCircular = () => {
    const c = Luxarion.getContainer().createChild();
    c.register('ServiceA', (deps: any, ct: any) => ct.get('ServiceB'));
    c.register('ServiceB', (deps: any, ct: any) => ct.get('ServiceA'));

    const start = performance.now();
    try {
      c.get('ServiceA');
    } catch (err: any) {
      setResolutionOutput({
        service: 'ServiceA (Circular Test)',
        value: '',
        timeMs: performance.now() - start,
        error: err.message
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Services List Panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Registered Services</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
              {activeContainer.getParent && activeContainer.getParent() ? 'Child Container' : 'Root Container'}
            </span>
          </div>

          {/* Container Hierarchy Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-root-container"
              onClick={() => {
                setActiveContainer(Luxarion.getContainer());
                setRegisteredList(Luxarion.getContainer().listServices());
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                activeContainer === Luxarion.getContainer()
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Root DI Container
            </button>

            <button
              id="btn-create-child"
              onClick={handleCreateChild}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${
                childContainer && activeContainer === childContainer
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Layers size={13} />
              {childContainer ? 'Select Child' : '+ Create Child'}
            </button>
          </div>

          {/* Services List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {registeredList.map((sName) => (
              <div
                key={sName}
                className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <div>
                    <div className="text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300">
                      {sName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {['constants', 'version', 'types', 'engine', 'security', 'logger', 'utils'].includes(sName)
                        ? 'Built-in Core Singleton'
                        : 'Custom Registered Service'}
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-resolve-${sName}`}
                  onClick={() => handleResolve(sName)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all flex items-center gap-1"
                >
                  <Play size={10} /> Resolve
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              id="btn-test-circular"
              onClick={handleTestCircular}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <AlertTriangle size={14} /> Test Circular Dependency Detection
            </button>
          </div>
        </div>
      </div>

      {/* Register Service & Output Panel */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Registration Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus size={18} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Register Service in DI Container</h3>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Service Key Name</label>
                <input
                  id="input-service-name"
                  type="text"
                  placeholder="e.g., AuthService, SceneRenderer"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Lifetime Strategy</label>
                <select
                  id="select-service-lifetime"
                  value={serviceLifetime}
                  onChange={(e) => setServiceLifetime(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="singleton">SINGLETON (Shared instance)</option>
                  <option value="factory">FACTORY (Evaluated on resolve)</option>
                  <option value="instance">INSTANCE (Direct object/value)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Factory Return Expression / Object Definition
              </label>
              <textarea
                id="textarea-service-value"
                rows={4}
                value={serviceValue}
                onChange={(e) => setServiceValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Register Service into Container
            </button>
          </form>
        </div>

        {/* Resolution Inspector Result */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Code size={16} className="text-cyan-400" />
              Resolution Output Inspector
            </h3>
            {resolutionOutput && (
              <span className="text-xs text-slate-500 font-mono">
                {resolutionOutput.timeMs.toFixed(3)} ms
              </span>
            )}
          </div>

          {resolutionOutput ? (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">Service:</span>
                <span className="text-cyan-400 font-bold">{resolutionOutput.service}</span>
              </div>

              {resolutionOutput.error ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <AlertTriangle size={14} /> Resolution Error
                  </div>
                  <div>{resolutionOutput.error}</div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                  {resolutionOutput.value}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic text-center py-6">
              Click "Resolve" on any service above to inspect its resolved instance state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
