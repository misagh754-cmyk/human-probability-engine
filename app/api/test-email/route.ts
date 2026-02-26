import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS
            auth: {
                user: 'misagh754@gmail.com',
                pass: process.env.SMTP_PASS || 'lqqnoolxcahfcdir'
            }
        });

        const info = await transporter.sendMail({
            from: '"HPE Rainmaker" <misagh754@gmail.com>',
            to: 'misagh754@gmail.com',
            subject: 'HPE: Render SMTP Test ✅',
            text: 'This email was sent from the Render server to bypass local network port blocks.',
            html: '<p>This email was sent from the Render server to bypass local network port blocks.</p>'
        });

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command
        }, { status: 500 });
    }
}
