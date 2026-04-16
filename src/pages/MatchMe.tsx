import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { SUBURB_GROUPS } from '@/lib/suburbs';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, MapPin, Home, DollarSign } from 'lucide-react';

type Vibe = 'quiet' | 'vibey' | 'family' | 'student';

interface QuizState {
  step: number;
  maxRent: string;
  preferredAreas: string[];
  bedrooms: string;
  vibe: Vibe | '';
}

interface MatchedRental {
  id: string;
  suburb: string;
  monthly_rent: number;
  bedrooms: number;
  bathrooms: number;
  notes: string | null;
  braai_friendly: boolean | null;
  near_myciti: boolean | null;
  loadshedding_friendly: boolean | null;
  isLekkerDeal: boolean;
}

export default function MatchMe() {
  const [quiz, setQuiz] = useState<QuizState>({
    step: 0,
    maxRent: '',
    preferredAreas: [],
    bedrooms: '',
    vibe: '',
  });
  const [results, setResults] = useState<MatchedRental[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleArea = (area: string) => {
    setQuiz(prev => ({
      ...prev,
      preferredAreas: prev.preferredAreas.includes(area)
        ? prev.preferredAreas.filter(a => a !== area)
        : [...prev.preferredAreas, area],
    }));
  };

  const findMatches = async () => {
    setLoading(true);
    try {
      // Get all suburbs from selected areas
      const selectedSuburbs = SUBURB_GROUPS
        .filter(g => quiz.preferredAreas.includes(g.label))
        .flatMap(g => g.suburbs);

      let query = supabase.from('rentals').select('*');

      if (selectedSuburbs.length > 0) {
        query = query.in('suburb', selectedSuburbs);
      }
      if (quiz.maxRent) {
        query = query.lte('monthly_rent', parseInt(quiz.maxRent));
      }
      if (quiz.bedrooms) {
        query = query.eq('bedrooms', parseInt(quiz.bedrooms));
      }

      const { data } = await query.order('created_at', { ascending: false });

      if (data) {
        // Calculate averages for lekker deal detection
        const avgMap: Record<string, number> = {};
        data.forEach(r => {
          if (!avgMap[r.suburb]) avgMap[r.suburb] = 0;
        });

        // Fetch all rentals for suburbs to compute average
        const { data: allData } = await supabase
          .from('rentals')
          .select('suburb, monthly_rent')
          .in('suburb', [...new Set(data.map(r => r.suburb))]);

        if (allData) {
          const suburbTotals: Record<string, { total: number; count: number }> = {};
          allData.forEach(r => {
            if (!suburbTotals[r.suburb]) suburbTotals[r.suburb] = { total: 0, count: 0 };
            suburbTotals[r.suburb].total += r.monthly_rent;
            suburbTotals[r.suburb].count += 1;
          });

          const matched: MatchedRental[] = data.map(r => ({
            id: r.id,
            suburb: r.suburb,
            monthly_rent: r.monthly_rent,
            bedrooms: r.bedrooms,
            bathrooms: r.bathrooms,
            notes: r.notes,
            braai_friendly: r.braai_friendly,
            near_myciti: r.near_myciti,
            loadshedding_friendly: r.loadshedding_friendly,
            isLekkerDeal: suburbTotals[r.suburb]
              ? r.monthly_rent < (suburbTotals[r.suburb].total / suburbTotals[r.suburb].count) * 0.85
              : false,
          }));

          setResults(matched);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const vibeOptions: { value: Vibe; label: string; emoji: string }[] = [
    { value: 'quiet', label: 'Quiet & chill', emoji: '🧘' },
    { value: 'vibey', label: 'Vibey & social', emoji: '🎉' },
    { value: 'family', label: 'Family-friendly', emoji: '👨‍👩‍👧‍👦' },
    { value: 'student', label: 'Student life', emoji: '📚' },
  ];

  const steps = [
    // Step 0: Budget
    <div key="budget" className="space-y-4">
      <h2 className="text-2xl font-heading">What's your budget? 💰</h2>
      <p className="text-muted-foreground">Max monthly rent you can swing</p>
      <div className="relative">
        <span className="absolute left-4 top-3.5 text-muted-foreground font-bold">R</span>
        <input
          type="number"
          value={quiz.maxRent}
          onChange={(e) => setQuiz(p => ({ ...p, maxRent: e.target.value }))}
          placeholder="12000"
          className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-lg"
        />
      </div>
    </div>,

    // Step 1: Areas
    <div key="areas" className="space-y-4">
      <h2 className="text-2xl font-heading">Where you wanna stay? 📍</h2>
      <p className="text-muted-foreground">Pick one or more areas</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUBURB_GROUPS.map(g => (
          <button
            key={g.label}
            type="button"
            onClick={() => toggleArea(g.label)}
            className={`px-4 py-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
              quiz.preferredAreas.includes(g.label)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/40'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Bedrooms
    <div key="bedrooms" className="space-y-4">
      <h2 className="text-2xl font-heading">How many beds? 🛏️</h2>
      <div className="grid grid-cols-5 gap-3">
        {['1','2','3','4','5'].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setQuiz(p => ({ ...p, bedrooms: n }))}
            className={`py-4 rounded-lg border-2 text-xl font-bold transition-all ${
              quiz.bedrooms === n
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/40'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Vibe
    <div key="vibe" className="space-y-4">
      <h2 className="text-2xl font-heading">What's your vibe? 🤙</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {vibeOptions.map(v => (
          <button
            key={v.value}
            type="button"
            onClick={() => setQuiz(p => ({ ...p, vibe: v.value }))}
            className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 text-left font-medium transition-all ${
              quiz.vibe === v.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-2xl">{v.emoji}</span>
            {v.label}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-gradient-ocean mb-2 flex items-center justify-center gap-3">
            <Sparkles className="text-sa-gold" />
            Match Me
          </h1>
          <p className="text-muted-foreground">Find your perfect Cape Town spot in 4 quick steps.</p>
        </div>

        {results === null ? (
          <div className="bg-card rounded-xl shadow-xl p-6 md:p-8 border border-border">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              {steps.map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full transition-colors ${i <= quiz.step ? 'gradient-ocean' : 'bg-muted'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={quiz.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {steps[quiz.step]}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setQuiz(p => ({ ...p, step: p.step - 1 }))}
                disabled={quiz.step === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ArrowLeft size={18} /> Back
              </button>

              {quiz.step < steps.length - 1 ? (
                <button
                  onClick={() => setQuiz(p => ({ ...p, step: p.step + 1 }))}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg gradient-ocean text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                >
                  Next <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={findMatches}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg gradient-sunset text-accent-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Find my spot! 🔥'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading">
                {results.length > 0 ? `${results.length} Match${results.length > 1 ? 'es' : ''} Found! 🎉` : 'No matches yet 😢'}
              </h2>
              <button
                onClick={() => { setResults(null); setQuiz(p => ({ ...p, step: 0 })); }}
                className="text-primary font-semibold hover:underline"
              >
                Try again
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground">Try widening your budget or areas. More listings coming soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={16} className="text-primary" />
                          <span className="font-semibold">{r.suburb}</span>
                          {r.isLekkerDeal && (
                            <span className="bg-sa-green text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                              🔥 LEKKER DEAL
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-heading font-bold text-primary">R{r.monthly_rent.toLocaleString()}/mo</p>
                        <p className="text-sm text-muted-foreground">{r.bedrooms} bed • {r.bathrooms} bath</p>
                        {r.notes && <p className="text-sm text-muted-foreground mt-2">{r.notes}</p>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {r.braai_friendly && <span className="text-xs bg-muted px-2 py-1 rounded-full">🔥 Braai</span>}
                        {r.near_myciti && <span className="text-xs bg-muted px-2 py-1 rounded-full">🚌 MyCiTi</span>}
                        {r.loadshedding_friendly && <span className="text-xs bg-muted px-2 py-1 rounded-full">⚡ Power</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
