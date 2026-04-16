import { SUBURB_GROUPS } from '@/lib/suburbs';

interface SuburbSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SuburbSelect({ value, onChange, className = '' }: SuburbSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      <option value="">Choose your suburb, bru...</option>
      {SUBURB_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.suburbs.map((suburb) => (
            <option key={suburb} value={suburb}>{suburb}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
