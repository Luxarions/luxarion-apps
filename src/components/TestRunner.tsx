import React, { useState } from 'react';
import { Luxarion, Container, ArrayUtils, SerializeUtils, MatrixUtils, SecurityCybork, Constants } from '../luxarion';
import { TestResult } from '../types';
import { Play, CheckCircle2, XCircle, Clock, Check, Terminal, RefreshCw } from 'lucide-react';

const INITIAL_TESTS: TestResult[] = [
  { id: '1', name: 'Container: Register & resolve singletons', category: 'Core DI', status: 'pending' },
  { id: '2', name: 'Container: Child container service inheritance', category: 'Core DI', status: 'pending' },
  { id: '3', name: 'Container: Detect & block circular dependencies', category: 'Core DI', status: 'pending' },
  { id: '4', name: 'ArrayUtils: Chunking, unique, and shuffle correctness', category: 'Utilities', status: 'pending' },
  { id: '5', name: 'SerializeUtils: BigInt, Map, Set, TypedArray roundtrip', category: 'Serialization', status: 'pending' },
  { id: '6', name: 'MatrixUtils: Perspective & Reversed Depth conversion', category: 'Math Engine', status: 'pending' },
  { id: '7', name: 'SecurityCybork: Guarded function authorization enforcement', category: 'Security Shield', status: 'pending' },
  { id: '8', name: 'Luxarion Engine: Full lifecycle init and dispose', category: 'Engine Facade', status: 'pending' },
];

export const TestRunner: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>(INITIAL_TESTS);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTimeMs, setTotalTimeMs] = useState<number | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setTotalTimeMs(null);
    const startTotal = performance.now();

    const updatedTests: TestResult[] = [...INITIAL_TESTS];

    for (let i = 0; i < updatedTests.length; i++) {
      const t = updatedTests[i];
      t.status = 'running';
      setTests([...updatedTests]);

      await new Promise((r) => setTimeout(r, 60)); // Visual delay
      const startMs = performance.now();

      try {
        if (t.id === '1') {
          const c = new Container();
          c.registerSingleton('testService', () => ({ val: 42 }));
          const res1 = c.resolve('testService');
          const res2 = c.resolve('testService');
          if (res1 !== res2 || res1.val !== 42) throw new Error('Singleton identity mismatch');
        } else if (t.id === '2') {
          const parent = new Container();
          parent.registerInstance('parentService', 'hello_from_parent');
          const child = parent.createChild();
          const val = child.resolve('parentService');
          if (val !== 'hello_from_parent') throw new Error('Child container failed to inherit parent service');
        } else if (t.id === '3') {
          const c = new Container();
          c.register('A', (ct) => ct.resolve('B'));
          c.register('B', (ct) => ct.resolve('A'));
          let threw = false;
          try {
            c.resolve('A');
          } catch {
            threw = true;
          }
          if (!threw) throw new Error('Circular dependency did not throw error');
        } else if (t.id === '4') {
          const arr = [1, 1, 2, 3, 3, 4];
          const unq = ArrayUtils.unique(arr);
          if (unq.length !== 4) throw new Error('ArrayUtils.unique failed');
          const chk = ArrayUtils.chunk([1, 2, 3, 4, 5], 2);
          if (chk.length !== 3) throw new Error('ArrayUtils.chunk failed');
        } else if (t.id === '5') {
          const original = {
            big: 9007199254740991n,
            map: new Map([['key', 'value']]),
            set: new Set([10, 20]),
            arr: new Float32Array([1.5, 2.5])
          };
          const json = SerializeUtils.serialize(original);
          const restored = SerializeUtils.deserialize(json);
          if (restored.big !== 9007199254740991n || restored.map.get('key') !== 'value') {
            throw new Error('SerializeUtils roundtrip deserialization failed');
          }
        } else if (t.id === '6') {
          const proj = MatrixUtils.perspective(Math.PI / 4, 1.6, 0.1, 100);
          const rev = MatrixUtils.toReversedProjection(proj);
          if (rev[10] !== -proj[10]) throw new Error('MatrixUtils.toReversedProjection failed');
        } else if (t.id === '7') {
          SecurityCybork.init({ allowUnknownOrigin: true });
          const guarded = SecurityCybork.guard(() => 'SECRET_RESULT', 'testGuard');
          const ok = guarded();
          if (ok !== 'SECRET_RESULT') throw new Error('Guarded function authorization failed');
        } else if (t.id === '8') {
          Luxarion.init({ allowUnknownOrigin: true });
          if (!Luxarion.isInitialized) throw new Error('Luxarion initialization check failed');
        }

        t.status = 'passed';
        t.durationMs = performance.now() - startMs;
      } catch (err: any) {
        t.status = 'failed';
        t.durationMs = performance.now() - startMs;
        t.error = err.message;
      }

      setTests([...updatedTests]);
    }

    setTotalTimeMs(performance.now() - startTotal);
    setIsRunning(false);
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal size={20} className="text-cyan-400" />
            Luxarion Engine Integrated Vitest Runner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated assertion suite testing core Dependency Injection, Matrix math, SecurityCyBork, and Utilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {totalTimeMs !== null && (
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Clock size={13} className="text-cyan-400" />
              {totalTimeMs.toFixed(2)} ms
            </div>
          )}

          <button
            id="btn-run-all-tests"
            onClick={runAllTests}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
          >
            {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {/* Test Metrics Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-slate-200">{tests.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Suite Tests</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">{passedCount}</div>
          <div className="text-xs text-emerald-500/80 font-medium mt-1">Passed</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-rose-400">{failedCount}</div>
          <div className="text-xs text-rose-500/80 font-medium mt-1">Failed</div>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="space-y-2">
          {tests.map((t) => (
            <div
              key={t.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                {t.status === 'passed' && <CheckCircle2 size={18} className="text-emerald-400" />}
                {t.status === 'failed' && <XCircle size={18} className="text-rose-400" />}
                {t.status === 'running' && <RefreshCw size={18} className="text-cyan-400 animate-spin" />}
                {t.status === 'pending' && <div className="w-4 h-4 rounded-full border border-slate-700" />}

                <div>
                  <div className="text-xs font-semibold text-slate-200">{t.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {t.durationMs !== undefined && (
                  <span className="text-xs font-mono text-slate-400">
                    {t.durationMs.toFixed(2)} ms
                  </span>
                )}

                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md border font-mono ${
                    t.status === 'passed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : t.status === 'failed'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : t.status === 'running'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
