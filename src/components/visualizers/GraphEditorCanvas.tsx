import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, ArrowRight } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

export const GraphEditorCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '0', x: 100, y: 150 },
    { id: '1', x: 260, y: 80 },
    { id: '2', x: 260, y: 220 },
    { id: '3', x: 420, y: 150 },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { source: '0', target: '1', weight: 2.0 },
    { source: '0', target: '2', weight: 1.0 },
    { source: '1', target: '3', weight: 3.0 },
    { source: '2', target: '3', weight: 1.5 },
    { source: '3', target: '0', weight: 0.5 },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState<number>(1.0);

  // Compute row-normalized transition matrix in real time!
  const n = nodes.length;
  const nodeIndexMap = Object.fromEntries(nodes.map((node, i) => [node.id, i]));
  const adj = Array.from({ length: n }, () => Array(n).fill(0.0));
  for (const e of edges) {
    const u = nodeIndexMap[e.source];
    const v = nodeIndexMap[e.target];
    if (u !== undefined && v !== undefined) {
      adj[u][v] += e.weight;
    }
  }

  const rowSums = adj.map(row => row.reduce((a, b) => a + b, 0));
  const P = adj.map((row, i) =>
    rowSums[i] > 0
      ? row.map(w => Number((w / rowSums[i]).toFixed(3)))
      : Array(n).fill(Number((1.0 / n).toFixed(3)))
  );

  const handleMouseDown = (id: string) => {
    setDraggedNode(id);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left));
    const y = Math.max(30, Math.min(rect.height - 30, e.clientY - rect.top));
    setNodes(prev => prev.map(nd => (nd.id === draggedNode ? { ...nd, x, y } : nd)));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handleAddEdge = (source: string, target: string) => {
    if (source === target) return;
    setEdges(prev => {
      const existing = prev.find(e => e.source === source && e.target === target);
      if (existing) {
        return prev.map(e => (e.source === source && e.target === target ? { ...e, weight: e.weight + 1.0 } : e));
      }
      return [...prev, { source, target, weight: newWeight }];
    });
  };

  const handleReset = () => {
    setNodes([
      { id: '0', x: 100, y: 150 },
      { id: '1', x: 260, y: 80 },
      { id: '2', x: 260, y: 220 },
      { id: '3', x: 420, y: 150 },
    ]);
    setEdges([
      { source: '0', target: '1', weight: 2.0 },
      { source: '0', target: '2', weight: 1.0 },
      { source: '1', target: '3', weight: 3.0 },
      { source: '2', target: '3', weight: 1.5 },
      { source: '3', target: '0', weight: 0.5 },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 p-4 space-y-4 overflow-y-auto">
      {/* Top Banner & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>Directed Weighted Graph Editor</span>
          </h2>
          <p className="text-xs text-slate-400">
            Drag nodes, click to connect, adjust edge weights, and observe real-time row-stochastic normalization.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Graph</span>
        </button>
      </div>

      {/* Main Split: Canvas on Left, Live Matrices on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SVG Graph Canvas */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3 flex flex-col items-center">
          <div className="text-xs text-slate-400 mb-2 flex items-center space-x-4">
            <span>Click node to select/connect &bull; Drag to reposition</span>
          </div>

          <svg
            className="w-full h-[320px] bg-[#090d16] rounded-lg border border-slate-800/80 cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
              </marker>
            </defs>

            {/* Directed Edges */}
            {edges.map((e, idx) => {
              const u = nodes.find(n => n.id === e.source);
              const v = nodes.find(n => n.id === e.target);
              if (!u || !v) return null;
              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;
              return (
                <g key={idx}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#6366f1"
                    strokeWidth={Math.min(5, Math.max(1.5, e.weight))}
                    markerEnd="url(#arrow)"
                    strokeOpacity={0.8}
                  />
                  <rect
                    x={midX - 12}
                    y={midY - 9}
                    width={24}
                    height={18}
                    rx={4}
                    fill="#1e1b4b"
                    stroke="#4338ca"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    fill="#a5b4fc"
                    fontSize={10}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <g
                key={node.id}
                onMouseDown={() => handleMouseDown(node.id)}
                onClick={() => {
                  if (selectedNode && selectedNode !== node.id) {
                    handleAddEdge(selectedNode, node.id);
                    setSelectedNode(null);
                  } else {
                    setSelectedNode(node.id === selectedNode ? null : node.id);
                  }
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill={selectedNode === node.id ? '#4f46e5' : '#1e293b'}
                  stroke={selectedNode === node.id ? '#a5b4fc' : '#64748b'}
                  strokeWidth={selectedNode === node.id ? 3 : 2}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  fill="#f8fafc"
                  fontSize={12}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {node.id}
                </text>
              </g>
            ))}
          </svg>

          {/* Quick edge controls */}
          <div className="flex items-center space-x-2 mt-3 text-xs">
            <span className="text-slate-400">Selected Node: {selectedNode ?? 'None'}</span>
            {selectedNode && (
              <span className="text-indigo-400 font-semibold">(Click target node to create directed edge)</span>
            )}
          </div>
        </div>

        {/* Live Mathematical Matrices */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <span>Row-Stochastic Transition Matrix P</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-2">
              Formula: <code className="text-indigo-300">P[u][v] = W(u, v) / OutDegree(u)</code>. Notice every row sums strictly to 1.0.
            </p>

            <div className="overflow-x-auto bg-[#0b0f17] p-3 rounded-lg border border-slate-800">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="p-1 text-left">From \ To</th>
                    {nodes.map(n => (
                      <th key={n.id} className="p-1">Node {n.id}</th>
                    ))}
                    <th className="p-1 text-emerald-400 font-sans">RowSum</th>
                  </tr>
                </thead>
                <tbody>
                  {P.map((row, i) => (
                    <tr key={i} className="border-b border-slate-900/60 hover:bg-slate-800/30">
                      <td className="p-1.5 text-left text-slate-400 font-semibold">Node {nodes[i].id}</td>
                      {row.map((val, j) => (
                        <td
                          key={j}
                          className={`p-1.5 ${
                            val > 0 ? 'text-indigo-300 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          {val.toFixed(3)}
                        </td>
                      ))}
                      <td className="p-1.5 text-emerald-400 font-bold">1.000</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Out-Degree vs In-Degree summary */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Degrees Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#0b0f17] border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Weighted Out-Degrees (Row Sums):</span>
                <span className="font-mono text-emerald-300">
                  {rowSums.map((s, i) => `Node ${nodes[i].id}: ${s}`).join(', ')}
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0b0f17] border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Dangling Nodes (OutDegree = 0):</span>
                <span className="font-mono text-amber-300">
                  {nodes.filter((_, i) => rowSums[i] === 0).map(n => `Node ${n.id}`).join(', ') || 'None (fully connected)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
