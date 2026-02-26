'use client';

import { motion } from 'framer-motion';

interface Node {
    id: string;
    label: string;
    type: string;
}

interface Edge {
    from: string;
    to: string;
    weight: number;
}

interface ScenarioTreeProps {
    data: {
        nodes: Node[];
        edges: Edge[];
    };
    isLocked?: boolean;
    onUnlock?: () => void;
}

export default function ScenarioTree({ data, isLocked = false, onUnlock }: ScenarioTreeProps) {
    return (
        <div className={`relative min-h-[400px] border border-cyan-500/20 p-6 overflow-hidden ${isLocked ? 'blur-md grayscale pointer-events-none' : ''}`}>
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />

            <div className="relative z-10 flex flex-col items-center gap-12">
                <h3 className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Scenario Path Mapping</h3>

                <div className="flex flex-wrap justify-center gap-8">
                    {data.nodes.map((node, i) => (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-4 border ${node.type === 'root' ? 'border-cyan-500' :
                                node.type === 'terminal' ? 'border-rose-500' : 'border-purple-500'
                                } mission-control-panel min-w-[150px] text-center`}
                        >
                            <div className="text-[10px] opacity-50 mb-1">{node.type.toUpperCase()}</div>
                            <div className="text-sm font-bold">{node.label}</div>
                        </motion.div>
                    ))}
                </div>

                <svg className="absolute inset-0 w-full h-full -z-10 opacity-20" style={{ pointerEvents: 'none' }}>
                    {/* Simple connections visualization */}
                    {data.edges.map((edge, i) => (
                        <motion.line
                            key={i}
                            x1="50%" y1="20%" x2="50%" y2="80%"
                            stroke="#00f5ff"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 1 }}
                        />
                    ))}
                </svg>
            </div>

            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-black/80 border border-cyan-500 p-8 text-center max-w-sm">
                        <h4 className="text-xl font-bold mb-4 glitch-text">RESTRICTED DATA</h4>
                        <p className="text-sm text-gray-400 mb-6 font-mono">
                            The complete Scenario Tree and deep behavioral insights are restricted to premium subscribers.
                        </p>
                        <button
                            onClick={onUnlock}
                            className="px-6 py-3 bg-cyan-500 text-black font-bold text-xs uppercase hover:bg-white transition-colors"
                        >
                            Unlock Deep Analysis - $199
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
