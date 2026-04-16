import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const REASONS = ['Price wrong', 'Already taken', 'Other'] as const;

interface Props {
  rentalId: string;
}

export default function ReportRentalButton({ rentalId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Sign in first', description: 'You need an account to report listings.' });
      return;
    }
    if (!reason) {
      toast({ title: 'Choose a reason', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('rental_reports').insert({
      rental_id: rentalId,
      user_id: user.id,
      reason,
      details: details.trim().slice(0, 500) || null,
    });
    setSubmitting(false);
    if (error?.code === '23505') {
      toast({ title: 'Already reported', description: "You've already flagged this listing." });
    } else if (error) {
      toast({ title: 'Eish!', description: 'Something went wrong. Try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Sharp-sharp!', description: 'Report submitted — thanks for keeping it real.' });
    }
    setOpen(false);
    setReason('');
    setDetails('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <Flag size={10} /> Report
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-sm font-medium mb-2">What's wrong?</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${reason === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Any details? (optional)"
          value={details}
          onChange={e => setDetails(e.target.value)}
          maxLength={500}
          className="text-xs h-16 mb-2"
        />
        <Button size="sm" className="w-full" onClick={handleSubmit} disabled={submitting || !reason}>
          {submitting ? 'Sending…' : 'Submit report'}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
