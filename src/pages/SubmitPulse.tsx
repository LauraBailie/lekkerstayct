import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import SuburbSelect from '@/components/SuburbSelect';
import { AlertTriangle, Car, Zap, HelpCircle } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'Traffic', label: 'Traffic 🚗', icon: Car },
  { value: 'Safety', label: 'Safety ⚠️', icon: AlertTriangle },
  { value: 'Power', label: 'Power / Load-shedding ⚡', icon: Zap },
  { value: 'Other', label: 'Other 💬', icon: HelpCircle },
];

export default function SubmitPulse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    suburb: '',
    report_type: '',
    description: '',
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-heading text-gradient-ocean mb-4">Hold up!</h1>
          <p className="text-muted-foreground mb-6">Sign in to share your report.</p>
          <button onClick={() => navigate('/auth')} className="px-6 py-3 rounded-lg gradient-ocean text-primary-foreground font-bold">
            Sign in to continue
          </button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.suburb || !form.report_type || !form.description) {
      toast({ title: "Eish!", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('pulse_reports').insert({
        user_id: user.id,
        suburb: form.suburb,
        report_type: form.report_type,
        description: form.description,
      });
      if (error) throw error;
      toast({ title: "Lekker! 🎉", description: "Added to the community, sharp-sharp!" });
      navigate('/');
    } catch (err: any) {
      toast({ title: "Eish!", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-gradient-ocean mb-2">Drop the Tea ☕</h1>
          <p className="text-muted-foreground">What's happening out there? Traffic, safety, power — let the community know!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-xl p-6 md:p-8 border border-border space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Suburb</label>
            <SuburbSelect value={form.suburb} onChange={(v) => setForm(p => ({ ...p, suburb: v }))} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">What's the vibe?</label>
            <div className="grid grid-cols-2 gap-3">
              {REPORT_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, report_type: value }))}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    form.report_type === value
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

          <div>
            <label className="block text-sm font-semibold mb-2">What's happening?</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell us what's happening..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl gradient-sunset text-accent-foreground font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Dropping...' : "Awê, drop the tea! ☕"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
