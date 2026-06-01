import topicsData from '@/constants/topics.json';
import { supabase } from '@/lib/supabase';
import type { TopicRow } from '@/types/database';

// ── Local helpers (used by legacy screens) ──────────────────────────────────

export function getCategoryLabels(): string[] {
  return topicsData.map((c) => c.label);
}

// ── Supabase-backed fetch ───────────────────────────────────────────────────

export async function fetchTopicsFromDB(): Promise<TopicRow[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('text');

  if (error || !data) return [];
  return data as TopicRow[];
}

// Human-readable label for a DB category key
export const CATEGORY_LABELS: Record<string, string> = {
  fun: 'Fun',
  lifestyle: 'Lifestyle',
  relationships: 'Relationships',
  philosophy: 'Philosophy',
  politics: 'Politics',
  tech: 'Tech',
  hot_takes: 'Hot Takes',
  would_you_rather: 'Would You Rather',
};

export const CATEGORY_COLORS: Record<string, string> = {
  fun: '#ffc83a',
  lifestyle: '#22D3EE',
  relationships: '#EC4899',
  philosophy: '#34D399',
  politics: '#A855F7',
  tech: '#3B82F6',
  hot_takes: '#F43F5E',
  would_you_rather: '#FF6B35',
};
