import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SuburbSelect from '@/components/SuburbSelect';
import ExternalDealsForSuburb from '@/components/ExternalDealsForSuburb';
import ReportRentalButton from '@/components/ReportRentalButton';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Zap, Car, AlertTriangle, HelpCircle, Clock, Home, Shield, Filter, Share2, RefreshCw, Heart } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSavedSuburbs } from '@/hooks/useSavedSuburbs';
import { useAuth } from '@/hooks/useAuth';

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

const LOW_SAFETY_SUBURBS = new Set([
  'Khayelitsha', 'Mitchells Plain', 'Delft', 'Philippi', 'Manenberg',
  'Hanover Park', 'Lavender Hill', 'Bonteheuwel', 'Crossroads', 'Gugulethu',
  "Elsie's River", 'Ravensmead', 'Blue Downs', 'Mfuleni', 'Langa',
  'Heideveld', 'Lotus River', 'Athlone',
]);

const HIGH_SAFETY_SUBURBS = new Set([
  'Durbanville', 'Pinelands', 'Newlands', 'Constantia', 'Bishopscourt',
  'Claremont', 'Rondebosch', 'Tokai', 'Bergvliet', 'Welgemoed',
  'Plattekloof', 'Camps Bay', 'Clifton', 'Fresnaye',
]);

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getSafetyScore(pulses: PulseReport[], suburb: string): number {
  let score = LOW_SAFETY_SUBURBS.has(suburb) ? 2 : HIGH_SAFETY_SUBURBS.has(suburb) ? 4.2 : 3;
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const safetyPulses = pulses.filter(p => p.report_type === 'Safety');
  const recentPulses = safetyPulses.filter(p => now - new Date(p.created_at).getTime() < thirtyDays);
  const positiveWords = ['safe', 'clear', 'lekker', 'all clear', 'patrolling', 'watch active', 'quiet', 'family', 'secure', 'peaceful', 'friendly'];
  const negativeWords = ['break-in', 'dangerous', 'robbery', 'lights out', 'careful', 'crime', 'stolen', 'incidents', 'avoid', 'mugged', 'stabbing', 'shooting', 'hijack', 'burglary', 'unsafe'];
  recentPulses.forEach(p => {
    const lower = p.description.toLowerCase();
    const recencyWeight = (now - new Date(p.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 ? 0.5 : 0.3;
    if (positiveWords.some(w => lower.includes(w))) score += recencyWeight;
    if (negativeWords.some(w => lower.includes(w))) score -= recencyWeight;
  });
  return Math.max(1, Math.min(5, Math.round(score)));
}

function suburbToSlug(suburb: string): string {
  return suburb.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
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

function getSafetyColor(score: number): string {
  if (score >= 4) return 'text-sa-green';
  if (score >= 3) return 'text-sa-gold';
  return 'text-sa-red';
}

function getRentBadgeColor(rent: number, avg: number): string {
  if (avg === 0) return '';
  if (rent < avg * 0.85) return 'border-sa-green/40 bg-sa-green/5';
  if (rent > avg * 1.15) return 'border-sa-red/40 bg-sa-red/5';
  return 'border-border bg-card';
}

interface AreaExplorerProps {
  initialSuburb?: string;
}

type PriceRange = 'all' | 'under12k' | '12k-18k' | 'over18k';
type BedroomFilter = 'all' | '1' | '2' | '3+';

export default function AreaExplorer({ initialSuburb = '' }: AreaExplorerProps) {
  const [suburb, setSuburb] = useState(initialSuburb);
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [allPulses, setAllPulses] = useState<PulseReport[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [refreshingEskom, setRefreshingEskom] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [bedroomFilter, setBedroomFilter] = useState<BedroomFilter>('all');
  const [lekkerOnly, setLekkerOnly] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSaved, toggleSuburb } = useSavedSuburbs();

  const handleSaveSuburb = async () => {
    if (!user) {
      toast({ title: 'Sign in first', description: 'You need an account to save suburbs.' });
      return;
    }
    const nowSaved = await toggleSuburb(suburb);
    toast({ title: nowSaved ? 'Lekker!' : 'Removed', description: nowSaved ? `${suburb} saved to My Areas.` : `${suburb} removed from My Areas.` });
  };

  useEffect(() => {
    if (initialSuburb) setSuburb(initialSuburb);
  }, [initialSuburb]);

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

  const handleSuburbChange = (value: string) => {
    setSuburb(value);
    if (value) {
      navigate(`/area/${suburbToSlug(value)}`, { replace: true });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/area/${suburbToSlug(suburb)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Lekker!', description: 'Link copied — share it with your people!' });
    } catch {
      toast({ title: 'Link', description: url });
    }
  };

  const handleRefreshEskom = () => {
    setRefreshingEskom(true);
    setTimeout(() => {
      setRefreshingEskom(false);
      toast({ title: 'Sharp-sharp!', description: 'Eskom status refreshed.' });
    }, 800);
  };

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

  const allSuburbRentals = useMemo(() =>
    allRentals.filter(r => r.suburb === suburb).sort((a, b) => a.monthly_rent - b.monthly_rent),
    [allRentals, suburb]
  );

  const suburbAvgRent = useMemo(() => {
    if (allSuburbRentals.length === 0) return 0;
    return Math.round(allSuburbRentals.reduce((s, r) => s + r.monthly_rent, 0) / allSuburbRentals.length);
  }, [allSuburbRentals]);

  const suburbRentals = useMemo(() => {
    let filtered = [...allSuburbRentals];
    if (affordableOnly) filtered = filtered.filter(r => r.monthly_rent < 15000);
    if (priceRange === 'under12k') filtered = filtered.filter(r => r.monthly_rent < 12000);
    else if (priceRange === '12k-18k') filtered = filtered.filter(r => r.monthly_rent >= 12000 && r.monthly_rent <= 18000);
    else if (priceRange === 'over18k') filtered = filtered.filter(r => r.monthly_rent > 18000);
    if (bedroomFilter === '1') filtered = filtered.filter(r => r.bedrooms === 1);
    else if (bedroomFilter === '2') filtered = filtered.filter(r => r.bedrooms === 2);
    else if (bedroomFilter === '3+') filtered = filtered.filter(r => r.bedrooms >= 3);
    if (lekkerOnly && suburbAvgRent > 0) filtered = filtered.filter(r => r.monthly_rent < suburbAvgRent * 0.85);
    return filtered;
  }, [allSuburbRentals, affordableOnly, priceRange, bedroomFilter, lekkerOnly, suburbAvgRent]);

  const suburbPulses = useMemo(() =>
    allPulses.filter(p => p.suburb === suburb).slice(0, 10),
    [allPulses, suburb]
  );

  const trafficPulses = useMemo(() => suburbPulses.filter(p => p.report_type === 'Traffic'), [suburbPulses]);
  const powerPulses = useMemo(() => suburbPulses.filter(p => p.report_type === 'Power'), [suburbPulses]);

  const avgRent = suburbAvgRent;

  const safetyScore = useMemo(() => getSafetyScore(suburbPulses, suburb), [suburbPulses, suburb]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-heading mb-2">Area Explorer 🔍</h2>
          <p className="text-muted-foreground">Pick a suburb and get the full lowdown.</p>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock size={12} />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="max-w-md flex-1">
          <SuburbSelect value={suburb} onChange={handleSuburbChange} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <Switch id="affordable-explorer" checked={affordableOnly} onCheckedChange={setAffordableOnly} />
            <Label htmlFor="affordable-explorer" className="text-sm cursor-pointer flex items-center gap-1.5">
              <Filter size={14} className="text-sa-green" />
              Under R15,000 only
            </Label>
          </div>
          {suburb && (
            <>
              <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1.5">
                <Share2 size={14} />
                Share this area
              </Button>
              <Button
                variant={isSaved(suburb) ? 'default' : 'outline'}
                size="sm"
                onClick={handleSaveSuburb}
                className="flex items-center gap-1.5"
              >
                <Heart size={14} className={isSaved(suburb) ? 'fill-current' : ''} />
                {isSaved(suburb) ? 'Saved' : 'Save this suburb'}
              </Button>
            </>
          )}
        </div>
      </div>

      {loadingData && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Loading data...</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!loadingData && suburb && (
          <motion.div
            key={suburb}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Shield size={16} className={getSafetyColor(safetyScore)} /> Safety Score
                </div>
                <StarRating score={safetyScore} />
                <p className="text-xs text-muted-foreground mt-2">
                  {safetyScore >= 4 ? 'Lekker safe area! 💚' : safetyScore >= 3 ? 'Average — stay aware.' : 'Be careful out there! ⚠️'}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Zap size={16} /> Eskom Status
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={handleRefreshEskom}
                    disabled={refreshingEskom}
                  >
                    <RefreshCw size={12} className={refreshingEskom ? 'animate-spin' : ''} />
                  </Button>
                </div>
                <p className="text-lg font-heading font-bold text-sa-green">Stage 0 — No Load Shedding 🎉</p>
                <p className="text-xs text-muted-foreground mt-1">Reliable supply as of 16 April 2026</p>
                {powerPulses.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 italic">"{powerPulses[0].description}"</p>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Car size={16} /> Traffic Pulse
                </div>
                {trafficPulses.length > 0 ? (
                  <>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{trafficPulses[0].description}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock size={10} /> {formatTimeAgo(trafficPulses[0].created_at)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No traffic reports yet — share what you see! ☕</p>
                )}
              </div>
            </div>

            {/* Rental Filters */}
            <div>
              <h3 className="text-xl font-heading mb-3 flex items-center gap-2">
                <Home size={20} className="text-primary" />
                Rentals in {suburb}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                  {([['all', 'All'], ['under12k', '< R12k'], ['12k-18k', 'R12–18k'], ['over18k', '> R18k']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPriceRange(val as PriceRange)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${priceRange === val ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                  {([['all', 'Any bed'], ['1', '1 bed'], ['2', '2 bed'], ['3+', '3+ bed']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setBedroomFilter(val as BedroomFilter)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${bedroomFilter === val ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
                  <Switch id="lekker-only" checked={lekkerOnly} onCheckedChange={setLekkerOnly} />
                  <Label htmlFor="lekker-only" className="text-xs cursor-pointer whitespace-nowrap">Lekker Deals only 🔥</Label>
                </div>
              </div>
              {suburbRentals.length === 0 ? (
                <div className="bg-muted/50 rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No rentals listed yet — be the first! 🏠</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suburbRentals.map((r) => {
                    const colorClass = getRentBadgeColor(r.monthly_rent, avgRent);
                    const isLekker = avgRent > 0 && r.monthly_rent < avgRent * 0.85;
                    return (
                      <div key={r.id} className={`rounded-xl border-2 p-4 transition-shadow hover:shadow-md ${colorClass}`}>
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
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {formatTimeAgo(r.created_at)}</p>
                          <ReportRentalButton rentalId={r.id} />
                        </div>
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
                  <p className="text-muted-foreground">No reports for this area yet — share an update! ☕</p>
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

            {/* External Deals */}
            <ExternalDealsForSuburb suburb={suburb} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
