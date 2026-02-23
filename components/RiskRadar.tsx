'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RiskRadarProps {
    data: {
        trait: string;
        value: number;
        fullMark: number;
    }[];
}

export default function RiskRadar({ data }: RiskRadarProps) {
    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#00f5ff', fontSize: 10 }} />
                    <Radar
                        name="Founder Profile"
                        dataKey="value"
                        stroke="#bc13fe"
                        fill="#bc13fe"
                        fillOpacity={0.6}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
