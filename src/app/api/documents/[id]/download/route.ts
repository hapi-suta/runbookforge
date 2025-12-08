import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { generatePPTXBuffer, PresentationData } from '@/lib/pptx-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch document
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if it's a PPTX document
    if (doc.file_type !== 'pptx') {
      return NextResponse.json({ error: 'Not a presentation file' }, { status: 400 });
    }

    // Build presentation data from metadata
    const presentationData: PresentationData = {
      title: doc.title,
      subtitle: doc.metadata?.style ? `${doc.metadata.style.charAt(0).toUpperCase() + doc.metadata.style.slice(1)} Presentation` : undefined,
      author: 'RunbookForge',
      organization: 'STEPUP TECH ACADEMY (SUTA)',
      slides: doc.metadata?.slides || []
    };

    // Generate PPTX buffer
    const buffer = await generatePPTXBuffer(presentationData);
    
    // Convert buffer to Uint8Array for Response
    const uint8Array = new Uint8Array(buffer);

    // Return as downloadable file
    const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8Array.length.toString()
      }
    });

  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ 
      error: 'Failed to download document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
