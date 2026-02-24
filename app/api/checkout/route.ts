import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-11-preview' as any,
});

export async function POST() {
    try {
        const body = {
            price_amount: 99,
            price_currency: 'usd',
            pay_currency: 'usdttrc20', // Default, user can change on gateway
            order_id: `HPE_${Date.now()}`,
            order_description: 'HPE Deep Analytics Pass',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
            is_fiat: true, // This enables the "Pay with Card" feature
        };

        const response = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (data.invoice_url) {
            return NextResponse.json({ url: data.invoice_url });
        }

        throw new Error(data.message || 'Failed to create payment');
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
