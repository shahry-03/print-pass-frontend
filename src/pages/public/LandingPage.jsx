import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Shield, Clock, Printer, ArrowRight, Check, X, ChevronDown,
  FileText, Copy, Lock, RefreshCw, Store, Menu, CheckCircle2, AlertCircle,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import { copyToClipboard, formatFileSize } from '../../utils/helpers';
import { loadVoucher } from '../../utils/voucherStorage';
import useCountdown from '../../hooks/useCountdown';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#security', label: 'Security' },
  { href: '#for-shops', label: 'For Print Shops' },
  { href: '#faq', label: 'FAQ' },
];

const STATS = [
  { value: 10000, suffix: '+', label: 'Documents Printed' },
  { value: 250,   suffix: '+', label: 'Partner Shops' },
  { value: 24,    suffix: 'h', label: 'Auto-Purge Window' },
  { value: 99,    suffix: '%', label: 'Uptime' },
];

const FAQ_ITEMS = [
  {
    q: 'Do students or customers need an account?',
    a: 'No. Walk-in customers and students do not need to register or log in. You can simply upload your file, receive your 6-digit pickup PIN, and visit the print shop.',
  },
  {
    q: 'How long is my 6-digit pickup PIN valid?',
    a: 'Each PIN is valid for 24 hours from the time of upload. If a document is not printed within 24 hours, it is permanently removed from the server for privacy.',
  },
  {
    q: 'What file formats are supported?',
    a: 'PrintPass supports standard document and image formats including PDF, Word documents (.doc, .docx), PowerPoint (.ppt, .pptx), and common image files (PNG, JPEG).',
  },
  {
    q: 'What if my PIN expires before I collect my print?',
    a: 'You can easily generate a fresh PIN using the built-in "Regenerate PIN" option on the Upload page by entering your previous 6-digit code.',
  },
  {
    q: 'How does the print shop clerk access my file?',
    a: 'The shop operator accesses their PrintPass terminal, inputs your 6-digit PIN, and the document is sent directly to their connected printer without opening your personal files.',
  },
  {
    q: 'Is my document private and secure?',
    a: 'Yes. All uploads are encrypted in transit, files can only be accessed with the exact 6-digit PIN, and all data is automatically purged after 24 hours.',
  },
];

// Respect user motion preferences
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ═══════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════

/** True when page is scrolled past `threshold` px — used for sticky nav shadow. */
const useScrolled = (threshold = 12) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
};

/** Tracks which section is currently in view — highlights nav link. */
const useActiveSection = (ids) => {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(`#${id}`); },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [ids]);
  return active;
};

/** Full mobile-drawer behavior: escape, focus restore, body lock, outside click. */
const useMobileMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return [open, setOpen, menuRef, buttonRef];
};

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

