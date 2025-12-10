import { NextRequest, NextResponse } from 'next/server';

const LAB_API_URL = process.env.LAB_API_URL || 'http://178.156.177.96:443';

// Get lab status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    
    console.log('Getting lab status for:', name);

    const response = await fetch(`${LAB_API_URL}/labs/${name}`);
    
    if (!response.ok) {
      console.log('Lab not found:', name);
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
    }

    const lab = await response.json();
    console.log('Lab status:', lab);
    
    return NextResponse.json({
      ...lab,
      websocketUrl: `ws://${LAB_API_URL.replace('http://', '').replace(':443', ':443')}/terminal?pod=${name}`
    });
  } catch (error) {
    console.error('Error getting lab:', error);
    return NextResponse.json({ error: 'Failed to get lab' }, { status: 500 });
  }
}

// Delete lab
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    
    console.log('Deleting lab:', name);

    const response = await fetch(`${LAB_API_URL}/labs/${name}`, {
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
