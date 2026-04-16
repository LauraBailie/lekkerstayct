import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSavedSuburbs() {
  const { user } = useAuth();
  const [savedSuburbs, setSavedSuburbs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setSavedSuburbs([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('saved_suburbs')
      .select('suburb')
      .order('created_at', { ascending: false });
    setSavedSuburbs(data?.map(d => d.suburb) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleSuburb = useCallback(async (suburb: string) => {
    if (!user) return false;
    const isSaved = savedSuburbs.includes(suburb);
    if (isSaved) {
      await supabase.from('saved_suburbs').delete().eq('user_id', user.id).eq('suburb', suburb);
      setSavedSuburbs(prev => prev.filter(s => s !== suburb));
    } else {
      await supabase.from('saved_suburbs').insert({ user_id: user.id, suburb });
      setSavedSuburbs(prev => [suburb, ...prev]);
    }
    return !isSaved;
  }, [user, savedSuburbs]);

  const isSaved = useCallback((suburb: string) => savedSuburbs.includes(suburb), [savedSuburbs]);

  return { savedSuburbs, loading, toggleSuburb, isSaved, reload: load };
}
