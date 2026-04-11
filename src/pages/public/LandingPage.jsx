import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, Shield, Zap, Clock, FileText,
  Printer, ArrowRight, Sparkles,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const LandingPage = () => {
  return (
    <div>
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <Logo size="md" linkTo="/" />
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </div>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link to="/upload">
            <Button size="sm" icon={Upload}>Upload File</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <motion.div custom={0} variants={fadeUp}>
            <span className="hero-badge">
              <Sparkles size={14} />
              Secure Print Platform
            </span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp}>
            Print your files at any shop.{' '}
            <span className="gradient-text">No cables. No USB.</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp}>
            Upload your document, get a 6-digit PIN, walk to any verified print shop,
            and pick up your printout. It's that simple.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="hero-actions">
            <Link to="/upload">
              <Button size="lg" icon={Upload}>
                Upload Your File
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg" icon={ArrowRight}>
                Register Your Shop
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="landing-section">
        <div className="landing-section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to get your document printed</p>
        </div>

        <div className="steps-grid">
          {[
            {
              num: 1,
              icon: Upload,
              title: 'Upload File',
              desc: 'Upload your PDF, DOC, or image file from any device',
            },
            {
              num: 2,
              icon: FileText,
              title: 'Get Your PIN',
              desc: 'Receive a unique 6-digit PIN valid for 24 hours',
            },
            {
              num: 3,
              icon: Printer,
              title: 'Collect Print',
              desc: 'Share the PIN at any verified shop and get your printout',
            },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              className="step-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="step-number">{step.num}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <h2>Why PrintPass?</h2>
          <p>Built for students. Trusted by print shops.</p>
        </div>

        <div className="features-grid">
          {[
            {
              icon: Shield,
              title: 'Secure & Private',
              desc: 'Files are encrypted, accessed only via PIN, and auto-deleted after printing.',
            },
            {
              icon: Zap,
              title: 'Lightning Fast',
              desc: 'Upload in seconds, get your PIN instantly. No sign-up required for students.',
            },
            {
              icon: Clock,
              title: '24h Auto-Expiry',
              desc: 'PINs expire automatically after 24 hours for maximum security.',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="feature-icon">
                <feature.icon size={24} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} PrintPass. Built with ❤️ for students everywhere.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
