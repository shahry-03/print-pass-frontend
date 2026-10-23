import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Shield, Clock, Printer, ArrowRight, Check, X,
  FileText, Copy, Lock, RefreshCw, Store, Menu,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import { copyToClipboard, formatFileSize } from '../../utils/helpers';
import { loadVoucher } from '../../utils/voucherStorage';
import useCountdown from '../../hooks/useCountdown';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState('voucher'); // 'voucher' | 'shop'
  const [recentVoucher, setRecentVoucher] = useState(() => loadVoucher());

  // Listen for voucher updates across tabs and window
  useEffect(() => {
    const updateVoucher = () => {
      setRecentVoucher(loadVoucher());
    };
    window.addEventListener('storage', updateVoucher);
    window.addEventListener('voucher-updated', updateVoucher);
    return () => {
      window.removeEventListener('storage', updateVoucher);
      window.removeEventListener('voucher-updated', updateVoucher);
    };
  }, []);

  const isRecent = Boolean(recentVoucher && recentVoucher.secretKey);
  const activeFileName = isRecent ? recentVoucher.fileName : 'Course_Syllabus_2026.pdf';
  const activePin = isRecent ? String(recentVoucher.secretKey).trim() : '482915';
  const activeSpecs = isRecent
    ? (recentVoucher.fileSize ? formatFileSize(recentVoucher.fileSize) : 'Uploaded Document')
    : '1.4 MB • 14 Pages • Duplex B&W';

  // Live countdown for active voucher
  const countdown = useCountdown(isRecent ? recentVoucher.expiresAt : null);

  const handleCopyPin = async () => {
    const success = await copyToClipboard(activePin);
    if (success) {
      toast.success(isRecent ? `PIN copied: ${activePin}` : 'Sample PIN copied: 482915');
    } else {
      toast.error('Failed to copy PIN');
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="pp-page">
      {/* ── Fixed Header Navigation ── */}
      <header className="pp-nav-wrapper">
        <nav className="pp-nav" aria-label="Main Navigation">
          <Logo size="md" linkTo="/" />

          <div className="pp-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#for-shops">For Print Shops</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="pp-nav-actions">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/upload">
              <Button size="sm" icon={Upload}>
                Upload Document
              </Button>
            </Link>
            <button
              type="button"
              className="pp-mobile-menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="pp-mobile-drawer">
              <a href="#how-it-works" onClick={closeMobileMenu}>How It Works</a>
              <a href="#features" onClick={closeMobileMenu}>Features</a>
              <a href="#security" onClick={closeMobileMenu}>Security</a>
              <a href="#for-shops" onClick={closeMobileMenu}>For Print Shops</a>
              <a href="#faq" onClick={closeMobileMenu}>FAQ</a>
              <div className="pp-mobile-drawer-actions">
                <Link to="/upload" onClick={closeMobileMenu}>
                  <Button fullWidth icon={Upload}>Upload Document</Button>
                </Link>
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="secondary" fullWidth>Log In to Shop</Button>
                </Link>
              </div>
            </div>
          )}
      </header>

      {/* ── Hero Section (Two-Column Desktop) ── */}
      <section className="pp-hero">
        <div className="pp-hero-grid">
          {/* Left Column: Product Value Proposition */}
          <div className="pp-hero-left">
            <div className="pp-eyebrow">
              <span className="pp-eyebrow-dot" />
              <span>Direct-to-shop printing • No USB required</span>
            </div>

            <h1 className="pp-hero-title">
              Your documents.
              <br />
              Printed without the hassle.
            </h1>

            <p className="pp-hero-sub">
              Upload your file, get a 6-digit pickup PIN, and collect your printout from
              a participating print shop. No USB drives, no charging cables, and no logging
              into personal email on public PCs.
            </p>

            <div className="pp-hero-ctas">
              <Link to="/upload">
                <Button size="lg" icon={Upload}>
                  Upload a document
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg" icon={ArrowRight}>
                  For print shops
                </Button>
              </Link>
            </div>

            <div className="pp-trust-strip">
              <div className="pp-trust-item">
                <Check size={14} className="pp-trust-icon" />
                <span>No sign-up for students</span>
              </div>
              <div className="pp-trust-item">
                <Check size={14} className="pp-trust-icon" />
                <span>Auto-deleted after 24h</span>
              </div>
              <div className="pp-trust-item">
                <Check size={14} className="pp-trust-icon" />
                <span>Single-use 6-digit PIN</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product UI Preview */}
          <div className="pp-preview-wrap">
            <div className="pp-preview-card">
              {/* Header with interactive switcher tabs */}
              <div className="pp-preview-header">
                <div className="pp-preview-tabs">
                  <button
                    type="button"
                    className={`pp-preview-tab ${previewTab === 'voucher' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('voucher')}
                  >
                    Customer Voucher
                  </button>
                  <button
                    type="button"
                    className={`pp-preview-tab ${previewTab === 'shop' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('shop')}
                  >
                    Shop Terminal
                  </button>
                </div>
                <div className="pp-preview-badge" style={isRecent && countdown.isExpired ? { background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger-border)' } : {}}>
                  <span
                    className="pp-preview-badge-dot"
                    style={isRecent && countdown.isExpired ? { backgroundColor: 'var(--danger)' } : {}}
                  />
                  <span>
                    {previewTab === 'voucher'
                      ? (isRecent ? (countdown.isExpired ? 'PIN Expired' : 'Recent Upload') : 'Ready for Pickup')
                      : 'Station Connected'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="pp-preview-body">
                {previewTab === 'voucher' ? (
                  <div>
                    {/* Document detail row */}
                    <div className="pp-file-row">
                      <div className="pp-file-icon-box">
                        <FileText size={20} />
                      </div>
                      <div className="pp-file-meta">
                        <div className="pp-file-name" title={activeFileName}>{activeFileName}</div>
                        <div className="pp-file-specs">{activeSpecs}</div>
                      </div>
                      <div
                        className={`badge ${isRecent && countdown.isExpired ? 'badge-danger' : 'badge-success'}`}
                        style={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        {isRecent ? (countdown.isExpired ? 'Expired' : 'Uploaded') : 'Sample'}
                      </div>
                    </div>

                    {/* 6-Digit Pickup PIN Display */}
                    <div className="pp-pin-block">
                      <div className="pp-pin-label">
                        {isRecent ? 'Your 6-Digit Pickup PIN' : 'Sample 6-Digit Pickup PIN'}
                      </div>
                      <div className="pp-pin-digits" aria-label={`PIN: ${activePin}`}>
                        {activePin.split('').map((digit, idx) => (
                          <div key={idx} className="pp-pin-digit-box">
                            {digit}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }}>
                        <span className="pp-pin-countdown">
                          <Clock size={13} className={isRecent && countdown.isExpired ? 'text-danger' : ''} />
                          <span>
                            {isRecent
                              ? (countdown.isExpired ? 'Expired' : `Valid for ${countdown.formatted}`)
                              : 'Valid for 23h 48m'}
                          </span>
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Copy}
                          onClick={handleCopyPin}
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
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
                            color: 'var(--accent)',
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
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
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
                      <CheckCircle2 size={18} />
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

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="pp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">How It Works</div>
          <h2 className="pp-section-title">From your screen to the paper tray</h2>
          <p className="pp-section-sub">
            Three simple steps to print documents without passing thumbdrives or emailing personal files.
          </p>
        </div>

        <div className="pp-steps-grid">
          <div className="pp-step-card">
            <div className="pp-step-top">
              <span className="pp-step-num">01</span>
              <Upload size={20} className="pp-step-icon" />
            </div>
            <h3 className="pp-step-title">Upload your document</h3>
            <p className="pp-step-desc">
              Select your PDF, DOC, or image file directly from your smartphone or laptop.
              No account creation or credit card required.
            </p>
            <div className="pp-step-badge">
              <Check size={13} style={{ color: 'var(--success)' }} />
              <span>Supports PDF, DOC, PNG, JPG</span>
            </div>
          </div>

          <div className="pp-step-card">
            <div className="pp-step-top">
              <span className="pp-step-num">02</span>
              <Lock size={20} className="pp-step-icon" />
            </div>
            <h3 className="pp-step-title">Get your pickup PIN</h3>
            <p className="pp-step-desc">
              Receive a private, single-use 6-digit PIN instantly. Your file is temporarily
              encrypted and stored for up to 24 hours.
            </p>
            <div className="pp-step-badge">
              <Clock size={13} style={{ color: 'var(--accent)' }} />
              <span>Valid for 24 hours with auto-purge</span>
            </div>
          </div>

          <div className="pp-step-card">
            <div className="pp-step-top">
              <span className="pp-step-num">03</span>
              <Printer size={20} className="pp-step-icon" />
            </div>
            <h3 className="pp-step-title">Collect your printout</h3>
            <p className="pp-step-desc">
              Visit any participating print shop counter, share your 6-digit PIN, and collect
              your fresh printout. No USB cables needed.
            </p>
            <div className="pp-step-badge">
              <Check size={13} style={{ color: 'var(--success)' }} />
              <span>Zero thumbdrive contact</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section (Verified Capabilities) ── */}
      <section id="features" className="pp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">Platform Capabilities</div>
          <h2 className="pp-section-title">Engineered for speed, built for privacy</h2>
          <p className="pp-section-sub">
            A reliable document-pickup architecture designed specifically for university students,
            busy walk-ins, and print shop operators.
          </p>
        </div>

        <div className="pp-features-grid">
          <div className="pp-feature-card">
            <div className="pp-feature-icon">
              <Upload size={20} />
            </div>
            <h3 className="pp-feature-title">Zero-Account Student Upload</h3>
            <p className="pp-feature-desc">
              Students and campus walk-ins do not need to register, verify emails, or create passwords
              just to print lecture notes or assignments.
            </p>
          </div>

          <div className="pp-feature-card">
            <div className="pp-feature-icon">
              <Shield size={20} />
            </div>
            <h3 className="pp-feature-title">Cable-Free &amp; USB-Free</h3>
            <p className="pp-feature-desc">
              Eliminate the danger of malware-infected thumbdrives, damaged mobile charging cables,
              and public PC driver conflicts.
            </p>
          </div>

          <div className="pp-feature-card">
            <div className="pp-feature-icon">
              <Clock size={20} />
            </div>
            <h3 className="pp-feature-title">Automatic 24-Hour Purge</h3>
            <p className="pp-feature-desc">
              Your uploaded documents are securely retained only until printed, and permanently
              deleted from our servers after 24 hours.
            </p>
          </div>

          <div className="pp-feature-card">
            <div className="pp-feature-icon">
              <RefreshCw size={20} />
            </div>
            <h3 className="pp-feature-title">One-Click PIN Regeneration</h3>
            <p className="pp-feature-desc">
              If your PIN expires before you reach the print shop, simply enter your old reference
              code on the upload page to generate a fresh PIN.
            </p>
          </div>

          <div className="pp-feature-card">
            <div className="pp-feature-icon">
              <Printer size={20} />
            </div>
            <h3 className="pp-feature-title">Dedicated Shop Print Station</h3>
            <p className="pp-feature-desc">
              Partner shops use a streamlined, keyboard-first terminal interface to verify PINs
              and release queued jobs in under five seconds.
            </p>
          </div>

          <div className="pp-feature-card">
            <div className="pp-feature-icon">
              <Store size={20} />
            </div>
            <h3 className="pp-feature-title">Shop Dashboard &amp; History</h3>
            <p className="pp-feature-desc">
              Registered print shops can review completed jobs, monitor station activity, and manage
              operating preferences in a clean administrative view.
            </p>
          </div>
        </div>
      </section>

      {/* ── Security & Comparison Section ── */}
      <section id="security" className="pp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">Security &amp; Hygiene</div>
          <h2 className="pp-section-title">Why public printing needed an overhaul</h2>
          <p className="pp-section-sub">
            Compare the vulnerabilities of traditional print shop visits against the secure PrintPass workflow.
          </p>
        </div>

        <div className="pp-comparison-grid">
          {/* Traditional Way */}
          <div className="pp-compare-card traditional">
            <div className="pp-compare-badge warn">
              <AlertCircle size={12} />
              <span>Traditional Public Printing</span>
            </div>
            <h3 className="pp-compare-title">Risky, slow, and clumsy</h3>
            <p className="pp-compare-desc">
              Relying on physical hardware and shared public terminals exposes your personal data.
            </p>
            <div className="pp-compare-list">
              <div className="pp-compare-item bad">
                <X size={16} />
                <span>Plugging personal USB drives into malware-infected print shop PCs</span>
              </div>
              <div className="pp-compare-item bad">
                <X size={16} />
                <span>Logging into personal Gmail or Google Drive on public, unmonitored store computers</span>
              </div>
              <div className="pp-compare-item bad">
                <X size={16} />
                <span>Handing unlocked personal smartphones and cables to strangers over the counter</span>
              </div>
              <div className="pp-compare-item bad">
                <X size={16} />
                <span>Leaving confidential documents behind in public &quot;Downloads&quot; folders</span>
              </div>
            </div>
          </div>

          {/* PrintPass Way */}
          <div className="pp-compare-card printpass">
            <div className="pp-compare-badge safe">
              <Check size={12} />
              <span>The PrintPass Standard</span>
            </div>
            <h3 className="pp-compare-title">Private, direct, and verified</h3>
            <p className="pp-compare-desc">
              An isolated document handshake where only a single-use numeric PIN is shared.
            </p>
            <div className="pp-compare-list">
              <div className="pp-compare-item good">
                <Check size={16} />
                <span>Upload securely from the comfort of your own laptop or mobile browser</span>
              </div>
              <div className="pp-compare-item good">
                <Check size={16} />
                <span>Share only an anonymous 6-digit PIN at the print counter</span>
              </div>
              <div className="pp-compare-item good">
                <Check size={16} />
                <span>Zero login credentials or browsing history ever entered on public shop PCs</span>
              </div>
              <div className="pp-compare-item good">
                <Check size={16} />
                <span>Automated 24-hour file purging ensures your documents do not linger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Print Shop Partner Callout ── */}
      <section id="for-shops" className="pp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="pp-banner-card">
          <div className="pp-banner-left">
            <div className="pp-section-eyebrow">For Print Shop Owners</div>
            <h3>Run a print shop or campus copy center?</h3>
            <p>
              Eliminate counter queue congestion, stop plugging student USB flash drives into your store PCs,
              and process print requests in seconds. Register your shop in under two minutes.
            </p>
            <div className="pp-banner-bullets">
              <div className="pp-banner-bullet">
                <Check size={14} style={{ color: 'var(--success)' }} />
                <span>Fast web-based terminal works with any existing printer</span>
              </div>
              <div className="pp-banner-bullet">
                <Check size={14} style={{ color: 'var(--success)' }} />
                <span>Protect your Windows &amp; Mac computers from USB-borne viruses</span>
              </div>
              <div className="pp-banner-bullet">
                <Check size={14} style={{ color: 'var(--success)' }} />
                <span>Cut customer wait time from 4 minutes down to 20 seconds</span>
              </div>
            </div>
          </div>

          <div className="pp-banner-actions">
            <Link to="/register">
              <Button fullWidth size="lg" icon={Store}>
                Register Your Shop
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" fullWidth size="lg">
                Sign in to Print Station
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Frequently Asked Questions ── */}
      <section id="faq" className="pp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="pp-section-header">
          <div className="pp-section-eyebrow">Got Questions?</div>
          <h2 className="pp-section-title">Frequently asked questions</h2>
          <p className="pp-section-sub">
            Everything you need to know about the PrintPass document upload and collection process.
          </p>
        </div>

        <div className="pp-faq-grid">
          <div className="pp-faq-item">
            <h4 className="pp-faq-q">Do students or customers need an account?</h4>
            <p className="pp-faq-a">
              No. Walk-in customers and students do not need to register or log in. You can simply
              upload your file, receive your 6-digit pickup PIN, and visit the print shop.
            </p>
          </div>

          <div className="pp-faq-item">
            <h4 className="pp-faq-q">How long is my 6-digit pickup PIN valid?</h4>
            <p className="pp-faq-a">
              Each PIN is valid for 24 hours from the time of upload. If a document is not printed
              within 24 hours, it is permanently removed from the server for privacy.
            </p>
          </div>

          <div className="pp-faq-item">
            <h4 className="pp-faq-q">What file formats are supported?</h4>
            <p className="pp-faq-a">
              PrintPass supports standard document and image formats including PDF, Word documents
              (.doc, .docx), and common image files (PNG, JPEG).
            </p>
          </div>

          <div className="pp-faq-item">
            <h4 className="pp-faq-q">What if my PIN expires before I collect my print?</h4>
            <p className="pp-faq-a">
              You can easily generate a fresh PIN using our built-in &quot;Regenerate PIN&quot; option
              on the Upload page by entering your previous 6-digit code.
            </p>
          </div>

          <div className="pp-faq-item">
            <h4 className="pp-faq-q">How does the print shop clerk access my file?</h4>
            <p className="pp-faq-a">
              The shop operator accesses their PrintPass terminal, inputs your 6-digit PIN, and the
              document is sent directly to their connected printer without opening your personal files.
            </p>
          </div>

          <div className="pp-faq-item">
            <h4 className="pp-faq-q">Is my document private and secure?</h4>
            <p className="pp-faq-a">
              Yes. All uploads are encrypted in transit, files can only be accessed with the exact
              6-digit PIN, and all data is automatically purged after 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ── Modern Production Footer ── */}
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
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
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
