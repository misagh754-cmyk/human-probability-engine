import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { founderData } = body;

        // In a real scenario, we would call the Python AI Engine here.
        // For this prototype, we implement the core math logic directly.

        const { structural, behavioral } = founderData;

        // Core Formula (Simplified for Phase 1)
        // Success = (Conscientiousness * 0.4) + (Risk Tolerance * 0.2) + (Stress Capacity * 0.3) + (Exp Factor * 0.1)

        const experienceFactor = Math.min(structural.years_experience / 10, 1);
        const psychologicalScore =
            (behavioral.big_five.conscientiousness * 0.4) +
            (behavioral.risk_tolerance * 0.2) +
            (behavioral.stress_capacity * 0.3) +
            (experienceFactor * 0.1);

        // Failure Factors
        const burnoutRisk = (behavioral.big_five.neuroticism * 0.6) + (1 - behavioral.stress_capacity) * 0.4;
        const cashOutRisk = structural.capital_at_start < 50000 ? 0.6 : 0.2;

        const prediction = {
            success_series_a: Math.round(psychologicalScore * 100) / 100,
            failure_burnout: Math.round(burnoutRisk * 100) / 100,
            failure_cash_out: Math.round(cashOutRisk * 100) / 100,
            timestamp: new Date().toISOString(),
        };

        // Store the request in DB (Audit Log)
        // Note: We'd normally create the founder record first if it doesn't exist
        // For this MVP, we just return the calculation

        return NextResponse.json({ prediction });
    } catch (error) {
        console.error('Prediction Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
