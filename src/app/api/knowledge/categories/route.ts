import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - List all categories (public)
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: categories, error } = await supabase
      .from('kb_categories')
      .select('*')
      .is('parent_id', null)
      .order('sort_order');

    if (error) throw error;

    const { data: subcategories } = await supabase
      .from('kb_categories')
      .select('*')
      .not('parent_id', 'is', null)
      .order('sort_order');

    const categoriesWithSubs = categories?.map((cat: { id: string }) => ({
      ...cat,
      subcategories: subcategories?.filter((sub: { parent_id: string }) => sub.parent_id === cat.id) || []
    }));

    const { data: counts } = await supabase
      .from('kb_entries')
      .select('category_id')
      .eq('status', 'approved');

    const countMap = new Map<string, number>();
    counts?.forEach((entry: { category_id: string }) => {
      if (entry.category_id) {
        countMap.set(entry.category_id, (countMap.get(entry.category_id) || 0) + 1);
      }
    });

    const categoriesWithCounts = categoriesWithSubs?.map((cat: { id: string; subcategories: { id: string }[] }) => ({
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
