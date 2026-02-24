import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-11-preview' as any,
});

export async function POST() {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'HPE Deep Analytics Pass',
                            description: 'Unlock 10,000-iteration Monte Carlo Simulation & Scenario Tree',
                        },
                        unit_amount: 9900,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
