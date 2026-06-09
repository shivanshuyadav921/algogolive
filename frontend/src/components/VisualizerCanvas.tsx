'use client';

import React from 'react';
import { useVisualizerStore } from '@/store/visualizerStore';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualizerCanvasProps {
  type: 'array' | 'tree' | 'graph' | 'dp' | 'list';
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ type }) => {
  const { steps, currentStepIndex } = useVisualizerStore();
  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="h-[400px] flex items-center justify-center border border-dashed border-card-border rounded-xl bg-card">
        <p className="text-muted-foreground text-sm">Submit a problem to start visualization</p>
      </div>
    );
  }

  const { state, highlights } = currentStep;

  // Render sorting / searching arrays
  const renderArray = () => {
    // Check if state is a nested array object or direct array
    const list = Array.isArray(state) ? state : state.array || [];
    
    return (
      <div className="flex items-end justify-center gap-3 h-72 px-4">
        {list.map((val: number, idx: number) => {
          let color = 'bg-primary'; // default indigo
          
          if (highlights?.active?.includes(idx)) color = 'bg-accent-cyan';
          if (highlights?.comparing?.includes(idx)) color = 'bg-accent-amber animate-pulse';
          if (highlights?.swapping?.includes(idx)) color = 'bg-accent-rose';
          if (highlights?.sorted?.includes(idx)) color = 'bg-accent-emerald';

          const maxVal = Math.max(...list, 1);
          const heightPercent = `${Math.max((val / maxVal) * 100, 15)}%`;

          return (
            <div key={idx} className="flex flex-col items-center w-12 h-full justify-end">
              <motion.div
                layout
                style={{ height: heightPercent }}
                className={`w-full rounded-t-lg flex items-start justify-center pt-2 text-xs font-semibold text-white transition-colors duration-200 ${color}`}
              >
                {val}
              </motion.div>
              <span className="text-[10px] text-muted-foreground mt-2">i: {idx}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Trees (interactive SVG layout representation)
  const renderTree = () => {
    // Standard coordinates for drawing binary trees
    const nodes = [
      { id: 1, label: '10', x: 200, y: 50 },
      { id: 2, label: '5', x: 100, y: 130 },
      { id: 3, label: '15', x: 300, y: 130 },
      { id: 4, label: '3', x: 50, y: 210 },
      { id: 5, label: '7', x: 150, y: 210 },
    ];

    const edges = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
    ];

    return (
      <div className="flex justify-center items-center h-80">
        <svg className="w-full max-w-[400px] h-full" viewBox="0 0 400 260">
          {/* Edges */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from)!;
            const toNode = nodes.find(n => n.id === edge.to)!;
            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={2}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isVisited = highlights?.visited?.includes(node.id);
            const isActive = highlights?.active?.includes(node.id);
            
            let fill = 'fill-[#1e1b4b]';
            let stroke = 'stroke-[#6366f1]';
            if (isActive) { fill = 'fill-[#06b6d4]'; stroke = 'stroke-[#06b6d4]'; }
            else if (isVisited) { fill = 'fill-[#10b981]'; stroke = 'stroke-[#10b981]'; }

            return (
              <g key={node.id}>
                <motion.circle
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  className={`${fill} ${stroke} stroke-2 cursor-pointer transition-all duration-300`}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render Graphs (nodes with direct links)
  const renderGraph = () => {
    const nodes = [
      { id: 'A', x: 80, y: 150 },
      { id: 'B', x: 200, y: 70 },
      { id: 'C', x: 200, y: 230 },
      { id: 'D', x: 320, y: 150 },
    ];

    const edges = [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'C', weight: 1 },
      { from: 'C', to: 'B', weight: 2 },
      { from: 'B', to: 'D', weight: 3 },
      { from: 'C', to: 'D', weight: 5 },
    ];

    return (
      <div className="flex justify-center items-center h-80">
        <svg className="w-full max-w-[400px] h-full" viewBox="0 0 400 300">
          {/* Edge lines & weights */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from)!;
            const toNode = nodes.find(n => n.id === edge.to)!;
            return (
              <g key={idx}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={2}
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 5}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Node objects */}
          {nodes.map((node, idx) => {
            const isVisited = state.visited?.includes(node.id);
            const isActive = highlights?.active?.includes(idx);

            let fill = 'fill-[#1e1b4b]';
            let stroke = 'stroke-[#6366f1]';
            if (isActive) { fill = 'fill-[#06b6d4]'; stroke = 'stroke-[#06b6d4]'; }
            else if (isVisited) { fill = 'fill-[#10b981]'; stroke = 'stroke-[#10b981]'; }

            return (
              <g key={node.id}>
                <motion.circle
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  className={`${fill} ${stroke} stroke-2 transition-all duration-300`}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render Stacks / Queues / Lists
  const renderList = () => {
    const list = state.stack || state.queue || [];
    const name = state.stack ? 'Stack (LIFO)' : 'Queue (FIFO)';

    return (
      <div className="flex flex-col items-center justify-center h-80 gap-6">
        <h4 className="text-xs text-muted-foreground uppercase tracking-widest">{name}</h4>
        
        {state.stack ? (
          // Stack - vertical box accumulation
          <div className="border-2 border-slate-800 rounded-lg p-2 w-32 flex flex-col-reverse gap-2 bg-slate-950/40">
            {list.length === 0 ? (
              <div className="text-[10px] text-muted-foreground text-center py-4">Empty</div>
            ) : (
              list.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary border border-primary-hover p-2 rounded text-center text-xs font-semibold text-white"
                >
                  {item}
                </motion.div>
              ))
            )}
          </div>
        ) : (
          // Queue - horizontal lineup
          <div className="flex gap-2 border-2 border-slate-800 p-2 rounded-lg min-w-72 justify-center bg-slate-950/40">
            {list.length === 0 ? (
              <div className="text-[10px] text-muted-foreground py-2">Empty</div>
            ) : (
              list.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-accent-violet border border-purple-500 w-12 py-2 rounded text-center text-xs font-semibold text-white"
                >
                  {item}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Render DP Grid / Tabulation Tables
  const renderDpTable = () => {
    const grid = state.grid || [];
    
    return (
      <div className="flex flex-col items-center justify-center h-80 px-4">
        {grid.length === 0 ? (
          <p className="text-xs text-muted-foreground">Empty DP Table</p>
        ) : (
          <div className="grid gap-1.5 border border-card-border p-3 rounded-lg bg-slate-950/30">
            {grid.map((row: number[], rIdx: number) => (
              <div key={rIdx} className="flex gap-1.5">
                {row.map((val: number, cIdx: number) => {
                  let color = 'bg-[#11111b] border-slate-800 text-muted-foreground';
                  if (val > 0) color = 'bg-[#1e1b4b] border-indigo-900 text-indigo-200';
                  
                  return (
                    <div
                      key={cIdx}
                      className={`w-12 h-12 flex items-center justify-center border rounded text-xs font-mono font-semibold transition-all duration-300 ${color}`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Visualizer header */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest bg-slate-850 px-2.5 py-1 rounded-full border border-slate-800">
          Render: {type.toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
      </div>

      {/* Main Canvas rendering content */}
      <div className="flex-1 flex flex-col justify-center">
        {type === 'array' && renderArray()}
        {type === 'tree' && renderTree()}
        {type === 'graph' && renderGraph()}
        {type === 'list' && renderList()}
        {type === 'dp' && renderDpTable()}
      </div>

      {/* Explanation banner at bottom of canvas */}
      <div className="mt-6 border-t border-card-border pt-4">
        <p className="text-sm font-medium text-slate-200 leading-relaxed">
          {currentStep.explanation}
        </p>
      </div>
    </div>
  );
};
