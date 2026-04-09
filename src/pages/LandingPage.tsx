import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  Shield,
  Zap,
  Lock,
  Printer,
  ArrowRight,
  ArrowDown,
  FileText,
  Store,
  Quote,
  Star,
  CheckCircle,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */

const steps = [
  { num: '01', icon: <FileText size={26} />, title: 'Upload Your File', desc: 'Select any document — PDF, DOCX, images, and more.' },
  { num: '02', icon: <Lock size={26} />, title: 'Get Your PIN', desc: 'Receive a unique 6-digit secret PIN instantly.' },
  { num: '03', icon: <Store size={26} />, title: 'Visit Any Shop', desc: 'Go to the nearest print shop and share your PIN.' },
  { num: '04', icon: <Printer size={26} />, title: 'Print & Go', desc: 'The shop retrieves your file securely and prints it.' },
];

const features = [
  {
    icon: <Upload size={24} />,
    title: 'Instant Upload',
    desc: 'Drop your file and get a 6-digit PIN in seconds. No account needed.',
    color: 'text-primary-500',
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    glow: 'group-hover:shadow-primary-500/20',
  },
  {
    icon: <Lock size={24} />,
    title: 'Secure & Private',
    desc: 'Files are encrypted and auto-deleted after 24 hours.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    icon: <Zap size={24} />,
    title: 'Lightning Fast',
    desc: 'Walk to any verified print shop, share your PIN, done.',
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: <Shield size={24} />,
    title: 'Verified Shops',
    desc: 'All print shops are admin-verified for trust and quality.',
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    glow: 'group-hover:shadow-purple-500/20',
  },
];

const testimonials = [
  {
    quote: "PrintPass saved me during exam season. I uploaded my notes, walked two blocks, and had everything printed in under 3 minutes. No login, no app, just a PIN!",
    name: 'Ayesha Khan',
    role: 'University Student',
    initials: 'AK',
    gradient: 'from-primary-500 to-purple-500',
  },
  {
    quote: "Since we joined PrintPass, our daily orders jumped by 40%. Students love the simplicity, and the dashboard makes managing jobs effortless.",
    name: 'Rahul Verma',
    role: 'Print Shop Owner',
    initials: 'RV',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    quote: "I was sceptical at first, but the security features won me over. Files auto-delete, everything is encrypted — my customers trust us more now.",
    name: 'Fatima Noor',
    role: 'Verified Shop Partner',
    initials: 'FN',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const trustLogos = ['QuickPrint', 'CampusCopy', 'PageMart', 'InstaDoc', 'PrintBee'];

/* ─────────────────────────────────────────────
   Animation Variants
   ───────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

const LandingPage = () => (
  <div className="overflow-hidden">

    {/* ══════════════════════════════════════════
        HERO SECTION
       ══════════════════════════════════════════ */}
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-20" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* ── Left: Copy ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-6">
            <Zap size={14} />
            The Future of Print
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-slate-900 dark:text-white">
            Print Without Hassle —{' '}
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              No Account, No App.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Upload any file, get a 6-digit PIN, and print at any verified shop near you.
            Fast, secure, and completely hassle-free.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/upload"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold gradient-hero shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] transition-all"
            >
              <Upload size={20} />
              Start Printing
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all"
            >
              <ArrowDown size={18} />
              How It Works
            </a>
          </div>
        </motion.div>

        {/* ── Right: Animated illustration ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:flex justify-center"
        >
          <div className="relative w-[380px] h-[380px]">
            {/* Main circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 border border-primary-200/50 dark:border-primary-700/30" />

            {/* Central printer */}
            <div className="absolute inset-0 flex items-center justify-center animate-float">
              <div className="w-32 h-32 rounded-3xl gradient-hero flex items-center justify-center shadow-2xl shadow-primary-500/30">
                <Printer size={64} className="text-white/90" />
              </div>
            </div>

            {/* Orbiting icons */}
            <div className="absolute top-4 right-8 animate-float-delayed">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Zap size={28} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-8 left-4 animate-float-slow">
              <div className="w-18 h-18 p-4 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Shield size={28} className="text-white" />
              </div>
            </div>
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 animate-float-delayed">
              <div className="w-14 h-14 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <FileText size={24} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-4 right-12 animate-float-slow">
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
                <Lock size={20} className="text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        HOW IT WORKS
       ══════════════════════════════════════════ */}
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900/50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Four simple steps from upload to print. No apps, no accounts for students — just pure simplicity.
          </p>
        </motion.div>

        {/* Steps grid with dashed connectors */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`relative group ${i < 3 ? 'lg:step-connector' : ''}`}
            >
              <div className="relative p-6 lg:mx-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1.5 hover:scale-[1.02]">
                {/* Step number badge */}
                <div className="w-10 h-10 rounded-full gradient-hero text-white text-sm font-bold flex items-center justify-center mb-5 shadow-md shadow-primary-500/25">
                  {step.num}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-500/20 transition-all duration-300">
                  {step.icon}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        WHY PRINTPASS
       ══════════════════════════════════════════ */}
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
            Why Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Why PrintPass?
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need for effortless, secure printing — and nothing you don't.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative p-6 rounded-2xl glass border border-slate-200/60 dark:border-slate-700/50 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
            >
              {/* Hover glow overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/[0.04] to-purple-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className={`relative w-12 h-12 rounded-xl ${feat.bg} ${feat.color} shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg ${feat.glow} transition-all duration-300`}>
                {feat.icon}
              </div>
              <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
              <p className="relative text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Trust Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <CheckCircle size={16} className="text-emerald-500" />
            Trusted by <span className="font-bold text-slate-700 dark:text-slate-200">500+ print shops</span> across India
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {trustLogos.map((name) => (
              <div
                key={name}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-sm font-semibold text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/40 select-none"
              >
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        TESTIMONIALS
       ══════════════════════════════════════════ */}
    <section className="py-24 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-4">
            <Star size={12} className="inline -mt-0.5 mr-1" />
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Loved by Students & Shops
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Hear from the people who use PrintPass every day.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Quote size={32} className="text-primary-200 dark:text-primary-800 mb-4" />
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-sm sm:text-base">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        CTA SECTION
       ══════════════════════════════════════════ */}
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl gradient-hero p-12 sm:p-16 text-center text-white shadow-2xl shadow-primary-500/30 overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-sm" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-sm" />

          <h2 className="relative text-3xl sm:text-4xl font-bold mb-4">Ready to Print?</h2>
          <p className="relative text-lg text-white/80 mb-10 max-w-xl mx-auto">
            No sign-up required. Just upload your file and get a PIN.
          </p>
          <Link
            to="/upload"
            className="relative inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-primary-600 font-bold text-lg hover:bg-primary-50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
          >
            <Upload size={22} />
            Start Printing
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  </div>
);

export default LandingPage;
