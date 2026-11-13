import React, { useState } from 'react';
import { Play, RotateCcw, ChevronRight, Sliders, Info } from 'lucide-react';

export const PageRankPowerIteration: React.FC = () => {
  const nodes = [
    { id: '0', name: 'NVIDIA', x: 80, y: 150 },
    { id: '1', name: 'CUDA', x: 220, y: 70 },
    { id: '2', name: 'GPU', x: 220, y: 230 },
    { id: '3', name: 'Transformer', x: 380, y: 150 },
  ];

  // Adjacency:
  // 0 -> 1 (w=2), 0 -> 2 (w=3)
  // 1 -> 2 (w=1), 1 -> 3 (w=4)
  // 2 -> 3 (w=5)
  // 3 -> 0 (w=2)
  const adj = [
    [0, 2, 3, 0],
    [0, 0, 1, 4],
    [0, 0, 0, 5],
    [2, 0, 0, 0],
  ];

  const n = nodes.length;
  const rowSums = adj.map(r => r.reduce((a, b) => a + b, 0));
  const P = adj.map((r, i) =>
    rowSums[i] > 0 ? r.map(w => w / rowSums[i]) : Array(n).fill(1 / n)
  );

  const [alpha, setAlpha] = useState(0.85);
  const [iteration, setIteration] = useState(0);
  const [r, setR] = useState<number[]>(Array(n).fill(1 / n));
  const [historyDeltas, setHistoryDeltas] = useState<number[]>([]);

  const stepIteration = () => {
    const v = Array(n).fill(1 / n);
    const r_next = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        r_next[j] += r[i] * P[i][j];
      }
    }

    for (let j = 0; j < n; j++) {
      r_next[j] = alpha * r_next[j] + (1.0 - alpha) * v[j];
    }

    const delta = r_next.reduce((acc, val, idx) => acc + Math.abs(val - r[idx]), 0);

    setR(r_next);
    setIteration(prev => prev + 1);
    setHistoryDeltas(prev => [...prev, delta]);
  };

  const handleReset = () => {
    setIteration(0);
    setR(Array(n).fill(1 / n));
    setHistoryDeltas([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>PageRank Power Iteration Visualizer</span>
          </h2>
          <p className="text-xs text-slate-400">
            Adjust damping factor α using the slider. Step through power iteration and watch node radii scale dynamically.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={stepIteration}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
          >
            <span>Next Iteration</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Damping Factor Alpha Slider Bar */}
      <div className="bg-[#161b22] border border-slate-800 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Damping Factor α:</span>
          <span className="text-xs font-mono font-bold text-indigo-300">{alpha.toFixed(2)}</span>
        </div>

        <div className="flex items-center space-x-3 w-1/2">
          <span className="text-[11px] text-slate-500">0.1 (High Teleport)</span>
          <input
            type="range"
            min={0.1}
            max={0.99}
            step={0.05}
            value={alpha}
            onChange={e => {
              setAlpha(Number(e.target.value));
              handleReset();
            }}
            className="flex-1 accent-indigo-500 cursor-pointer"
          />
          <span className="text-[11px] text-slate-500">0.99 (Pure Link)</span>
        </div>
      </div>

      {/* Canvas & Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SVG Animation */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full flex justify-between text-xs text-slate-400 mb-2">
            <span>Iteration: <strong className="text-white text-sm">{iteration}</strong></span>
            <span>
              L1 Error: <strong className="text-amber-400 font-mono">
                {historyDeltas.length > 0 ? historyDeltas[historyDeltas.length - 1].toFixed(5) : '0.00000'}
              </strong>
            </span>
          </div>

          <svg className="w-full h-[280px] bg-[#090d16] rounded-lg border border-slate-800/80">
            {/* Edge lines */}
            {adj.map((row, i) =>
              row.map((weight, j) => {
                if (weight > 0) {
                  const u = nodes[i];
                  const v = nodes[j];
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#4f46e5"
                      strokeWidth={1.5}
                      strokeOpacity={0.7}
                    />
                  );
                }
                return null;
              })
            )}

            {/* Nodes with dynamic radius according to PageRank score */}
            {nodes.map((node, i) => {
              const score = r[i];
              const radius = 18 + score * 45; // scale radius with PageRank score

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill="#1e1b4b"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    className="transition-all duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y - 2}
                    fill="#f8fafc"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 12}
                    fill="#38bdf8"
                    fontSize={10}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {score.toFixed(3)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Rankings & Convergence History */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Current Node Rankings & Scores
          </h3>

          <div className="space-y-2.5">
            {nodes
              .map((node, i) => ({ ...node, score: r[i] }))
              .sort((a, b) => b.score - a.score)
              .map((item, rank) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded bg-[#0b0f17] border border-slate-800 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400">
                      {rank + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.score * 100 * 2}%` }}
                      />
                    </div>
                    <span className="font-mono text-cyan-300 font-bold w-12 text-right">
                      {item.score.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Convergence status */}
          <div className="p-3 bg-[#0b0f17] rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Theoretical Bound for α={alpha.toFixed(2)}:{' '}
                <strong className="text-slate-200">
                  {Math.ceil(Math.log(1e-6) / Math.log(alpha))} iterations
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
