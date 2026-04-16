import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import SuburbSelect from '@/components/SuburbSelect';
import { Home, DollarSign, BedDouble, Bath, Calendar, Camera, Flame, Bus, Zap, Car, GraduationCap, ShoppingBag } from 'lucide-react';

export default function SubmitRental() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    suburb: '',
    monthly_rent: '',
    bedrooms: '1',
    bathrooms: '1',
    move_in_date: '',
    notes: '',
    braai_friendly: false,
    near_myciti: false,
    loadshedding_friendly: false,
    near_taxi_rank: false,
    good_schools: false,
    walking_distance_shops: false,
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-heading text-gradient-ocean mb-4">Hold up!</h1>
          <p className="text-muted-foreground mb-6">You need to sign in first to submit your spot.</p>
          <button onClick={() => navigate('/auth')} className="px-6 py-3 rounded-lg gradient-ocean text-primary-foreground font-bold">
            Sign in to continue
          </button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.suburb || !form.monthly_rent) {
      toast({ title: "Eish!", description: "Please fill in suburb and rent at least.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('rentals').insert({
        user_id: user.id,
        suburb: form.suburb,
        monthly_rent: parseInt(form.monthly_rent),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        move_in_date: form.move_in_date || null,
        notes: form.notes || null,
        braai_friendly: form.braai_friendly,
        near_myciti: form.near_myciti,
        loadshedding_friendly: form.loadshedding_friendly,
        near_taxi_rank: form.near_taxi_rank,
        good_schools: form.good_schools,
        walking_distance_shops: form.walking_distance_shops,
      });
      if (error) throw error;
      toast({ title: "Lekker! 🎉", description: "Yoh, submission recorded sharp-sharp!" });
      navigate('/');
    } catch (err: any) {
      toast({ title: "Eish!", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field: string) => setForm(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));

  const vibeChecks = [
    { key: 'braai_friendly', label: 'Braai-friendly balcony? 🔥', icon: Flame },
    { key: 'near_myciti', label: 'Near MyCiTi stop? 🚌', icon: Bus },
    { key: 'loadshedding_friendly', label: 'Load-shedding friendly? ⚡', icon: Zap },
    { key: 'near_taxi_rank', label: 'Near taxi rank? 🚕', icon: Car },
    { key: 'good_schools', label: 'Good schools? 🎓', icon: GraduationCap },
    { key: 'walking_distance_shops', label: 'Walk to shops/malls? 🛍️', icon: ShoppingBag },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-gradient-ocean mb-2">Submit Your Spot 🏠</h1>
          <p className="text-muted-foreground">Help your fellow Capetonians know what's lekker out there!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-xl p-6 md:p-8 border border-border space-y-6">
          {/* Suburb */}
          <div>
            <label className="block text-sm font-semibold mb-2">Suburb</label>
            <SuburbSelect value={form.suburb} onChange={(v) => setForm(p => ({ ...p, suburb: v }))} />
          </div>

          {/* Rent + Bedrooms + Bathrooms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Monthly Rent (ZAR)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground font-bold">R</span>
                <input
                  type="number"
                  value={form.monthly_rent}
                  onChange={(e) => setForm(p => ({ ...p, monthly_rent: e.target.value }))}
                  placeholder="8500"
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bedrooms</label>
              <select
                value={form.bedrooms}
                onChange={(e) => setForm(p => ({ ...p, bedrooms: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bathrooms</label>
              <select
                value={form.bathrooms}
                onChange={(e) => setForm(p => ({ ...p, bathrooms: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Move-in date */}
          <div>
            <label className="block text-sm font-semibold mb-2">Move-in Date</label>
            <input
              type="date"
              value={form.move_in_date}
              onChange={(e) => setForm(p => ({ ...p, move_in_date: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Vibe Checks */}
          <div>
            <label className="block text-sm font-semibold mb-3">Vibe Check 🤙</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vibeChecks.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleField(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${
                    form[key as keyof typeof form]
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Tell us more... parking? pool? garden?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl gradient-ocean text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Submitting...' : "Submit my spot, lekker! 🤙"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
