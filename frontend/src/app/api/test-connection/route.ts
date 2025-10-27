import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test backend connection
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:6000/api';

    const response = await fetch(`${backendUrl.replace('/api', '')}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable SSL verification for development
      // @ts-ignore
      rejectUnauthorized: false,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const healthData = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Frontend-backend connection successful',
      data: {
        frontend: {
          url: request.url,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
        backend: {
          url: backendUrl,
          health: healthData,
        },
      },
    });
  } catch (error) {
    console.error('Connection test failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Frontend-backend connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          frontend: {
            url: request.url,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
          },
          backend: {
            url: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:6000/api',
          },
        },
      },
      { status: 500 }
    );
  }
}
