import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

export const MarkovWalkSimulator: React.FC = () => {
  const states = ['A', 'B', 'C', 'D'];
  // Transition Matrix P:
  // A -> B (1.0)
  // B -> A (0.5), C (0.5)
  // C -> D (0.8), A (0.2)
  // D -> B (0.5), C (0.5)
  const P = [
    [0.0, 1.0, 0.0, 0.0],
    [0.5, 0.0, 0.5, 0.0],
    [0.2, 0.0, 0.0, 0.8],
    [0.0, 0.5, 0.5, 0.0],
  ];

  // Exact stationary distribution: pi * P = pi
  const theoreticalPi = [0.1786, 0.3571, 0.2857, 0.1786];

  const [currentState, setCurrentState] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [visitCounts, setVisitCounts] = useState([1, 0, 0, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(400);

  const stepForward = () => {
    const row = P[currentState];
    const u = Math.random();
    let cum = 0;
    let next = row.length - 1;
    for (let j = 0; j < row.length; j++) {
      cum += row[j];
      if (u < cum) {
        next = j;
        break;
      }
    }
    setCurrentState(next);
    setStepCount(prev => prev + 1);
    setVisitCounts(prev => {
      const nextCounts = [...prev];
      nextCounts[next] += 1;
      return nextCounts;
    });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        stepForward();
      }, speedMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentState, speedMs]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentState(0);
    setStepCount(0);
    setVisitCounts([1, 0, 0, 0]);
  };

  // Positions on a ring for the 4 states
  const coords = [
    { x: 120, y: 100 },
    { x: 280, y: 100 },
    { x: 280, y: 240 },
    { x: 120, y: 240 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Markov Chain Random-Walk Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Watch an ergodic Markov chain in motion. Compare empirical visit frequencies with theoretical stationary probabilities.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
          </button>

          <button
            onClick={stepForward}
            disabled={isPlaying}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SVG Animation Canvas */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Current State: <strong className="text-indigo-400 text-sm">State {states[currentState]}</strong></span>
            <span>Total Steps: <strong className="text-white text-sm">{stepCount}</strong></span>
          </div>

          <svg className="w-full h-[280px] bg-[#090d16] rounded-lg border border-slate-800/80">
            {/* Draw state transition arrows */}
            {coords.map((c, i) =>
              coords.map((dest, j) => {
                if (P[i][j] > 0) {
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={c.x}
                      y1={c.y}
                      x2={dest.x}
                      y2={dest.y}
                      stroke="#4338ca"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      strokeOpacity={0.6}
                    />
                  );
                }
                return null;
              })
            )}

            {/* Draw state circles */}
            {states.map((name, i) => {
              const isCurrent = currentState === i;
              return (
                <g key={i}>
                  <circle
                    cx={coords[i].x}
                    cy={coords[i].y}
                    r={26}
                    fill={isCurrent ? '#4f46e5' : '#1e293b'}
                    stroke={isCurrent ? '#a5b4fc' : '#475569'}
                    strokeWidth={isCurrent ? 4 : 2}
                    className="transition-all duration-200"
                  />
                  <text
                    x={coords[i].x}
                    y={coords[i].y + 5}
                    fill="#f8fafc"
                    fontSize={14}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Speed slider */}
          <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Simulation Speed:</span>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={speedMs}
              onChange={e => setSpeedMs(Number(e.target.value))}
              className="w-48 accent-indigo-500 cursor-pointer"
            />
            <span>{speedMs} ms/step</span>
          </div>
        </div>

        {/* Empirical vs Theoretical Histogram */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
              Ergodic Convergence: Empirical Frequencies vs Theoretical π
            </h3>
            <p className="text-[11px] text-slate-400">
              By the Ergodic Theorem, as steps <code className="text-indigo-300">N → ∞</code>, empirical frequencies approach stationary distribution <code className="text-indigo-300">π</code>.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {states.map((name, i) => {
              const total = Math.max(1, stepCount);
              const empiricalProb = visitCounts[i] / total;
              const theoProb = theoreticalPi[i];

              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="font-semibold text-slate-300">State {name}</span>
                    <span className="text-slate-400">
                      Empirical: <strong className="text-cyan-300">{(empiricalProb * 100).toFixed(1)}%</strong> &bull;
                      Theoretical: <strong className="text-indigo-400">{(theoProb * 100).toFixed(1)}%</strong>
                    </span>
                  </div>

                  <div className="h-4 bg-[#090d16] rounded overflow-hidden flex border border-slate-800">
                    {/* Empirical Bar */}
                    <div
                      className="bg-cyan-500/80 transition-all duration-300"
                      style={{ width: `${empiricalProb * 100}%` }}
                    />
                  </div>

                  {/* Reference Marker */}
                  <div className="relative h-1">
                    <div
                      className="absolute top-0 w-0.5 h-3 bg-indigo-400 -mt-3.5 z-10"
                      style={{ left: `${theoProb * 100}%` }}
                      title={`Theoretical target: ${(theoProb * 100).toFixed(1)}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* TVD Metric Display */}
          <div className="p-3 bg-[#0b0f17] rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Variation Distance (TVD):</span>
              <span className="font-mono text-emerald-400 font-bold">
                {(
                  0.5 *
                  states.reduce((acc, _, i) => {
                    const emp = visitCounts[i] / Math.max(1, stepCount);
                    return acc + Math.abs(emp - theoreticalPi[i]);
                  }, 0)
                ).toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
