import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const LAB_API_URL = process.env.LAB_API_URL || 'http://178.156.177.96:443';

// List all labs for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${LAB_API_URL}/labs`);
    const labs = await response.json();

    // Filter labs for current user
    const userLabs = labs.filter((lab: { name: string }) => 
      lab.name.includes(userId.substring(0, 8))
    );

    return NextResponse.json(userLabs);
  } catch (error) {
    console.error('Error listing labs:', error);
    return NextResponse.json({ error: 'Failed to list labs' }, { status: 500 });
  }
}

// Create a new lab
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { template = 'postgresql', labId } = body;

    const response = await fetch(`${LAB_API_URL}/labs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template,
        userId: userId.substring(0, 8), // Shorten for label compatibility
        labId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error || 'Failed to create lab' }, { status: 500 });
    }

    const lab = await response.json();
    
    return NextResponse.json({
      ...lab,
      websocketUrl: `ws://${LAB_API_URL.replace('http://', '')}/terminal?pod=${lab.podName}`
    });
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json({ error: 'Failed to create lab' }, { status: 500 });
  }
}

