'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Brain, Briefcase, Ruler } from 'lucide-react';

interface OnboardingFormProps {
    onComplete: (data: any) => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: 'Alex Rivendell',
        structural: {
            age: 29,
            years_experience: 4,
            education: 'Stanford Dropout (CS)',
            capital_at_start: 150000,
        },
        behavioral: {
            conscientiousness: 0.94,
            openness: 0.88,
            extraversion: 0.45,
            agreeableness: 0.30,
            neuroticism: 0.22,
            risk_tolerance: 0.75,
            stress_capacity: 0.85,
        }
    });

    const nextStep = () => {
        if (step < 2) setStep(step + 1);
        else onComplete(formData);
    };

    const steps = [
        {
            title: "System Initialization",
            icon: <Briefcase size={20} />,
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase text-cyan-400 tracking-tighter">Founder Identy</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-3 mt-1 outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase text-cyan-400 tracking-tighter">Age</label>
                            <input
                                type="number"
                                value={formData.structural.age}
                                className="w-full bg-white/5 border border-white/10 p-3 mt-1 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-cyan-400 tracking-tighter">Experience (Yrs)</label>
                            <input
                                type="number"
                                value={formData.structural.years_experience}
                                className="w-full bg-white/5 border border-white/10 p-3 mt-1 outline-none"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Psychological Mapping",
            icon: <Brain size={20} />,
            content: (
                <div className="space-y-6">
                    {Object.entries(formData.behavioral).slice(0, 4).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between text-[10px] uppercase mb-1">
                                <span className="text-purple-400">{key.replace('_', ' ')}</span>
                                <span>{value * 100}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={value}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    behavioral: { ...formData.behavioral, [key]: parseFloat(e.target.value) }
                                })}
                                className="w-full accent-cyan-500"
                            />
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: "Scenario Parameters",
            icon: <Ruler size={20} />,
            content: (
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Adjust the risk exposure and stress capacity for the Monte Carlo simulation engine.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <div className="flex justify-between text-[10px] uppercase mb-1">
                                <span className="text-cyan-400">Risk Tolerance</span>
                                <span>{formData.behavioral.risk_tolerance * 100}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={formData.behavioral.risk_tolerance}
                                className="w-full accent-cyan-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] uppercase mb-1">
                                <span className="text-rose-400">Stress Capacity</span>
                                <span>{formData.behavioral.stress_capacity * 100}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={formData.behavioral.stress_capacity}
                                className="w-full accent-rose-500"
                            />
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="max-w-md mx-auto mission-control-panel p-8">
            <div className="scan-line" />

            <div className="flex items-center gap-3 mb-8">
                <div className="text-cyan-500">{steps[step].icon}</div>
                <div>
                    <h2 className="text-xs font-bold tracking-widest uppercase">Step {step + 1}: {steps[step].title}</h2>
                    <div className="flex gap-1 mt-1">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`h-1 w-8 ${i <= step ? 'bg-cyan-500' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[200px]"
                >
                    {steps[step].content}
                </motion.div>
            </AnimatePresence>

            <button
                onClick={nextStep}
                className="w-full mt-10 bg-white text-black font-bold py-3 text-xs uppercase hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2"
            >
                {step === 2 ? 'Run Simulation' : 'Continue'} <ChevronRight size={14} />
            </button>
        </div>
    );
}
