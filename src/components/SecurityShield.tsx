import React, { useState } from 'react';
import { Luxarion, SecurityCybork } from '../luxarion';
import { Shield, Lock, Unlock, Key, FileCode, CheckCircle2, AlertOctagon, Terminal, EyeOff, Sparkles } from 'lucide-react';

export const SecurityShield: React.FC = () => {
  const [isAuth, setIsAuth] = useState(SecurityCybork.isAuthorized());
  const [authKeyInput, setAuthKeyInput] = useState('');
  const [obfuscateInput, setObfuscateInput] = useState('LUXARION_SECRET_PAYLOAD_2026');
  const [obfuscatedOutput, setObfuscatedOutput] = useState('');
  const [deobfuscatedOutput, setDeobfuscatedOutput] = useState('');
  
  // Guard Test
  const [guardedResult, setGuardedResult] = useState<string | null>(null);
  
  // Seal Test
  const [sealStatus, setSealStatus] = useState<string | null>(null);

  // Violations log state
  const [violations, setViolations] = useState(SecurityCybork.getViolations());

  const handleAuthToggle = () => {
    if (isAuth) {
      // Force deauthorize by calling init with strict fake origin
      SecurityCybork.init({ allowUnknownOrigin: false });
      setIsAuth(SecurityCybork.isAuthorized());
      setViolations(SecurityCybork.getViolations());
    } else {
      const ok = SecurityCybork.authorize('LUXARION_CYBORK_BYPASS');
      setIsAuth(ok);
      setViolations(SecurityCybork.getViolations());
    }
  };

  const handleAuthorizeWithKey = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = SecurityCybork.authorize(authKeyInput);
    setIsAuth(SecurityCybork.isAuthorized());
    setViolations(SecurityCybork.getViolations());
    setAuthKeyInput('');
  };

  const handleTestGuardedFunction = () => {
    const rawFn = (a: number, b: number) => `Execution Success: ${a} + ${b} = ${a + b}`;
    const guardedFn = SecurityCybork.guard(rawFn, 'calculateSum');
    const result = guardedFn(15, 27);
    if (result === null) {
      setGuardedResult('BLOCKED by SecurityCybork (Unauthorized State)');
    } else {
      setGuardedResult(String(result));
    }
    setViolations(SecurityCybork.getViolations());
  };

  const handleTestSealObject = () => {
    const testObj = {
      config: {
        engine: 'Luxarion 3D',
        version: '1.0.0',
        allowUnsigned: false
      }
    };

    SecurityCybork.sealObject(testObj);
    const isSealed = SecurityCybork.isSealed(testObj);

    let mutationMessage = '';
    try {
      (testObj.config as any).engine = 'HACKED_ENGINE';
      mutationMessage = 'Mutation unexpectedly succeeded!';
    } catch {
      mutationMessage = 'Mutation PREVENTED (TypeError in strict mode)';
    }

    setSealStatus(`Object Sealed: ${isSealed} | ${mutationMessage}`);
  };

  const handleObfuscate = () => {
    const obf = SecurityCybork.obfuscate(obfuscateInput);
    setObfuscatedOutput(obf);
    const deobf = SecurityCybork.deobfuscate(obf);
    setDeobfuscatedOutput(deobf);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Security Shield Status & Authorization */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">SecurityCybork Status</h3>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isAuth
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {isAuth ? 'AUTHORIZED' : 'UNAUTHORIZED'}
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Protection Shield:</span>
              <span className="text-cyan-400 font-semibold font-mono">Module Closure Active</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Origin Verification:</span>
              <span className="text-emerald-400 font-semibold font-mono">Strict White-list</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Integrity Checksum:</span>
              <span className="text-indigo-400 font-semibold font-mono">luxarion-integrity-v1</span>
            </div>
          </div>

          {/* Toggle Authorization */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <button
              id="btn-toggle-cybork-auth"
              onClick={handleAuthToggle}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isAuth
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isAuth ? <Lock size={14} /> : <Unlock size={14} />}
              {isAuth ? 'Revoke Authorization (Simulate Breach)' : 'Grant Authorization (Cybork Bypass Key)'}
            </button>

            {/* Manual Key Input */}
            <form onSubmit={handleAuthorizeWithKey} className="flex gap-2">
              <input
                id="input-cybork-key"
                type="text"
                placeholder="Enter Access Key..."
                value={authKeyInput}
                onChange={(e) => setAuthKeyInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                id="btn-submit-cybork-key"
                type="submit"
                className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1"
              >
                <Key size={12} /> Verify
              </button>
            </form>
          </div>
        </div>

        {/* Function Guarding Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <AlertOctagon size={16} className="text-amber-400" />
            <h4 className="text-xs font-semibold text-slate-200">Guarded Function Execution Test</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Wrapped functions require valid authorization. Attempting to call guarded functions while unauthorized produces a violation log entry and blocks execution.
          </p>

          <button
            id="btn-test-guarded-fn"
            onClick={handleTestGuardedFunction}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Terminal size={14} /> Execute Guarded Sum Function
          </button>

          {guardedResult && (
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300">
              {guardedResult}
            </div>
          )}
        </div>
      </div>

      {/* Obfuscation & Object Sealer Controls */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* String Obfuscation Tool */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <EyeOff size={18} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Bitwise XOR Payload Obfuscator</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Plain Text Payload</label>
              <div className="flex gap-2">
                <input
                  id="input-obfuscate-text"
                  type="text"
                  value={obfuscateInput}
                  onChange={(e) => setObfuscateInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  id="btn-run-obfuscate"
                  onClick={handleObfuscate}
                  className="py-2 px-4 bg-indigo-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-indigo-400 transition-all flex items-center gap-1"
                >
                  <Sparkles size={14} /> Encode
                </button>
              </div>
            </div>

            {obfuscatedOutput && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-indigo-400 font-semibold mb-1">Obfuscated Output</div>
                  <div className="text-slate-300 break-all">{obfuscatedOutput}</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-emerald-400 font-semibold mb-1">Deobfuscated Verification</div>
                  <div className="text-slate-300">{deobfuscatedOutput}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Object Sealer Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Lock size={16} className="text-cyan-400" /> Deep Object Sealer (SecurityCybork.sealObject)
            </h4>
            <button
              id="btn-test-seal"
              onClick={handleTestSealObject}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all"
            >
              Test Seal & Mutate
            </button>
          </div>

          {sealStatus && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400">
              {sealStatus}
            </div>
          )}
        </div>

        {/* Violations Audit Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileCode size={16} className="text-rose-400" />
              Security Violations Audit Log
            </h3>
            <button
              id="btn-clear-violations"
              onClick={() => {
                SecurityCybork.clearViolations();
                setViolations([]);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-all font-mono"
            >
              Clear Log
            </button>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto font-mono text-xs">
            {violations.length > 0 ? (
              violations.map((v, i) => (
                <div key={i} className="bg-slate-950 border border-rose-500/20 rounded-xl p-2.5 text-rose-300 flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{v.message}</div>
                    <div className="text-[10px] text-slate-500">{v.timestamp}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                    VIOLATION
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic py-4 text-center">
                No security violations recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
