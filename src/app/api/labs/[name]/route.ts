import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const LAB_API_URL = process.env.LAB_API_URL || 'http://178.156.177.96:443';

// Get lab status
export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${LAB_API_URL}/labs/${params.name}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
    }

    const lab = await response.json();
    
    return NextResponse.json({
      ...lab,
      websocketUrl: `ws://${LAB_API_URL.replace('http://', '')}/terminal?pod=${params.name}`
    });
  } catch (error) {
    console.error('Error getting lab:', error);
    return NextResponse.json({ error: 'Failed to get lab' }, { status: 500 });
  }
}

// Delete lab
export async function DELETE(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${LAB_API_URL}/labs/${params.name}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete lab' }, { status: 500 });
    }

    return NextResponse.json({ status: 'deleted' });
  } catch (error) {
    console.error('Error deleting lab:', error);
    return NextResponse.json({ error: 'Failed to delete lab' }, { status: 500 });
  }
}

