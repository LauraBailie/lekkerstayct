import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SuburbSelect from '@/components/SuburbSelect';
import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';

export default function FairPrice() {
  const [suburb, setSuburb] = useState('');
  const [rent, setRent] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyse = async () => {
    if (!suburb || !rent) return;
    setLoading(true);
    setResult('');

    try {
      // Fetch real data for the suburb
      const { data: rentals } = await supabase
        .from('rentals')
        .select('monthly_rent, bedrooms')
        .eq('suburb', suburb);

      const bedroomRentals = rentals?.filter(r => r.bedrooms === parseInt(bedrooms)) || [];
      const allRentals = rentals || [];

      const rentAmount = parseInt(rent);

      if (allRentals.length === 0) {
        setResult(`Yoh bru, we don't have enough data for ${suburb} yet! Be the first to submit a rental there and help the community. 🏠`);
        setLoading(false);
        return;
      }

      const avgAll = Math.round(allRentals.reduce((s, r) => s + r.monthly_rent, 0) / allRentals.length);
      const avgBed = bedroomRentals.length > 0
        ? Math.round(bedroomRentals.reduce((s, r) => s + r.monthly_rent, 0) / bedroomRentals.length)
        : avgAll;

      const diff = ((rentAmount - avgBed) / avgBed * 100);
      const diffAbs = Math.abs(Math.round(diff));

      let response = '';
      if (diff < -20) {
        response = `🔥 Yoh bru, this is ${diffAbs}% BELOW average in ${suburb} — that's a lekker deal! The average for a ${bedrooms}-bed is R${avgBed.toLocaleString()}/mo and you're looking at R${rentAmount.toLocaleString()}. Grab it before someone else does, sharp-sharp! 🤙`;
      } else if (diff < -5) {
        response = `👍 Not bad, bru! This is ${diffAbs}% below the average of R${avgBed.toLocaleString()}/mo for a ${bedrooms}-bed in ${suburb}. Decent deal — worth checking out! Lekker one.`;
      } else if (diff <= 5) {
        response = `😎 This is pretty much on par with the market, bru. Average for a ${bedrooms}-bed in ${suburb} is R${avgBed.toLocaleString()}/mo. Your R${rentAmount.toLocaleString()} is fair — nothing kak about that!`;
      } else if (diff <= 20) {
        response = `😬 Eish, that's ${diffAbs}% above average in ${suburb}. A ${bedrooms}-bed usually goes for R${avgBed.toLocaleString()}/mo. Maybe try negotiate, bru — or check out some other spots.`;
      } else {
        response = `💀 Eish, that's kak expensive, my bru! ${diffAbs}% above average in ${suburb}! The going rate for a ${bedrooms}-bed is R${avgBed.toLocaleString()}/mo. You're being robbed at R${rentAmount.toLocaleString()}. Walk away, bru!`;
      }

      response += `\n\n📊 Based on ${allRentals.length} submission${allRentals.length > 1 ? 's' : ''} in ${suburb}${bedroomRentals.length > 0 ? ` (${bedroomRentals.length} with ${bedrooms} bed${parseInt(bedrooms) > 1 ? 's' : ''})` : ''}.`;
      setResult(response);
    } catch (err) {
      setResult('Eish, something went wrong bru. Try again later! 😢');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-gradient-ocean mb-2 flex items-center justify-center gap-3">
            <Brain className="text-primary" />
            Fair Price Advisor
          </h1>
          <p className="text-muted-foreground">Is your rent lekker or kak? Let's find out, bru!</p>
        </div>

        <div className="bg-card rounded-xl shadow-xl p-6 md:p-8 border border-border space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Suburb</label>
            <SuburbSelect value={suburb} onChange={setSuburb} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Monthly Rent (ZAR)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground font-bold">R</span>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="8500"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyse}
            disabled={loading || !suburb || !rent}
            className="w-full py-4 rounded-xl gradient-ocean text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Brain size={20} />}
            {loading ? 'Crunching numbers, bru...' : 'Is this rent lekker? 🤔'}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-card rounded-xl shadow-xl p-6 md:p-8 border border-border"
          >
            <h3 className="text-lg font-heading mb-3">The Verdict 🔍</h3>
            <p className="text-foreground whitespace-pre-line leading-relaxed">{result}</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
