import React, { useState } from 'react';
import { Layers, Database, Network, ArrowRight } from 'lucide-react';

export const HybridRetrievalComparator: React.FC = () => {
  const [kConstant, setKConstant] = useState(60);

  // Sample retrieved candidate chunks
  const vectorResults = [
    { chunk_id: 'doc_12', text: 'Attention Is All You Need introduces the Transformer model.', score: 0.92 },
    { chunk_id: 'doc_45', text: 'Dense embeddings measure cosine similarity between sentences.', score: 0.88 },
    { chunk_id: 'doc_03', text: 'CUDA parallel architecture for high performance computing.', score: 0.74 },
    { chunk_id: 'doc_99', text: 'Self-attention allows tokens to attend to all other tokens.', score: 0.71 },
  ];

  const graphPPRResults = [
    { chunk_id: 'doc_03', text: 'CUDA parallel architecture for high performance computing.', score: 0.0482 },
    { chunk_id: 'doc_12', text: 'Attention Is All You Need introduces the Transformer model.', score: 0.0351 },
    { chunk_id: 'doc_77', text: 'NVIDIA H100 GPU tensor cores accelerate training.', score: 0.0298 },
    { chunk_id: 'doc_99', text: 'Self-attention allows tokens to attend to all other tokens.', score: 0.0154 },
  ];

  // Calculate RRF in real time
  const vRanks = Object.fromEntries(vectorResults.map((item, i) => [item.chunk_id, i + 1]));
  const gRanks = Object.fromEntries(graphPPRResults.map((item, i) => [item.chunk_id, i + 1]));

  const allChunkIds = Array.from(new Set([...Object.keys(vRanks), ...Object.keys(gRanks)]));

  const fusedResults = allChunkIds
    .map(cid => {
      const vRank = vRanks[cid];
      const gRank = gRanks[cid];
      const vScore = vRank ? 1.0 / (kConstant + vRank) : 0.0;
      const gScore = gRank ? 1.0 / (kConstant + gRank) : 0.0;
      const rrf = vScore + gScore;

      const chunkObj =
        vectorResults.find(c => c.chunk_id === cid) ||
        graphPPRResults.find(c => c.chunk_id === cid);

      return {
        chunk_id: cid,
        text: chunkObj?.text || '',
        vRank: vRank || null,
        gRank: gRank || null,
        vScore,
        gScore,
        rrfScore: rrf,
      };
    })
    .sort((a, b) => b.rrfScore - a.rrfScore);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 p-4 space-y-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Dual-Channel Hybrid Retrieval: Dense Vector vs Graph PPR vs RRF</span>
          </h2>
          <p className="text-xs text-slate-400">
            Witness how Reciprocal Rank Fusion aggregates dense semantics from Qdrant with topological graph connectivity from PPR.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">RRF Constant k:</span>
          <input
            type="number"
            min={1}
            max={100}
            value={kConstant}
            onChange={e => setKConstant(Number(e.target.value))}
            className="w-16 px-2 py-1 bg-[#161b22] border border-slate-700 rounded text-center text-slate-200 font-mono"
          />
        </div>
      </div>

      {/* 3-Column Comparison: Vector Channel | Graph Channel | Fused Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Channel 1: Dense Vector Retrieval */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-200">Channel 1: Dense Vector (Qdrant)</h3>
          </div>

          <div className="space-y-2 font-mono">
            {vectorResults.map((item, idx) => (
              <div key={item.chunk_id} className="p-2.5 rounded bg-[#0b0f17] border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-cyan-300">Rank {idx + 1}: {item.chunk_id}</span>
                  <span className="text-slate-400">cos = {item.score.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans line-clamp-1">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel 2: Graph PPR Retrieval */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Network className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-200">Channel 2: Graph PPR Engine</h3>
          </div>

          <div className="space-y-2 font-mono">
            {graphPPRResults.map((item, idx) => (
              <div key={item.chunk_id} className="p-2.5 rounded bg-[#0b0f17] border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-indigo-300">Rank {idx + 1}: {item.chunk_id}</span>
                  <span className="text-slate-400">ppr = {item.score.toFixed(4)}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans line-clamp-1">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Combined: Reciprocal Rank Fusion Output */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-200">Chimera Hybrid Fusion (RRF)</h3>
          </div>

          <div className="space-y-2 font-mono">
            {fusedResults.map((item, idx) => (
              <div
                key={item.chunk_id}
                className={`p-2.5 rounded border space-y-1 transition-all ${
                  idx === 0
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-[#0b0f17] border-slate-800'
                }`}
              >
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-emerald-300">
                    #{idx + 1} {item.chunk_id}
                  </span>
                  <span className="text-slate-400 font-bold">RRF = {item.rrfScore.toFixed(5)}</span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                  <span>Vec: {item.vRank ? `#${item.vRank}` : 'None'}</span>
                  <span>&bull;</span>
                  <span>Graph: {item.gRank ? `#${item.gRank}` : 'None'}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-sans line-clamp-1">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
