import React, { useState } from 'react';
import { Luxarion, Container, ArrayUtils, SerializeUtils, MatrixUtils, SecurityCybork, ConsoleUtils, LuxarionError } from '../luxarion';
import { CodePreset } from '../types';
import { Code, Play, Terminal, Sparkles, Copy, Check } from 'lucide-react';

const CODE_PRESETS: CodePreset[] = [
  {
    id: 'di-chain',
    name: 'Dependency Injection Service Chain',
    description: 'Demonstrates registering singletons and factories in DI container with child container resolution.',
    code: `// Create DI Container
const container = new Container();

// Register Engine Services
container.registerSingleton('Config', () => ({
  appName: 'Luxarion App',
  version: '1.0.0'
}));

container.registerFactory('Logger', (ct) => {
  const cfg = ct.resolve('Config');
  return {
    log: (msg) => \`[\${cfg.appName}] \${msg}\`
  };
});

// Resolve Services
const logger = container.resolve('Logger');
console.log(logger.log('Dependency Injection System Ready!'));
`
  },
  {
    id: 'matrix-math',
    name: '3D Matrix Projection & Frustum',
    description: 'Computes perspective matrices, converts to reversed depth, and extracts frustum plane equations.',
    code: `// Perspective Matrix (FOV 45deg, aspect 1.6, near 0.1, far 100)
const fovRad = (45 * Math.PI) / 180;
const proj = MatrixUtils.perspective(fovRad, 1.6, 0.1, 100);

// Convert to Reversed Depth Z-Buffer Matrix
const revProj = MatrixUtils.toReversedProjection(proj);

// Extract 6 Frustum Planes
const planes = MatrixUtils.extractFrustumPlanes(revProj);

console.log('Original Proj [10]:', proj[10]);
console.log('Reversed Proj [10]:', revProj[10]);
console.log('Extracted Planes Count:', planes.length);
`
  },
  {
    id: 'security-cybork',
    name: 'Security Shield & Guarded Functions',
    description: 'Shields functions with SecurityCybork authorization and obfuscates text payloads.',
    code: `// Initialize Cybork Security
SecurityCybork.init({ allowUnknownOrigin: true });

// Create Guarded Sensitive Function
const secretFn = SecurityCybork.guard((apiKey) => {
  return \`Authenticating with key: \${apiKey}\`;
}, 'SecretAuth');

console.log('Guarded Fn Exec:', secretFn('SK_99881122'));

// Payload Obfuscation
const encrypted = SecurityCybork.obfuscate('LUXARION_ENGINE_KEY');
console.log('Encrypted:', encrypted);
console.log('Decrypted:', SecurityCybork.deobfuscate(encrypted));
`
  },
  {
    id: 'serialize-bigint',
    name: 'BigInt, Map, Set & TypedArray Serialization',
    description: 'Full JSON roundtrip serialization preserving BigInt, Map, Set, and Float32Array instances.',
    code: `const data = {
  id: 1001n, // BigInt
  cache: new Map([['session_1', { active: true }]]),
  roles: new Set(['admin', 'developer']),
  matrices: new Float32Array([1.0, 0.0, 0.0, 1.0])
};

// Serialize to custom JSON
const serialized = SerializeUtils.serialize(data);
console.log('Serialized JSON:\\n', serialized);

// Deserialize back to original instance types
const restored = SerializeUtils.deserialize(serialized);
console.log('Restored BigInt:', restored.id);
console.log('Restored Map Size:', restored.cache.size);
`
  }
];

export const CodePlayground: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<CodePreset>(CODE_PRESETS[0]);
  const [code, setCode] = useState(CODE_PRESETS[0].code);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleRunCode = () => {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      },
      warn: (...args: any[]) => {
        logs.push('[WARN] ' + args.join(' '));
      },
      error: (...args: any[]) => {
        logs.push('[ERROR] ' + args.join(' '));
      }
    };

    try {
      const runFn = new Function(
        'Container',
        'ArrayUtils',
        'SerializeUtils',
        'MatrixUtils',
        'SecurityCybork',
        'ConsoleUtils',
        'LuxarionError',
        'Luxarion',
        'console',
        code
      );

      runFn(
        Container,
        ArrayUtils,
        SerializeUtils,
        MatrixUtils,
        SecurityCybork,
        ConsoleUtils,
        LuxarionError,
        Luxarion,
        customConsole
      );

      setConsoleOutput(logs.length > 0 ? logs : ['Execution completed with no console output.']);
    } catch (err: any) {
      setConsoleOutput([...logs, `[Uncaught Error]: ${err.message}`]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Code Editor & Presets */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Preset Selector Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-2 overflow-x-auto">
          {CODE_PRESETS.map((p) => (
            <button
              key={p.id}
              id={`btn-preset-${p.id}`}
              onClick={() => {
                setSelectedPreset(p);
                setCode(p.code);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPreset.id === p.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Code size={13} />
              {p.name}
            </button>
          ))}
        </div>

        {/* Code Editor Frame */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950/60 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">Luxarion Code Execution Sandbox</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-code"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                id="btn-run-sandbox"
                onClick={handleRunCode}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md flex items-center gap-1.5"
              >
                <Play size={12} /> Run Code
              </button>
            </div>
          </div>

          <textarea
            id="textarea-code-sandbox"
            rows={16}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-950 p-4 text-xs font-mono text-cyan-300 focus:outline-none leading-relaxed resize-none border-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Output Console Pane */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Terminal size={16} className="text-cyan-400" />
              Console Log Stream
            </h3>
            <button
              id="btn-clear-console"
              onClick={() => setConsoleOutput([])}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono"
            >
              Clear
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1 font-mono text-xs text-slate-300 space-y-2 max-h-[420px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {consoleOutput.length > 0 ? (
              consoleOutput.map((out, i) => (
                <div key={i} className="border-b border-slate-800/60 pb-1.5 last:border-0">
                  {out}
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic text-center py-10">
                Click "Run Code" to execute the sandbox script.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
