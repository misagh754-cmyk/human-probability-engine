import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Ensure we have a valid absolute base URL
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://human-probability-enginehuman.onrender.com').replace(/\/$/, '');

        const body = {
            price_amount: 199,
            price_currency: 'usd',
            pay_currency: 'usdttrc20',
            order_id: `HPE_${Date.now()}`,
            order_description: 'HPE Deep Analytics Pass',
            success_url: `${baseUrl}/dashboard?success=true`,
            cancel_url: `${baseUrl}/dashboard?canceled=true`,
        };

        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
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

        console.error('NOWPayments Error:', data);
        throw new Error(data.message || 'Failed to create payment link');
    } catch (err: any) {
        console.error('Checkout API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
