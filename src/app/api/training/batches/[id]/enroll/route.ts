import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEnrollmentEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// POST - Enroll students by email
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: batchId } = await params;
    const body = await request.json();
    const { emails, sendNotification = true } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails array required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify batch ownership and get access code
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id, title, access_code')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get instructor name
    let instructorName: string | undefined;
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      instructorName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0];
    } catch (e) {
      console.warn('Could not get instructor name:', e);
    }

    // Process each email
    const results = {
      enrolled: [] as string[],
      skipped: [] as string[],
      failed: [] as string[],
      emailsSent: 0,
      emailsFailed: 0
    };

    // Get base URL for access links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runbookforge.com';

    for (const email of emails) {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        results.failed.push(email);
        continue;
      }

      try {
        // Check if already enrolled
        const { data: existing } = await supabase
          .from('training_enrollments')
          .select('id')
          .eq('batch_id', batchId)
          .eq('student_email', cleanEmail)
          .single();

        if (existing) {
          results.skipped.push(cleanEmail);
          continue;
        }

        // Create enrollment
        const { data: enrollment, error } = await supabase
          .from('training_enrollments')
          .insert({
            batch_id: batchId,
            student_email: cleanEmail
          })
          .select('access_token')
          .single();

        if (error) throw error;
        results.enrolled.push(cleanEmail);

        // Send enrollment email
        if (sendNotification && enrollment) {
          const accessUrl = `${baseUrl}/training/${batch.access_code}?token=${enrollment.access_token}`;
          const emailResult = await sendEnrollmentEmail({
            studentEmail: cleanEmail,
            batchTitle: batch.title,
            accessUrl,
            instructorName
          });

          if (emailResult.success) {
            results.emailsSent++;
          } else {
            results.emailsFailed++;
            console.warn(`Failed to send email to ${cleanEmail}:`, emailResult.error);
          }
        }
      } catch (e) {
        console.error(`Failed to enroll ${email}:`, e);
        results.failed.push(cleanEmail);
      }
    }

    return NextResponse.json({
      message: `Enrolled ${results.enrolled.length} students${results.emailsSent > 0 ? `, sent ${results.emailsSent} emails` : ''}`,
      ...results
    });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 });
  }
}

// GET - List enrollments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: batchId } = await params;
    const supabase = getSupabaseAdmin();

    // Verify batch ownership
    const { data: batch } = await supabase
      .from('training_batches')
      .select('id')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const { data: enrollments, error } = await supabase
      .from('training_enrollments')
      .select('*')
      .eq('batch_id', batchId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(enrollments || []);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}
