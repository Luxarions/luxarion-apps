import React, { useEffect, useRef, useState } from 'react';
import { Luxarion, Constants, MatrixUtils } from '../luxarion';
import { Play, Pause, RotateCcw, Box, Eye, Layers, Sliders, Cpu, Activity } from 'lucide-react';

export const Viewport3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [shape, setShape] = useState<'cube' | 'pyramid' | 'grid'>('cube');
  const [projectionType, setProjectionType] = useState<'perspective' | 'ortho' | 'reversed'>('perspective');
  const [depthFunc, setDepthFunc] = useState<number>(Constants.LESS_EQUAL_DEPTH);
  const [cullMode, setCullMode] = useState<number>(Constants.CULL_FACE_BACK);
  const [fov, setFov] = useState<number>(45);
  const [fovDistance, setFovDistance] = useState<number>(5);
  const [fps, setFps] = useState<number>(60);
  const [matrices, setMatrices] = useState<{
    model: number[];
    view: number[];
    proj: number[];
    vp: number[];
  } | null>(null);
  const [frustumPlanes, setFrustumPlanes] = useState<{ normal: number[]; constant: number }[]>([]);

  const rotRef = useRef({ x: 0.4, y: 0.6 });
  const frameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    // Vertex Shader
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec4 aColor;

      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProjection;

      varying vec3 vNormal;
      varying vec4 vColor;
      varying vec3 vFragPos;

      void main() {
        vec4 worldPos = uModel * vec4(aPosition, 1.0);
        vFragPos = worldPos.xyz;
        vNormal = mat3(uModel) * aNormal;
        vColor = aColor;
        gl_Position = uProjection * uView * worldPos;
      }
    `;

    // Fragment Shader
    const fsSource = `
      precision mediump float;
      varying vec3 vNormal;
      varying vec4 vColor;
      varying vec3 vFragPos;

      uniform vec3 uLightPos;

      void main() {
        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(uLightPos - vFragPos);
        float diff = max(dot(norm, lightDir), 0.2);
        vec3 result = vColor.rgb * diff;
        gl_FragColor = vec4(result, vColor.a);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const uModel = gl.getUniformLocation(program, 'uModel');
    const uView = gl.getUniformLocation(program, 'uView');
    const uProjection = gl.getUniformLocation(program, 'uProjection');
    const uLightPos = gl.getUniformLocation(program, 'uLightPos');

    // Geometry buffers
    let positions: number[] = [];
    let normals: number[] = [];
    let colors: number[] = [];
    let indices: number[] = [];

    if (shape === 'cube') {
      // Cube
      positions = [
        // Front
        -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
        // Back
        -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,
        // Top
        -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,
        // Bottom
        -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
        // Right
         1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,
        // Left
        -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1,
      ];

      normals = [
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
       -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      ];

      const cFront = [0.22, 0.74, 0.97, 1.0]; // Cyan
      const cBack = [0.93, 0.28, 0.6, 1.0];  // Pink
      const cTop = [0.2, 0.83, 0.6, 1.0];    // Emerald
      const cBottom = [0.98, 0.7, 0.15, 1.0]; // Amber
      const cRight = [0.66, 0.33, 0.97, 1.0]; // Violet
      const cLeft = [0.25, 0.42, 0.88, 1.0];  // Blue

      colors = [
        ...cFront, ...cFront, ...cFront, ...cFront,
        ...cBack, ...cBack, ...cBack, ...cBack,
        ...cTop, ...cTop, ...cTop, ...cTop,
        ...cBottom, ...cBottom, ...cBottom, ...cBottom,
        ...cRight, ...cRight, ...cRight, ...cRight,
        ...cLeft, ...cLeft, ...cLeft, ...cLeft,
      ];

      indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
      ];
    } else if (shape === 'pyramid') {
      // Pyramid
      positions = [
        // Base
        -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
        // Front
        -1, -1,  1,   1, -1,  1,   0,  1,  0,
        // Right
         1, -1,  1,   1, -1, -1,   0,  1,  0,
        // Back
         1, -1, -1,  -1, -1, -1,   0,  1,  0,
        // Left
        -1, -1, -1,  -1, -1,  1,   0,  1,  0
      ];

      normals = [
        0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
        0, 0.7, 0.7,  0, 0.7, 0.7,  0, 0.7, 0.7,
        0.7, 0.7, 0,  0.7, 0.7, 0,  0.7, 0.7, 0,
        0, 0.7,-0.7,  0, 0.7,-0.7,  0, 0.7,-0.7,
       -0.7, 0.7, 0, -0.7, 0.7, 0, -0.7, 0.7, 0
      ];

      const cBase = [0.3, 0.3, 0.4, 1.0];
      const cFront = [0.93, 0.28, 0.6, 1.0];
      const cRight = [0.22, 0.74, 0.97, 1.0];
      const cBack = [0.98, 0.7, 0.15, 1.0];
      const cLeft = [0.66, 0.33, 0.97, 1.0];

      colors = [
        ...cBase, ...cBase, ...cBase, ...cBase,
        ...cFront, ...cFront, ...cFront,
        ...cRight, ...cRight, ...cRight,
        ...cBack, ...cBack, ...cBack,
        ...cLeft, ...cLeft, ...cLeft
      ];

      indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6,
        7, 8, 9,
        10, 11, 12,
        13, 14, 15
      ];
    } else {
      // Grid
      const lines = 10;
      for (let i = -lines; i <= lines; i++) {
        positions.push(i, 0, -lines, i, 0, lines);
        positions.push(-lines, 0, i, lines, 0, i);

        normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);

        const col = i === 0 ? [0.22, 0.74, 0.97, 1.0] : [0.3, 0.35, 0.45, 0.7];
        colors.push(...col, ...col, ...col, ...col);

        const idx = (i + lines) * 4;
        indices.push(idx, idx + 1, idx + 2, idx + 3);
      }
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const colBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Setup Depth function mapping
    gl.enable(gl.DEPTH_TEST);
    if (depthFunc === Constants.LESS_DEPTH) gl.depthFunc(gl.LESS);
    else if (depthFunc === Constants.LESS_EQUAL_DEPTH) gl.depthFunc(gl.LEQUAL);
    else if (depthFunc === Constants.GREATER_DEPTH) gl.depthFunc(gl.GREATER);
    else if (depthFunc === Constants.ALWAYS_DEPTH) gl.depthFunc(gl.ALWAYS);

    // Culling
    if (cullMode === Constants.CULL_FACE_NONE) {
      gl.disable(gl.CULL_FACE);
    } else {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(cullMode === Constants.CULL_FACE_FRONT ? gl.FRONT : gl.BACK);
    }

    const render = () => {
      if (!canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.07, 0.12, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (isPlaying) {
        rotRef.current.x += 0.01;
        rotRef.current.y += 0.015;
      }

      // Compute matrices via Luxarion MatrixUtils
      const modelMat = MatrixUtils.rotationXYZ(rotRef.current.x, rotRef.current.y, 0);
      const eye = [0, 2, fovDistance];
      const viewMat = MatrixUtils.lookAt(eye, [0, 0, 0], [0, 1, 0]);

      const aspect = canvas.width / canvas.height;
      let projMat = MatrixUtils.perspective((fov * Math.PI) / 180, aspect, 0.1, 100);

      if (projectionType === 'ortho') {
        projMat = MatrixUtils.ortho(-2 * aspect, 2 * aspect, -2, 2, 0.1, 100);
      } else if (projectionType === 'reversed') {
        projMat = MatrixUtils.toReversedProjection(projMat);
      }

      const vpMat = MatrixUtils.multiply4(projMat, viewMat);

      // Extract frustum planes
      const planes = MatrixUtils.extractFrustumPlanes(vpMat);

      setMatrices({
        model: Array.from(modelMat),
        view: Array.from(viewMat),
        proj: Array.from(projMat),
        vp: Array.from(vpMat)
      });
      setFrustumPlanes(planes);

      gl.useProgram(program);

      // Bind attributes
      const aPos = gl.getAttribLocation(program, 'aPosition');
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

      const aNorm = gl.getAttribLocation(program, 'aNormal');
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
      gl.enableVertexAttribArray(aNorm);
      gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);

      const aCol = gl.getAttribLocation(program, 'aColor');
      gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
      gl.enableVertexAttribArray(aCol);
      gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, 0, 0);

      gl.uniformMatrix4fv(uModel, false, modelMat);
      gl.uniformMatrix4fv(uView, false, viewMat);
      gl.uniformMatrix4fv(uProjection, false, projMat);
      gl.uniform3f(uLightPos, 5.0, 5.0, 5.0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      if (shape === 'grid') {
        gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      }

      // FPS Calculation
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [isPlaying, shape, projectionType, depthFunc, cullMode, fov, fovDistance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 3D WebGL Canvas Card */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-slate-200 tracking-wide">
                Luxarion WebGL 3D Viewport
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono border border-cyan-500/30">
                {fps} FPS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-play-pause"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isPlaying
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause Loop' : 'Resume Loop'}
              </button>

              <button
                id="btn-reset-rot"
                onClick={() => {
                  rotRef.current = { x: 0.4, y: 0.6 };
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-1"
              >
                <RotateCcw size={14} />
                Reset Cam
              </button>
            </div>
          </div>

          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  rotRef.current.x += e.movementY * 0.005;
                  rotRef.current.y += e.movementX * 0.005;
                }
              }}
            />

            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 space-y-1 font-mono">
              <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                <Cpu size={12} /> Luxarion State
              </div>
              <div>Projection: <span className="text-slate-200">{projectionType}</span></div>
              <div>Depth Func: <span className="text-slate-200">{depthFunc === Constants.LESS_EQUAL_DEPTH ? 'LESS_EQUAL (3)' : depthFunc === Constants.LESS_DEPTH ? 'LESS (2)' : 'ALWAYS (1)'}</span></div>
              <div>Cull Mode: <span className="text-slate-200">{cullMode === Constants.CULL_FACE_BACK ? 'BACK (1)' : 'NONE (0)'}</span></div>
            </div>
          </div>
        </div>

        {/* Matrix Inspector Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              Luxarion MatrixUtils Live Inspector (4x4 Column-Major)
            </h3>
            <span className="text-xs text-slate-500 font-mono">MatrixUtils.perspective & lookAt</span>
          </div>

          {matrices && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                <div className="text-cyan-400 font-semibold mb-2 flex items-center justify-between">
                  <span>Model Matrix (Rotation & Translation)</span>
                  <span className="text-[10px] text-slate-500">16 Float32</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-slate-300">
                  {matrices.model.map((v, i) => (
                    <div key={i} className="bg-slate-900/90 p-1 rounded text-center overflow-hidden text-ellipsis">
                      {v.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                <div className="text-indigo-400 font-semibold mb-2 flex items-center justify-between">
                  <span>View Projection Matrix (VP = Proj * View)</span>
                  <span className="text-[10px] text-slate-500">16 Float32</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-slate-300">
                  {matrices.vp.map((v, i) => (
                    <div key={i} className="bg-slate-900/90 p-1 rounded text-center overflow-hidden text-ellipsis">
                      {v.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Frustum Planes */}
          {frustumPlanes.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Extracted Frustum Planes (MatrixUtils.extractFrustumPlanes)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-mono">
                {['Left', 'Right', 'Bottom', 'Top', 'Near', 'Far'].map((planeName, i) => (
                  <div key={planeName} className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg">
                    <div className="text-cyan-400 font-bold mb-1">{planeName}</div>
                    <div className="text-slate-400 text-[10px]">
                      N: ({frustumPlanes[i]?.normal.map(n => n.toFixed(1)).join(', ')})
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      D: {frustumPlanes[i]?.constant.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel Settings */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders size={18} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Engine Pipeline Controls</h3>
          </div>

          {/* Geometry Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Box size={14} className="text-cyan-400" /> 3D Geometry
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['cube', 'pyramid', 'grid'] as const).map((s) => (
                <button
                  key={s}
                  id={`shape-select-${s}`}
                  onClick={() => setShape(s)}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                    shape === s
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Projection Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Eye size={14} className="text-indigo-400" /> Projection Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'perspective', label: 'Perspective' },
                { id: 'ortho', label: 'Ortho' },
                { id: 'reversed', label: 'Rev Depth' },
              ].map((p) => (
                <button
                  key={p.id}
                  id={`proj-select-${p.id}`}
                  onClick={() => setProjectionType(p.id as any)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    projectionType === p.id
                      ? 'bg-indigo-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Depth Function */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-400" /> Depth Test Function
            </label>
            <select
              id="select-depth-func"
              value={depthFunc}
              onChange={(e) => setDepthFunc(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={Constants.LESS_EQUAL_DEPTH}>LESS_EQUAL (3)</option>
              <option value={Constants.LESS_DEPTH}>LESS (2)</option>
              <option value={Constants.ALWAYS_DEPTH}>ALWAYS (1)</option>
            </select>
          </div>

          {/* Face Culling */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Box size={14} className="text-amber-400" /> Face Culling Mode
            </label>
            <select
              id="select-cull-mode"
              value={cullMode}
              onChange={(e) => setCullMode(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={Constants.CULL_FACE_BACK}>CULL_FACE_BACK (1)</option>
              <option value={Constants.CULL_FACE_NONE}>CULL_FACE_NONE (0)</option>
            </select>
          </div>

          {/* FOV Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Field of View (FOV)</span>
              <span className="text-cyan-400 font-mono font-semibold">{fov}°</span>
            </div>
            <input
              type="range"
              min={15}
              max={110}
              value={fov}
              onChange={(e) => setFov(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Camera Distance Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Camera Distance</span>
              <span className="text-cyan-400 font-mono font-semibold">{fovDistance.toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={0.1}
              value={fovDistance}
              onChange={(e) => setFovDistance(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Engine Information Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
            Luxarion Core Architecture
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The viewport uses Luxarion Engine’s <code className="text-cyan-300">MatrixUtils</code> to compute high-precision 4x4 transform and view-projection matrices. Depth buffers can be configured with standard WebGL depth or reversed depth precision.
          </p>
        </div>
      </div>
    </div>
  );
};
