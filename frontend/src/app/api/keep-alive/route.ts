import { NextResponse } from 'next/server';

// This API route is called by Vercel Cron every 14 minutes
// to keep the Render backend server awake and prevent cold starts

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mwarex-backend.onrender.com';

export async function GET() {
    const startTime = Date.now();

    try {
        // Ping the backend health endpoint
        const response = await fetch(`${BACKEND_URL}/api/v1/health`, {
            method: 'GET',
            headers: {
                'User-Agent': 'MwareX-KeepAlive-Cron/1.0',
            },
            // 30 second timeout to allow for cold start
            signal: AbortSignal.timeout(30000),
        });

        const data = await response.json();
        const duration = Date.now() - startTime;

        console.log(`[Keep-Alive] Backend pinged successfully in ${duration}ms`, data);

        return NextResponse.json({
            success: true,
            message: 'Backend is awake',
            duration: `${duration}ms`,
            backendStatus: data.status,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`[Keep-Alive] Failed to ping backend after ${duration}ms:`, error.message);

        return NextResponse.json({
            success: false,
            message: 'Failed to ping backend',
            error: error.message,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

// Vercel Cron configuration
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for cold start
