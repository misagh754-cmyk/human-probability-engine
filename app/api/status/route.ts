import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const HEARTBEAT_FILE = '/tmp/hpe_heartbeat.json';

export async function GET() {
    try {
        if (!fs.existsSync(HEARTBEAT_FILE)) {
            return NextResponse.json({
                status: 'UNKNOWN',
                message: 'No heartbeat detected. Python engine may be offline or starting.',
                last_seen: null
            }, { status: 503 });
        }

        const data = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf8'));
        const lastSeen = new Date(data.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

        return NextResponse.json({
            status: diffMinutes < 60 ? 'HEALTHY' : 'STALE',
            engine_status: data.status,
            last_seen: data.timestamp,
            sent_count: data.sent_count,
            accounts_online: data.accounts_online || 1,
            daily_limit_combined: data.daily_limit_combined || 40,
            pacing_minutes: Math.round(diffMinutes)
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'ERROR',
            error: error.message
        }, { status: 500 });
    }
}
