import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SuburbSelect from '@/components/SuburbSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Zap, Car, AlertTriangle, HelpCircle, Clock, Home, Shield } from 'lucide-react';

interface Rental {
  id: string;
  suburb: string;
  monthly_rent: number;
  bedrooms: number;
  bathrooms: number;
  braai_friendly: boolean | null;
  near_myciti: boolean | null;
  loadshedding_friendly: boolean | null;
  notes: string | null;
  created_at: string;
}

interface PulseReport {
  id: string;
  suburb: string;
  report_type: string;
  description: string;
  created_at: string;
}

const PULSE_ICONS: Record<string, any> = {
  Traffic: Car,
  Safety: AlertTriangle,
  Power: Zap,
  Other: HelpCircle,
};

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getSafetyScore(pulses: PulseReport[]): number {
  const safetyPulses = pulses.filter(p => p.report_type === 'Safety');
  if (safetyPulses.length === 0) return 3; // neutral default
  // Simple heuristic: positive words = safe, negative = unsafe
  const positiveWords = ['safe', 'clear', 'lekker', 'all clear', 'patrolling', 'watch active'];
  const negativeWords = ['break-in', 'dangerous', 'robbery', 'lights out', 'careful', 'crime', 'stolen'];
  let score = 3;
  safetyPulses.forEach(p => {
    const lower = p.description.toLowerCase();
    if (positiveWords.some(w => lower.includes(w))) score += 0.5;
    if (negativeWords.some(w => lower.includes(w))) score -= 0.5;
  });
  return Math.max(1, Math.min(5, Math.round(score)));
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={18}
          className={i <= score ? 'text-sa-green fill-sa-green' : 'text-muted-foreground/30'}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-muted-foreground">{score}/5</span>
    </div>
  );
}

export default function AreaExplorer() {
  const [suburb, setSuburb] = useState('');
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [allPulses, setAllPulses] = useState<PulseReport[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAll();

    const rentalsSub = supabase.channel('explorer-rentals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, () => loadAll())
      .subscribe();
    const pulseSub = supabase.channel('explorer-pulse')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulse_reports' }, () => loadAll())
      .subscribe();

    return () => {
      supabase.removeChannel(rentalsSub);
      supabase.removeChannel(pulseSub);
    };
  }, []);

  const loadAll = async () => {
    const [rentalsRes, pulseRes] = await Promise.all([
      supabase.from('rentals').select('id, suburb, monthly_rent, bedrooms, bathrooms, braai_friendly, near_myciti, loadshedding_friendly, notes, created_at'),
      supabase.from('pulse_reports').select('*').order('created_at', { ascending: false }),
    ]);
    if (rentalsRes.data) setAllRentals(rentalsRes.data);
    if (pulseRes.data) setAllPulses(pulseRes.data);
    setLastUpdated(new Date());
    setLoadingData(false);
  };

  const suburbRentals = useMemo(() =>
    allRentals.filter(r => r.suburb === suburb).sort((a, b) => a.monthly_rent - b.monthly_rent),
    [allRentals, suburb]
  );

  const suburbPulses = useMemo(() =>
    allPulses.filter(p => p.suburb === suburb).slice(0, 10),
    [allPulses, suburb]
  );

  const avgRent = useMemo(() => {
    if (suburbRentals.length === 0) return 0;
    return Math.round(suburbRentals.reduce((s, r) => s + r.monthly_rent, 0) / suburbRentals.length);
  }, [suburbRentals]);

  const safetyScore = useMemo(() => getSafetyScore(suburbPulses), [suburbPulses]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-heading mb-2">Area Explorer 🔍</h2>
          <p className="text-muted-foreground">Pick a suburb and get the full lowdown, bru.</p>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock size={12} />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="max-w-md">
        <SuburbSelect value={suburb} onChange={setSuburb} />
      </div>

      <AnimatePresence mode="wait">
        {suburb && (
          <motion.div
            key={suburb}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Home size={16} /> Average Rent
                </div>
                <p className="text-3xl font-heading font-bold text-primary">
                  {suburbRentals.length > 0 ? `R${avgRent.toLocaleString()}/mo` : 'No data yet'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{suburbRentals.length} listing{suburbRentals.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Shield size={16} /> Safety Score
                </div>
                <StarRating score={safetyScore} />
                <p className="text-xs text-muted-foreground mt-2">
                  {safetyScore >= 4 ? 'Lekker safe area! 💚' : safetyScore >= 3 ? 'Average — stay sharp, bru.' : 'Be careful out there! ⚠️'}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Zap size={16} /> Load-shedding Status
                </div>
                <p className="text-lg font-heading font-bold text-sa-green">No load-shedding 🎉</p>
                <p className="text-xs text-muted-foreground mt-1">Eskom says we're all clear, sharp-sharp!</p>
              </div>
            </div>

            {/* Rentals List */}
            <div>
              <h3 className="text-xl font-heading mb-3 flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Rentals in {suburb}
              </h3>
              {suburbRentals.length === 0 ? (
                <div className="bg-muted/50 rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No rentals listed yet. Be the first, bru! 🏠</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suburbRentals.map((r) => {
                    const isLekker = avgRent > 0 && r.monthly_rent < avgRent * 0.85;
                    return (
                      <div key={r.id} className={`rounded-xl border-2 p-4 transition-shadow hover:shadow-md ${isLekker ? 'border-sa-green/40 bg-sa-green/5' : 'border-border bg-card'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-2xl font-heading font-bold">R{r.monthly_rent.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                          {isLekker && (
                            <span className="bg-sa-green text-primary-foreground text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                              LEKKER DEAL 🔥
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{r.bedrooms} bed • {r.bathrooms} bath</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.braai_friendly && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">🔥 Braai</span>}
                          {r.near_myciti && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">🚌 MyCiTi</span>}
                          {r.loadshedding_friendly && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">⚡ Inverter</span>}
                        </div>
                        {r.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.notes}</p>}
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock size={10} /> {formatTimeAgo(r.created_at)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pulse Reports */}
            <div>
              <h3 className="text-xl font-heading mb-3 flex items-center gap-2">
                <AlertTriangle size={20} className="text-sunset" />
                Recent Pulse in {suburb}
              </h3>
              {suburbPulses.length === 0 ? (
                <div className="bg-muted/50 rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No reports for this area yet. Drop some tea! ☕</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {suburbPulses.map((p) => {
                    const Icon = PULSE_ICONS[p.report_type] || HelpCircle;
                    return (
                      <div key={p.id} className="flex items-start gap-3 bg-card border border-border rounded-lg p-3">
                        <div className={`p-1.5 rounded-md ${
                          p.report_type === 'Safety' ? 'bg-sa-red/10 text-sa-red' :
                          p.report_type === 'Traffic' ? 'bg-sa-gold/10 text-sa-gold' :
                          p.report_type === 'Power' ? 'bg-ocean/10 text-ocean' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{p.report_type}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />{formatTimeAgo(p.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