/** Animated counter that counts up when scrolled into view. */
const AnimatedNumber = ({ value, suffix = '', duration = 1400 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (prefersReducedMotion()) {
        setDisplay(value);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => { observer.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}{suffix}
    </span>
  );
};

/** FAQ accordion item with proper ARIA wiring. */
const FaqItem = ({ item, isOpen, onToggle, index }) => {
  const btnId = `faq-btn-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div className={`pp-faq-item ${isOpen ? 'is-open' : ''}`}>
      <button
        id={btnId}
        type="button"
        className="pp-faq-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="pp-faq-q">{item.q}</span>
        <ChevronDown
          size={18}
          className="pp-faq-chevron"
          aria-hidden="true"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <Motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p className="pp-faq-a">{item.a}</p>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

const LandingPage = () => {
  const scrolled = useScrolled(20);
  const activeSection = useActiveSection(NAV_LINKS.map((l) => l.href.slice(1)));
  const [mobileOpen, setMobileOpen, mobileMenuRef, mobileButtonRef] = useMobileMenu();

  const [previewTab, setPreviewTab] = useState('voucher');
  const [recentVoucher, setRecentVoucher] = useState(() => loadVoucher());
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // ── Sync voucher across tabs and storage events ──
  useEffect(() => {
    const updateVoucher = () => setRecentVoucher(loadVoucher());
    window.addEventListener('storage', updateVoucher);
    window.addEventListener('voucher-updated', updateVoucher);
    return () => {
      window.removeEventListener('storage', updateVoucher);
      window.removeEventListener('voucher-updated', updateVoucher);
    };
  }, []);

  const isRecent = Boolean(recentVoucher?.secretKey);
  const activeFileName = isRecent ? recentVoucher.fileName : 'Course_Syllabus_2026.pdf';
  const activePin = isRecent ? String(recentVoucher.secretKey).trim() : '482915';
  const activeSpecs = isRecent
    ? (recentVoucher.fileSize ? formatFileSize(recentVoucher.fileSize) : 'Uploaded Document')
    : '1.4 MB • 14 Pages • Duplex B&W';

  const countdown = useCountdown(isRecent ? recentVoucher.expiresAt : null);
  const isExpired = isRecent && countdown.isExpired;

  // ── Copy PIN ──
  const handleCopyPin = useCallback(async () => {
    const success = await copyToClipboard(activePin);
    if (success) {
      toast.success(isRecent ? `PIN copied: ${activePin}` : `Sample PIN copied: ${activePin}`);
    } else {
      toast.error('Failed to copy PIN');
    }
  }, [activePin, isRecent]);

  // ── Share (native share sheet on mobile, copy link fallback) ──
  const handleShare = useCallback(async () => {
    const shareUrl = window.location.origin;
    const shareData = {
      title: 'PrintPass — Secure Printing',
      text: 'Upload a document, get a PIN, print at any shop. No USB, no hassle.',
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      const success = await copyToClipboard(shareUrl);
      if (success) toast.success('Link copied to clipboard!');
      else toast.error('Failed to copy link');
    } catch (err) {
      // User cancelled share sheet — silent
      if (err?.name !== 'AbortError') toast.error('Could not share');
    }
  }, []);

  const closeMobileMenu = useCallback(() => setMobileOpen(false), [setMobileOpen]);

  // ── Section reveal helper (respects reduced-motion) ──
  const revealProps = useMemo(() => prefersReducedMotion()
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.5, ease: 'easeOut' },
      }, []);

  return (
    <div className="pp-page">
      {/* Skip link for keyboard users */}
      <a href="#how-it-works" className="skip-to-content">Skip to content</a>

      {/* ── Sticky Header (with scroll shadow) ── */}
      <header
        className={`pp-nav-wrapper ${scrolled ? 'is-scrolled' : ''}`}
        style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'none' }}
      >
        <nav className="pp-nav" aria-label="Main Navigation">
          <Logo size="md" linkTo="/" />

          <div className="pp-nav-links">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={activeSection === link.href ? 'active' : ''}
                aria-current={activeSection === link.href ? 'true' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pp-nav-actions">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/upload">
              <Button size="sm" icon={Upload}>Upload Document</Button>
            </Link>
            <button
              ref={mobileButtonRef}
              type="button"
              className="pp-mobile-menu-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <Motion.div
              id="mobile-drawer"
              ref={mobileMenuRef}
              className="pp-mobile-drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={closeMobileMenu}>
                  {link.label}
                </a>
              ))}
              <div className="pp-mobile-drawer-actions">
                <Link to="/upload" onClick={closeMobileMenu}>
                  <Button fullWidth icon={Upload}>Upload Document</Button>
                </Link>
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="secondary" fullWidth>Log In to Shop</Button>
                </Link>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ── */}
      <section className="pp-hero" style={{ scrollMarginTop: 80 }}>
        <div className="pp-hero-grid">
          <div className="pp-hero-left">
            <div className="pp-eyebrow">
              <span className="pp-eyebrow-dot" aria-hidden="true" />
              <span>UPLOAD ONLINE. PICK UP IN STORE.</span>
            </div>

            <h1 className="pp-hero-title">
              Your documents.<br />Printed on your terms.
            </h1>

            <p className="pp-hero-sub">
              Upload your file, get a secure pickup PIN, and collect your prints at a nearby
              participating print shop. No USB drives. No public-computer logins.
            </p>

            <div className="pp-hero-ctas">
              <Link to="/upload">
                <Button size="lg" icon={Upload}>Upload a Document</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg" icon={ArrowRight}>For Print Shops</Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                icon={Share2}
                onClick={handleShare}
                aria-label="Share PrintPass"
              >
                Share
              </Button>
            </div>

            <div className="pp-trust-strip">
              {['Secure pickup PIN', 'No USB required', 'Simple document collection'].map((text) => (
                <div className="pp-trust-item" key={text}>
                  <Check size={14} className="pp-trust-icon" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Preview */}
          <div className="pp-preview-wrap">
            <div className="pp-preview-card">
              <div className="pp-preview-header">
                <div className="pp-preview-tabs" role="tablist" aria-label="Preview mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewTab === 'voucher'}
                    className={`pp-preview-tab ${previewTab === 'voucher' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('voucher')}
                  >
                    Customer Voucher
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewTab === 'shop'}
                    className={`pp-preview-tab ${previewTab === 'shop' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('shop')}
                  >
                    Shop Terminal
                  </button>
                </div>
                <div
                  className="pp-preview-badge"
                  style={isExpired ? { background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger-border)' } : {}}
                >
                  <span
                    className="pp-preview-badge-dot"
                    aria-hidden="true"
                    style={isExpired ? { backgroundColor: 'var(--danger)' } : {}}
                  />
                  <span>
                    {previewTab === 'voucher'
                      ? (isRecent ? (isExpired ? 'PIN Expired' : 'Ready for Pickup') : 'Ready for Pickup')
                      : 'Station Connected'}
                  </span>
                </div>
              </div>

              <div className="pp-preview-body">
                {previewTab === 'voucher' ? (
                  <div className="pp-ticket-container">
                    <div className="pp-file-row">
                      <div className="pp-file-icon-box"><FileText size={20} aria-hidden="true" /></div>
                      <div className="pp-file-meta">
                        <div className="pp-file-name" title={activeFileName}>{activeFileName}</div>
                        <div className="pp-file-specs">{activeSpecs}</div>
                      </div>
                      <div
                        className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}
                        style={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        {isRecent ? (isExpired ? 'Expired' : 'Uploaded') : 'Sample'}
                      </div>
                    </div>

                    {/* Ticket perforation line with notches */}
                    <div className="pp-ticket-divider" aria-hidden="true">
                      <span className="pp-ticket-notch pp-ticket-notch-left" />
                      <span className="pp-ticket-perforation" />
                      <span className="pp-ticket-notch pp-ticket-notch-right" />
                    </div>

                    <div className="pp-pin-block">
                      <div className="pp-pin-header-row">
                        <span className="pp-pin-label">
                          {isRecent ? 'Your 6-Digit Pickup PIN' : 'Sample 6-Digit Pickup PIN'}
                        </span>
                        <span className="pp-ticket-badge-pill">
                          {isExpired ? 'Expired' : 'Active Pass'}
                        </span>
                      </div>
                      <div className="pp-pin-digits" aria-label={`PIN: ${activePin}`}>
                        {activePin.split('').map((digit, idx) => (
                          <div key={idx} className="pp-pin-digit-box">{digit}</div>
                        ))}
                      </div>
                      <div className="pp-pin-actions-row">
                        <span className="pp-pin-countdown">
                          <Clock size={13} className={isExpired ? 'text-danger' : 'text-primary'} aria-hidden="true" />
                          <span>
                            {isRecent
                              ? (isExpired ? 'Expired' : `Valid for ${countdown.formatted}`)
                              : 'Valid for 23h 48m'}
                          </span>
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Copy}
                          onClick={handleCopyPin}
                          className="pp-pin-copy-btn"
                        >
                          Copy PIN
                        </Button>
                      </div>
                    </div>

                    <p className="pp-preview-note">
                      Show this 6-digit PIN to the operator at any partner print shop counter.
                      Your document prints immediately without sharing a flash drive.
                    </p>

                    {isRecent && (
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <Link
                          to="/upload"
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          View Full Voucher &amp; Status &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pp-shop-terminal">
                    <div className="pp-terminal-bar">
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Print Station #04
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: '0.75rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--success)' }} aria-hidden="true" />
                        Ready for jobs
                      </span>
                    </div>

                    <div className="pp-pin-block" style={{ padding: '14px 10px' }}>
                      <div className="pp-pin-label">Clerk Entered PIN</div>
                      <div className="pp-pin-digits">
                        {activePin.split('').map((digit, idx) => (
                          <div key={idx} className="pp-pin-digit-box" style={{ borderColor: 'var(--accent)' }}>
                            {digit}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pp-terminal-verified">
                      <CheckCircle2 size={18} aria-hidden="true" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Job Verified — {activeFileName} loaded
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                          Printer Target: Canon iR-ADV C5560
                        </div>
                      </div>
                    </div>

                    <p className="pp-preview-note">
                      The shop clerk types the PIN on their station at <code className="mono">/shop/print</code>.
                      Files are retrieved securely and purged after printing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="pp-section" aria-label="Platform statistics" style={{ paddingTop: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            padding: '28px 24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-tertiary)',
                  marginTop: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <Motion.section
        id="how-it-works"
        className="pp-section"
        style={{ borderTop: '1px solid var(--border)', scrollMarginTop: 80 }}
        {...revealProps}
      >
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">How It Works</div>
          <h2 className="pp-section-title">From your screen to the paper tray</h2>
          <p className="pp-section-sub">
            Three simple steps to print documents without passing thumbdrives or emailing personal files.
          </p>
        </div>

        <div className="pp-steps-grid">
          {[
            { num: '01', Icon: Upload, title: 'Upload your document', desc: 'Select your PDF, DOC, or image file directly from your smartphone or laptop. No account creation or credit card required.', badgeIcon: Check, badgeText: 'Supports PDF, DOC, PNG, JPG', badgeColor: 'var(--success)' },
            { num: '02', Icon: Lock, title: 'Get your pickup PIN', desc: 'Receive a private, single-use 6-digit PIN instantly. Your file is temporarily encrypted and stored for up to 24 hours.', badgeIcon: Clock, badgeText: 'Valid for 24 hours with auto-purge', badgeColor: 'var(--accent)' },
            { num: '03', Icon: Printer, title: 'Collect your printout', desc: 'Visit any participating print shop counter, share your 6-digit PIN, and collect your fresh printout. No USB cables needed.', badgeIcon: Check, badgeText: 'Zero thumbdrive contact', badgeColor: 'var(--success)' },
          ].map(({ num, Icon, title, desc, badgeIcon: BadgeIcon, badgeText, badgeColor }) => (
            <div className="pp-step-card" key={num}>
              <div className="pp-step-top">
                <span className="pp-step-num">{num}</span>
                <Icon size={20} className="pp-step-icon" aria-hidden="true" />
              </div>
              <h3 className="pp-step-title">{title}</h3>
              <p className="pp-step-desc">{desc}</p>
              <div className="pp-step-badge">
                <BadgeIcon size={13} style={{ color: badgeColor }} aria-hidden="true" />
                <span>{badgeText}</span>
              </div>
            </div>
          ))}
        </div>
      </Motion.section>

      {/* ── Features ── */}
      <Motion.section
        id="features"
        className="pp-section"
        style={{ borderTop: '1px solid var(--border)', scrollMarginTop: 80 }}
        {...revealProps}
      >
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">Platform Capabilities</div>
          <h2 className="pp-section-title">Engineered for speed, built for privacy</h2>
          <p className="pp-section-sub">
            A reliable document-pickup architecture designed for university students, busy walk-ins, and print shop operators.
          </p>
        </div>

        <div className="pp-features-grid">
          {[
            { Icon: Upload, title: 'Zero-Account Student Upload', desc: 'Students and campus walk-ins do not need to register, verify emails, or create passwords just to print lecture notes or assignments.' },
            { Icon: Shield, title: 'Cable-Free & USB-Free', desc: 'Eliminate the danger of malware-infected thumbdrives, damaged mobile charging cables, and public PC driver conflicts.' },
            { Icon: Clock, title: 'Automatic 24-Hour Purge', desc: 'Your uploaded documents are securely retained only until printed, and permanently deleted from our servers after 24 hours.' },
            { Icon: RefreshCw, title: 'One-Click PIN Regeneration', desc: 'If your PIN expires before you reach the print shop, simply enter your old reference code on the upload page to generate a fresh PIN.' },
            { Icon: Printer, title: 'Dedicated Shop Print Station', desc: 'Partner shops use a streamlined, keyboard-first terminal to verify PINs and release queued jobs in under five seconds.' },
            { Icon: Store, title: 'Shop Dashboard & History', desc: 'Registered print shops can review completed jobs, monitor station activity, and manage operating preferences in a clean admin view.' },
          ].map(({ Icon, title, desc }) => (
            <div className="pp-feature-card" key={title}>
              <div className="pp-feature-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="pp-feature-title">{title}</h3>
              <p className="pp-feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </Motion.section>

      {/* ── Security & Comparison ── */}
      <Motion.section
        id="security"
        className="pp-section"
        style={{ borderTop: '1px solid var(--border)', scrollMarginTop: 80 }}
        {...revealProps}
      >
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">Security &amp; Hygiene</div>
          <h2 className="pp-section-title">Why public printing needed an overhaul</h2>
          <p className="pp-section-sub">
            Compare the vulnerabilities of traditional print shop visits against the secure PrintPass workflow.
          </p>
        </div>

        <div className="pp-comparison-grid">
          <div className="pp-compare-card traditional">
            <div className="pp-compare-badge warn">
              <AlertCircle size={12} aria-hidden="true" />
              <span>Traditional Public Printing</span>
            </div>
            <h3 className="pp-compare-title">Risky, slow, and clumsy</h3>
            <p className="pp-compare-desc">
              Relying on physical hardware and shared public terminals exposes your personal data.
            </p>
            <div className="pp-compare-list">
              {[
                'Plugging personal USB drives into malware-infected print shop PCs',
                'Logging into personal Gmail or Google Drive on public, unmonitored store computers',
                'Handing unlocked personal smartphones and cables to strangers over the counter',
                'Leaving confidential documents behind in public "Downloads" folders',
              ].map((text) => (
                <div className="pp-compare-item bad" key={text}>
                  <X size={16} aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pp-compare-card printpass">
            <div className="pp-compare-badge safe">
              <Check size={12} aria-hidden="true" />
              <span>The PrintPass Standard</span>
            </div>
            <h3 className="pp-compare-title">Private, direct, and verified</h3>
            <p className="pp-compare-desc">
              An isolated document handshake where only a single-use numeric PIN is shared.
            </p>
            <div className="pp-compare-list">
              {[
                'Upload securely from the comfort of your own laptop or mobile browser',
                'Share only an anonymous 6-digit PIN at the print counter',
                'Zero login credentials or browsing history ever entered on public shop PCs',
                'Automated 24-hour file purging ensures your documents do not linger',
              ].map((text) => (
                <div className="pp-compare-item good" key={text}>
                  <Check size={16} aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Motion.section>

      {/* ── Shop Partner CTA ── */}
      <Motion.section
        id="for-shops"
        className="pp-section"
        style={{ borderTop: '1px solid var(--border)', scrollMarginTop: 80 }}
        {...revealProps}
      >
        <div className="pp-banner-card">
          <div className="pp-banner-left">
            <div className="pp-section-eyebrow">For Print Shop Owners</div>
            <h3>Run a print shop or campus copy center?</h3>
            <p>
              Eliminate counter queue congestion, stop plugging student USB flash drives into your store PCs,
              and process print requests in seconds. Register your shop in under two minutes.
            </p>
            <div className="pp-banner-bullets">
              {[
                'Fast web-based terminal works with any existing printer',
                'Protect your Windows & Mac computers from USB-borne viruses',
                'Cut customer wait time from 4 minutes down to 20 seconds',
              ].map((text) => (
                <div className="pp-banner-bullet" key={text}>
                  <Check size={14} style={{ color: 'var(--success)' }} aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pp-banner-actions">
            <Link to="/register">
              <Button fullWidth size="lg" icon={Store}>Register Your Shop</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" fullWidth size="lg">Sign in to Print Station</Button>
            </Link>
          </div>
        </div>
      </Motion.section>

      {/* ── FAQ (Accordion) ── */}
      <Motion.section
        id="faq"
        className="pp-section"
        style={{ borderTop: '1px solid var(--border)', scrollMarginTop: 80 }}
        {...revealProps}
      >
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">Got Questions?</div>
          <h2 className="pp-section-title">Frequently asked questions</h2>
          <p className="pp-section-sub">
            Everything you need to know about the PrintPass document upload and collection process.
          </p>
        </div>

        <div className="pp-faq-grid">
          {FAQ_ITEMS.map((item, idx) => (
            <FaqItem
              key={item.q}
              item={item}
              index={idx}
              isOpen={openFaqIndex === idx}
              onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
            />
          ))}
        </div>
      </Motion.section>

      {/* ── Final CTA ── */}
      <Motion.section className="pp-section" style={{ borderTop: '1px solid var(--border)' }} {...revealProps}>
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'linear-gradient(135deg, var(--primary-soft), transparent)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', marginBottom: 12 }}>
            Ready to print without the hassle?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            Upload a document in seconds. No account. No USB. No nonsense.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/upload">
              <Button size="lg" icon={Upload}>Upload a document</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg" icon={Store}>I run a print shop</Button>
            </Link>
          </div>
        </div>
      </Motion.section>

      {/* ── Footer ── */}
      <footer className="pp-footer">
        <div className="pp-footer-inner">
          <div className="pp-footer-top">
            <div className="pp-footer-brand">
              <Logo size="md" linkTo="/" />
              <p>
                Direct-to-shop printing platform. Fast, private, and completely cable-free
                for students and local print centers.
              </p>
            </div>

            <div className="pp-footer-col">
              <h5>Students &amp; Walk-ins</h5>
              <ul>
                <li><Link to="/upload">Upload Document</Link></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><Link to="/upload">Regenerate Expired PIN</Link></li>
                <li><a href="#faq">Frequently Asked Questions</a></li>
              </ul>
            </div>

            <div className="pp-footer-col">
              <h5>Print Shops</h5>
              <ul>
                <li><Link to="/register">Register Print Shop</Link></li>
                <li><Link to="/login">Shop Partner Login</Link></li>
                <li><Link to="/login">Print Station Terminal</Link></li>
                <li><a href="#for-shops">Partner Benefits</a></li>
              </ul>
            </div>

            <div className="pp-footer-col">
              <h5>Platform &amp; Privacy</h5>
              <ul>
                <li><a href="#security">Zero-USB Security</a></li>
                <li><a href="#features">24-Hour Auto-Purge</a></li>
                <li><a href="#faq">Privacy Guarantee</a></li>
                <li><Link to="/upload">Document Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="pp-footer-bottom">
            <span>&copy; {new Date().getFullYear()} PrintPass. All rights reserved.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="pp-footer-status">
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--success)' }} aria-hidden="true" />
                <span>All systems operational</span>
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;