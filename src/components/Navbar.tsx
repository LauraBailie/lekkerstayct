import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Home, PlusCircle, Radio, Brain, Sparkles, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/submit-rental', label: 'Submit Rental', icon: PlusCircle },
  { to: '/submit-pulse', label: 'Drop the Tea', icon: Radio },
  { to: '/fair-price', label: 'Fair Price', icon: Brain },
  { to: '/match-me', label: 'Match Me', icon: Sparkles },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 gradient-hero shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏔️</span>
            <span className="font-heading text-xl font-bold text-primary-foreground">LekkerStay CT</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
              >
                <LogIn size={16} />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-primary-foreground"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground w-full"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-accent text-accent-foreground"
              >
                <LogIn size={16} />
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
