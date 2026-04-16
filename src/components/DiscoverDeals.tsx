import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Tag, Globe, Clock } from 'lucide-react';

interface ExternalListing {
  id: string;
  suburb: string;
  monthly_rent: number;
  bedrooms: number;
  description: string;
  source_name: string;
  source_url: string | null;
  created_at: string;
}

export default function DiscoverDeals() {
  const [listings, setListings] = useState<ExternalListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('external_listings')
      .select('*')
      .eq('is_active', true)
      .order('monthly_rent', { ascending: true })
      .then(({ data }) => {
        if (data) setListings(data as ExternalListing[]);
        setLoading(false);
      });
  }, []);

  const overallAvg = listings.length > 0
    ? listings.reduce((s, l) => s + l.monthly_rent, 0) / listings.length
    : 0;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-heading mb-2">Discover More Deals 🔍🏠</h2>
        <p className="text-muted-foreground">
          Yoh, found some lekker deals from around the web!
        </p>
        <div className="mt-3 bg-muted/50 border border-border rounded-lg p-3 flex items-start gap-2">
          <Globe size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Crowdsourced from locals + highlights from Property24 & Facebook groups (updated April 2026).
            These are external listings — always verify with the original source.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l, i) => {
            const isAffordable = l.monthly_rent < overallAvg * 0.9;
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border-2 p-5 transition-shadow hover:shadow-lg ${
                  isAffordable
                    ? 'border-sa-green/40 bg-sa-green/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-1 text-muted-foreground">
                    <MapPin size={14} /> {l.suburb}
                  </span>
                  {isAffordable && (
                    <span className="bg-sa-green text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag size={10} /> LEKKER AFFORDABLE
                    </span>
                  )}
                </div>

                <p className="text-2xl font-heading font-bold text-primary">
                  R{l.monthly_rent.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">{l.bedrooms} bed</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{l.description}</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe size={10} /> {l.source_name}
                  </span>
                  {l.source_url && (
                    <a
                      href={l.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-ocean hover:underline flex items-center gap-1"
                    >
                      View Original <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
