import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all categories (public)
export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('kb_categories')
      .select('*')
      .is('parent_id', null) // Get top-level first
      .order('sort_order');

    if (error) throw error;

    // Get subcategories
    const { data: subcategories } = await supabase
      .from('kb_categories')
      .select('*')
      .not('parent_id', 'is', null)
      .order('sort_order');

    // Nest subcategories under parents
    const categoriesWithSubs = categories?.map(cat => ({
      ...cat,
      subcategories: subcategories?.filter(sub => sub.parent_id === cat.id) || []
    }));

    // Get entry counts per category
    const { data: counts } = await supabase
      .from('kb_entries')
      .select('category_id')
      .eq('status', 'approved');

    const countMap = new Map<string, number>();
    counts?.forEach(entry => {
      if (entry.category_id) {
        countMap.set(entry.category_id, (countMap.get(entry.category_id) || 0) + 1);
      }
    });

    const categoriesWithCounts = categoriesWithSubs?.map(cat => ({
      ...cat,
      entry_count: countMap.get(cat.id) || 0,
      subcategories: cat.subcategories.map((sub: { id: string }) => ({
        ...sub,
        entry_count: countMap.get(sub.id) || 0
      }))
    }));

    return NextResponse.json(categoriesWithCounts || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
