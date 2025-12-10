import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

const LAB_API_URL = process.env.LAB_API_URL || 'http://178.156.177.96:443';

// Get user identifier (either from Clerk or session)
async function getUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (userId) return userId.substring(0, 8);
  } catch {
    // Not logged in via Clerk
  }
  
  // For students, use a session-based ID
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('lab_session_id')?.value;
  
  if (!sessionId) {
    // Generate a random session ID for this student
    sessionId = Math.random().toString(36).substring(2, 10);
  }
  
  return sessionId;
}

// List all labs for the current user
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const response = await fetch(`${LAB_API_URL}/labs`);
    const labs = await response.json();

    // Filter labs for current user
    const userLabs = Array.isArray(labs) 
      ? labs.filter((lab: { name: string }) => lab.name.includes(userId))
      : [];

    return NextResponse.json(userLabs);
  } catch (error) {
    console.error('Error listing labs:', error);
    return NextResponse.json({ error: 'Failed to list labs' }, { status: 500 });
  }
}

// Create a new lab
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const body = await req.json();
    const { template = 'postgresql', labId } = body;

    console.log('Creating lab:', { template, userId, labId });

    const response = await fetch(`${LAB_API_URL}/labs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template,
        userId,
        labId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lab API error:', errorText);
      return NextResponse.json({ error: 'Failed to create lab' }, { status: 500 });
    }

    const lab = await response.json();
    console.log('Lab created:', lab);
    
    // Set session cookie for students
    const res = NextResponse.json({
      ...lab,
      websocketUrl: `ws://${LAB_API_URL.replace('http://', '').replace(':443', ':443')}/terminal?pod=${lab.podName}`
    });
    
    res.cookies.set('lab_session_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    
    return res;
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json({ error: 'Failed to create lab' }, { status: 500 });
  }
}

