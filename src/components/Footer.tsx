import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Upload, Store, Mail, Send, ArrowRight } from 'lucide-react';

/* ── Inline SVG social icons (no external dependency) ── */
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const socialLinks = [
  { icon: <TwitterIcon />, href: '#', label: 'Twitter / X' },
  { icon: <GitHubIcon />, href: '#', label: 'GitHub' },
  { icon: <LinkedInIcon />, href: '#', label: 'LinkedIn' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                <Printer size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Print<span className="text-primary-600 dark:text-primary-400">Pass</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Secure Print Job Management — upload anywhere, print everywhere, with zero hassle.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/upload"
                  className="group inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Upload size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Upload File
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Store size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Register Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Shop Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((text) => (
                <li key={text}>
                  <a
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Get updates on new features and partner shops.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-white gradient-hero shadow-md shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105 transition-all flex items-center gap-1"
                aria-label="Subscribe"
              >
                <Send size={16} />
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in-up">
                ✓ Subscribed! We'll keep you posted.
              </p>
            )}
            <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-600">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © 2026 PrintPass. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Secure Print Job Management
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
