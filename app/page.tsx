'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingForm from '@/components/OnboardingForm';
import RiskRadar from '@/components/RiskRadar';
import ScenarioTree from '@/components/ScenarioTree';
import { TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
    const [view, setView] = useState<'onboarding' | 'dashboard'>('onboarding');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const handleOnboardingComplete = async (data: any) => {
        setLoading(true);
        // In a real app, this calls the Python backend /api/v1/simulate
        // Simulation logic (mocked for frontend demo)
        setTimeout(() => {
            setPrediction({
                probabilities: {
                    financial_success: 0.68,
                    burnout_risk: 0.12,
                    first_year_failure: 0.22
                },
                radar: [
                    { trait: 'Conscientiousness', value: 94, fullMark: 100 },
                    { trait: 'Risk Tolerance', value: 75, fullMark: 100 },
                    { trait: 'Stress Capacity', value: 85, fullMark: 100 },
                    { trait: 'Openness', value: 88, fullMark: 100 },
                    { trait: 'Extraversion', value: 45, fullMark: 100 },
                ],
                scenario_tree: {
                    nodes: [
                        { id: 'start', label: 'Initial Concept', type: 'root' },
                        { id: 'yr1_active', label: 'Survival (Year 1)', type: 'milestone' },
                        { id: 'raised', label: 'Series A Secured', type: 'success' },
                        { id: 'burnout', label: 'Founder Burnout', type: 'terminal' }
                    ],
                    edges: [
                        { from: 'start', to: 'yr1_active', weight: 0.78 },
                        { from: 'yr1_active', to: 'raised', weight: 0.68 }
                    ]
                }
            });
            setLoading(false);
            setView('dashboard');
        }, 2000);
    };

    const handleUnlock = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', { method: 'POST' });
            const { url, error } = await res.json();

            if (error) {
                alert(`Checkout Error: ${error}`);
                return;
            }

            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            console.error("Stripe Redirect Failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Human Probability Engine<span className="text-cyan-500 ml-2 text-[10px] border border-cyan-500/30 px-1 rounded">V2.1-LIVE</span>
                        </h1>
                    </div>
                    <div className="flex gap-8 text-[10px] items-center text-gray-500">
                        <div className="flex flex-col items-end">
                            <span className="uppercase tracking-widest opacity-50">Iterations</span>
                            <span className="text-white font-bold">10k+</span>
                        </div>
                        <div className="flex flex-col items-end border-l border-white/10 pl-8">
                            <span className="uppercase tracking-widest opacity-50">Status</span>
                            <span className="text-cyan-500 font-bold animate-pulse">SYSTEM LIVE</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20 px-6">
                <AnimatePresence mode="wait">
                    {view === 'onboarding' ? (
                        <motion.div
                            key="onboarding"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            {loading ? (
                                <div className="max-w-md mx-auto text-center space-y-8 py-20">
                                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
                                    <p className="text-xs uppercase tracking-widest text-cyan-500 animate-pulse">Running Monte Carlo Simulations...</p>
                                </div>
                            ) : (
                                <OnboardingForm onComplete={handleOnboardingComplete} />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-7xl mx-auto grid grid-cols-12 gap-8"
                        >
                            {/* Left Column: Probabilities */}
                            <div className="col-span-12 lg:col-span-4 space-y-8">
                                <div className="mission-control-panel p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                    <h2 className="text-xs font-bold text-cyan-400 mb-6 flex items-center gap-2">
                                        <TrendingUp size={14} /> PROBABILITY MATRIX
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-2 uppercase text-slate-400">
                                                <span>Financial Success (3 Yr)</span>
                                                <span className="text-cyan-500">{Math.round(prediction.probabilities.financial_success * 100)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${prediction.probabilities.financial_success * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[10px] mb-2 uppercase text-slate-400">
                                                <span>Burnout Risk Index</span>
                                                <span className="text-rose-500">{Math.round(prediction.probabilities.burnout_risk * 100)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${prediction.probabilities.burnout_risk * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                                        <div className="text-[10px] text-cyan-500 uppercase font-bold mb-2">System Insights</div>
                                        <p className="text-xs text-slate-400 leading-relaxed italic">
                                            "High conscientiousness (0.94) acts as a structural defense against the calculated 22% early failure risk."
                                        </p>
                                    </div>
                                </div>

                                <div className="mission-control-panel p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                    <h2 className="text-xs font-bold text-cyan-400 mb-6 flex items-center gap-2">
                                        <ShieldCheck size={14} /> RISK RADAR
                                    </h2>
                                    <RiskRadar data={prediction.radar} />
                                </div>
                            </div>

                            {/* Center/Right Column: Scenario Tree */}
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                <div className="mission-control-panel p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                                            <Zap size={14} /> SCENARIO TREE ANALYSIS
                                        </h2>
                                        {!isUnlocked && (
                                            <button
                                                onClick={handleUnlock}
                                                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-bold uppercase hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
                                            >
                                                Deep Scale Analysis ($199)
                                            </button>
                                        )}
                                    </div>

                                    <ScenarioTree data={prediction.scenario_tree} isLocked={!isUnlocked} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-slate-900/50 border-l-4 border-rose-500 rounded-r-2xl border-y border-r border-white/5">
                                        <AlertTriangle className="text-rose-500 mb-4" size={20} />
                                        <h3 className="text-xs font-bold uppercase mb-2 text-white">Critical Failure Point</h3>
                                        <p className="text-xs text-slate-400">Month 8: Projected Capital Depletion (0.22 prob)</p>
                                    </div>
                                    <div className="p-6 bg-slate-900/50 border-l-4 border-cyan-500 rounded-r-2xl border-y border-r border-white/5">
                                        <ShieldCheck className="text-cyan-500 mb-4" size={20} />
                                        <h3 className="text-xs font-bold uppercase mb-2 text-white">Mitigation Path</h3>
                                        <p className="text-xs text-slate-400">Early Pivot (Month 6) reduces burnout risk by 40%.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer HUD */}
            <footer className="fixed bottom-0 w-full border-t border-white/5 p-4 bg-slate-950/80 backdrop-blur-xl text-[10px] text-slate-500 flex justify-between px-8 z-50">
                <div className="flex gap-6">
                    <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-cyan-500" /> MISSION: HPE ALPHA</span>
                    <span className="flex items-center gap-1.5 opacity-50">UPLINK: SECURE</span>
                </div>
                <div className="flex gap-6">
                    <span className="text-cyan-500/80 uppercase tracking-widest font-medium">Human Probability Engine v2.1.0</span>
                    <span className="opacity-50 tracking-tighter">BUILD_HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
            </footer>
        </div>
    );
}
}
