import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Globe, MapPin, Tag } from 'lucide-react';

interface ExternalListing {
  id: string;
  suburb: string;
  monthly_rent: number;
  bedrooms: number;
  description: string;
  source_name: string;
  source_url: string | null;
}

export default function ExternalDealsForSuburb({ suburb }: { suburb: string }) {
  const [listings, setListings] = useState<ExternalListing[]>([]);

  useEffect(() => {
    if (!suburb) return;
    supabase
      .from('external_listings')
      .select('*')
      .eq('suburb', suburb)
      .eq('is_active', true)
      .order('monthly_rent', { ascending: true })
      .then(({ data }) => {
        if (data) setListings(data as ExternalListing[]);
      });
  }, [suburb]);

  if (listings.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-heading mb-3 flex items-center gap-2">
        <Globe size={20} className="text-ocean" />
        More deals from the web in {suburb}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {listings.map((l) => (
          <div key={l.id} className="rounded-xl border-2 border-dashed border-ocean/30 bg-ocean/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe size={10} /> {l.source_name}
              </span>
              <span className="text-xs bg-ocean/10 text-ocean px-2 py-0.5 rounded-full font-medium">External</span>
            </div>
            <p className="text-xl font-heading font-bold">
              R{l.monthly_rent.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-sm text-muted-foreground">{l.bedrooms} bed</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.description}</p>
            {l.source_url && (
              <a
                href={l.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:underline"
              >
                View on {l.source_name} <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
