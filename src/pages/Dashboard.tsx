import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSavedSuburbs } from '@/hooks/useSavedSuburbs';
import Layout from '@/components/Layout';
import AreaExplorer from '@/components/AreaExplorer';
import DiscoverDeals from '@/components/DiscoverDeals';
import { SUBURB_GROUPS } from '@/lib/suburbs';
import { motion } from 'framer-motion';
import { Car, AlertTriangle, Zap, HelpCircle, TrendingDown, PlusCircle, Radio, MapPin, Clock, Globe, Filter, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import heroImage from '@/assets/cape-town-hero.jpg';

interface SuburbAvg {
  suburb: string;
  avg_rent: number;
  count: number;
}

interface PulseReport {
  id: string;
  suburb: string;
  report_type: string;
  description: string;
  created_at: string;
}

interface Rental {
  id: string;
  suburb: string;
  monthly_rent: number;
  bedrooms: number;
  created_at: string;
}

const PULSE_ICONS: Record<string, any> = {
  Traffic: Car,
  Safety: AlertTriangle,
  Power: Zap,
  Other: HelpCircle,
};

function getRentColor(avg: number): string {
  if (avg < 6000) return 'bg-sa-green/20 border-sa-green text-sa-green';
  if (avg < 10000) return 'bg-sa-gold/20 border-sa-gold text-sa-gold';
  if (avg < 16000) return 'bg-sunset/20 border-sunset text-sunset';
  return 'bg-sa-red/20 border-sa-red text-sa-red';
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { savedSuburbs } = useSavedSuburbs();
  const [suburbAvgs, setSuburbAvgs] = useState<SuburbAvg[]>([]);
  const [pulseReports, setPulseReports] = useState<PulseReport[]>([]);
  const [cheapRentals, setCheapRentals] = useState<Rental[]>([]);
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [allPulses, setAllPulses] = useState<PulseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [affordableOnly, setAffordableOnly] = useState(false);
  useEffect(() => {
    loadData();

    // Real-time subscriptions
    const rentalsSub = supabase.channel('rentals-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rentals' }, () => loadData())
      .subscribe();

    const pulseSub = supabase.channel('pulse-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pulse_reports' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(rentalsSub);
      supabase.removeChannel(pulseSub);
    };
  }, []);

  const loadData = async () => {
    const [rentalsRes, pulseRes] = await Promise.all([
      supabase.from('rentals').select('suburb, monthly_rent, bedrooms, id, created_at'),
      supabase.from('pulse_reports').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (rentalsRes.data) {
      // Compute averages by suburb
      const map: Record<string, { total: number; count: number }> = {};
      rentalsRes.data.forEach((r) => {
        if (!map[r.suburb]) map[r.suburb] = { total: 0, count: 0 };
        map[r.suburb].total += r.monthly_rent;
        map[r.suburb].count += 1;
      });
      const avgs = Object.entries(map).map(([suburb, { total, count }]) => ({
        suburb,
        avg_rent: Math.round(total / count),
        count,
      }));
      setSuburbAvgs(avgs);

      // Find cheap rentals (below average in their suburb)
      const cheap = rentalsRes.data
        .filter(r => {
          const avg = map[r.suburb];
          return avg && r.monthly_rent < avg.total / avg.count * 0.85;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setCheapRentals(cheap);
    }

    if (pulseRes.data) setPulseReports(pulseRes.data);
    setLastUpdated(new Date());
    setLoading(false);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <img src={heroImage} alt="Cape Town skyline" width={1920} height={640} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading text-primary-foreground mb-4"
          >
            Howzit! 🤙
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-primary-foreground/80 mb-8"
          >
            What's happening in the Mother City today?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/submit-rental" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-foreground text-ocean font-bold hover:opacity-90 transition-opacity">
              <PlusCircle size={20} />
              Submit Your Rental
            </Link>
            <Link to="/submit-pulse" className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-sunset text-accent-foreground font-bold hover:opacity-90 transition-opacity">
              <Radio size={20} />
              Drop the Tea
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-12">
        <Tabs defaultValue="explorer" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="explorer" className="flex items-center gap-1.5">
              <MapPin size={14} /> Area Explorer
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-1.5">
              <Globe size={14} /> Discover More
            </TabsTrigger>
          </TabsList>
          <TabsContent value="explorer">
            <AreaExplorer />
          </TabsContent>
          <TabsContent value="discover">
            <DiscoverDeals />
          </TabsContent>
        </Tabs>

        {/* Affordability Heat Map */}
        <section>
          <div className="flex items-end justify-between mb-2">
            <h2 className="text-2xl md:text-3xl font-heading">Affordability Heat Map 🗺️</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} />Updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 mb-6 w-fit">
            <Switch id="affordable-dashboard" checked={affordableOnly} onCheckedChange={setAffordableOnly} />
            <Label htmlFor="affordable-dashboard" className="text-sm cursor-pointer flex items-center gap-1.5">
              <Filter size={14} className="text-sa-green" />
              Under R15,000 only
            </Label>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : suburbAvgs.filter(s => !affordableOnly || s.avg_rent < 15000).length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground text-lg">{affordableOnly ? 'No suburbs under R15,000 yet! 😅' : 'No data yet — be the first to submit. 🏠'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {suburbAvgs.filter(s => !affordableOnly || s.avg_rent < 15000).sort((a, b) => a.avg_rent - b.avg_rent).map((s, i) => (
                <Link
                  to={`/area/${s.suburb.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`}
                  key={s.suburb}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-xl border-2 p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all ${getRentColor(s.avg_rent)}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={14} />
                      <span className="text-xs font-semibold truncate">{s.suburb}</span>
                    </div>
                    <p className="text-xl font-heading font-bold">R{s.avg_rent.toLocaleString()}</p>
                    <p className="text-xs opacity-70">{s.count} listing{s.count > 1 ? 's' : ''}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Fair Price Alerts */}
        {cheapRentals.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-heading mb-2 flex items-center gap-2">
              <TrendingDown className="text-sa-green" />
              Lekker Deals Alert! 🔥
            </h2>
            <p className="text-muted-foreground mb-4">These spots are 15%+ below average — lekker finds!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cheapRentals.map((r) => (
                <Link
                  key={r.id}
                  to={`/area/${r.suburb.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`}
                  className="bg-sa-green/10 border-2 border-sa-green/30 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-sa-green flex items-center gap-1">
                      <MapPin size={14} /> {r.suburb}
                    </span>
                    <span className="bg-sa-green text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      LEKKER DEAL
                    </span>
                  </div>
                  <p className="text-2xl font-heading font-bold">R{r.monthly_rent.toLocaleString()}/mo</p>
                  <p className="text-sm text-muted-foreground">{r.bedrooms} bed • {formatTimeAgo(r.created_at)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Neighbourhood Pulse Feed */}
        <section>
          <h2 className="text-2xl md:text-3xl font-heading mb-2">Neighbourhood Pulse 📡</h2>
          <p className="text-muted-foreground mb-6">Real-time reports from the streets.</p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : pulseReports.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground text-lg">No reports yet. Drop some tea! ☕</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pulseReports.map((report, i) => {
                const Icon = PULSE_ICONS[report.report_type] || HelpCircle;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className={`p-2 rounded-lg ${
                      report.report_type === 'Safety' ? 'bg-sa-red/10 text-sa-red' :
                      report.report_type === 'Traffic' ? 'bg-sa-gold/10 text-sa-gold' :
                      report.report_type === 'Power' ? 'bg-ocean/10 text-ocean' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{report.suburb}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{report.report_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(report.created_at)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
