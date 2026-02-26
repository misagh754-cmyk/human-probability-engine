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
        <div className="min-h-screen">
            {/* HUD Header */}
            <header className="border-b border-cyan-500/20 p-4 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-cyan-500 flex items-center justify-center">
                        <div className="w-4 h-4 bg-cyan-500 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-widest text-white uppercase glitch-text">HPE: Mission Control</h1>
                        <div className="text-[10px] text-cyan-500/60 uppercase">System Status: {loading ? 'CALCULATING...' : 'READY'}</div>
                    </div>
                </div>

                <div className="flex gap-8 text-[10px] items-center text-gray-500">
                    <div className="flex flex-col items-end">
                        <span className="uppercase tracking-widest">Simulation Iterations</span>
                        <span className="text-white font-bold">10,000.00</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="uppercase tracking-widest">Niche Index</span>
                        <span className="text-white font-bold">STARTUP_V1</span>
                    </div>
                </div>
            </header>

            <main className="p-8">
                <AnimatePresence mode="wait">
                    {view === 'onboarding' ? (
                        <motion.div
                            key="onboarding"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-12"
                        >
                            {loading ? (
                                <div className="max-w-md mx-auto text-center space-y-8">
                                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
                                    <p className="text-xs uppercase tracking-widest animate-pulse">Running Monte Carlo Simulations...</p>
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
                            className="grid grid-cols-12 gap-8"
                        >
                            {/* Left Column: Probabilities */}
                            <div className="col-span-12 lg:col-span-4 space-y-8">
                                <div className="mission-control-panel p-6">
                                    <div className="scan-line" />
                                    <h2 className="text-xs font-bold text-cyan-400 mb-6 flex items-center gap-2">
                                        <TrendingUp size={14} /> PROBABILITY MATRIX
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-2 uppercase">
                                                <span>Financial Success (3 Yr)</span>
                                                <span className="text-cyan-500">{prediction.probabilities.financial_success * 100}%</span>
                                            </div>
                                            <div className="h-4 bg-white/5 border border-white/10 p-1">
                                                <motion.div
                                                    className="h-full bg-cyan-500 shadow-[0_0_10px_#00f5ff]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${prediction.probabilities.financial_success * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[10px] mb-2 uppercase">
                                                <span>Burnout Risk Index</span>
                                                <span className="text-rose-500">{prediction.probabilities.burnout_risk * 100}%</span>
                                            </div>
                                            <div className="h-4 bg-white/5 border border-white/10 p-1">
                                                <motion.div
                                                    className="h-full bg-rose-500 shadow-[0_0_10px_#ff003c]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${prediction.probabilities.burnout_risk * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-cyan-500/5 border border-cyan-500/20">
                                        <div className="text-[10px] text-cyan-500 uppercase font-bold mb-2">System Insights</div>
                                        <p className="text-xs text-gray-400 leading-relaxed italic">
                                            "High conscientiousness (0.94) acts as a structural defense against the calculated 22% early failure risk."
                                        </p>
                                    </div>
                                </div>

                                <div className="mission-control-panel p-6">
                                    <h2 className="text-xs font-bold text-cyan-400 mb-6 flex items-center gap-2">
                                        <ShieldCheck size={14} /> RISK RADAR
                                    </h2>
                                    <RiskRadar data={prediction.radar} />
                                </div>
                            </div>

                            {/* Center/Right Column: Scenario Tree */}
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                <div className="mission-control-panel p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                                            <Zap size={14} /> SCENARIO TREE ANALYSIS
                                        </h2>
                                        {!isUnlocked && (
                                            <button
                                                onClick={handleUnlock}
                                                className="px-4 py-2 border border-cyan-500 text-cyan-500 text-[10px] uppercase hover:bg-cyan-500 hover:text-black transition-all"
                                            >
                                                Deep Scale Analysis ($199)
                                            </button>
                                        )}
                                    </div>

                                    <ScenarioTree data={prediction.scenario_tree} isLocked={!isUnlocked} />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="mission-control-panel p-6 border-l-rose-500">
                                        <AlertTriangle className="text-rose-500 mb-4" size={20} />
                                        <h3 className="text-[10px] font-bold uppercase mb-2">Critical Failure Point</h3>
                                        <p className="text-xs text-gray-500">Month 8: Projected Capital Depletion (0.22 prob)</p>
                                    </div>
                                    <div className="mission-control-panel p-6 border-l-cyan-500">
                                        <ShieldCheck className="text-cyan-500 mb-4" size={20} />
                                        <h3 className="text-[10px] font-bold uppercase mb-2">Mitigation Path</h3>
                                        <p className="text-xs text-gray-500">Early Pivot (Month 6) reduces burnout risk by 40%.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer HUD */}
            <footer className="fixed bottom-0 w-full border-t border-white/5 p-2 bg-black/80 backdrop-blur-md text-[9px] text-gray-600 flex justify-between px-8 z-50">
                <div className="flex gap-4">
                    <span>LAT: 37.7749 N</span>
                    <span>LNG: 122.4194 W</span>
                    <span className="text-green-500 animate-pulse">UPSTREAM: CONFIGURED</span>
                </div>
                <div>
                    <span>HUMAN PROBABILITY ENGINE V1.0.4-STABLE</span>
                </div>
            </footer>
        </div>
    );
}
