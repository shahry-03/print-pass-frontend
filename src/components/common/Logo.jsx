import { useId } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

// ── Size presets ──
const SIZE_MAP = {
  xs: { box: 24, mark: 16, text: '0.9rem', gap: 6 },
  sm: { box: 30, mark: 19, text: '1rem', gap: 8 },
  md: { box: 34, mark: 22, text: '1.15rem', gap: 10 },
  lg: { box: 44, mark: 28, text: '1.4rem', gap: 12 },
  xl: { box: 56, mark: 36, text: '1.75rem', gap: 14 },
};

// ── Cloud Printing Brand Blue ──
const BRAND_START = '#3B82F6'; // blue-500
const BRAND_END = '#2563EB';   // blue-600

/**
 * PrintPass brand mark — Cloud-connected Printer
 */
const LogoMark = ({ size, gradientId }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={BRAND_START} />
        <stop offset="100%" stopColor={BRAND_END} />
      </linearGradient>
    </defs>

    {/* Paper Feed */}
    <path d="M7 3.5H17V9H7V3.5Z" fill={`url(#${gradientId})`} />

    {/* Printer Body */}
    <rect x="3" y="8" width="18" height="10" rx="2.5" fill={`url(#${gradientId})`} />

    {/* Output Document Tray */}
    <path
      d="M7 14H17V20.5H7V14Z"
      fill="#FFFFFF"
      stroke={`url(#${gradientId})`}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Printed Text Lines */}
    <path
      d="M9.5 16.5H14.5M9.5 18.5H13"
      stroke={BRAND_END}
      strokeWidth="1.4"
      strokeLinecap="round"
    />

    {/* Status Indicator */}
    <circle cx="17.5" cy="11" r="1" fill="#FFFFFF" />
  </svg>
);

const Logo = ({
  size = 'md',
  linkTo = '/',
  variant = 'default',   // 'default' | 'icon' | 'mark'
  showText = true,
  tagline = null,        // ⚠️ OFF by default — pass explicitly where needed
  src,
  animated = true,
  className = '',
  ...rest
}) => {
  const gradientId = useId();
  const conf = SIZE_MAP[size] ?? SIZE_MAP.md;
  const isIconOnly = variant === 'icon' || !showText;
  const isMarkOnly = variant === 'mark';

  // Tagline only on md/lg/xl (xs/sm would clip or be unreadable)
  const showTagline = Boolean(tagline) && ['md', 'lg', 'xl'].includes(size);

  const markNode = (
    <span
      style={{
        width: conf.box,
        height: conf.box,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          // Decorative when text is present; descriptive when icon-only
          alt={isIconOnly ? 'PrintPass Logo' : ''}
          width={conf.mark}
          height={conf.mark}
          style={{ display: 'block', objectFit: 'contain' }}
          loading="eager"
        />
      ) : (
        <LogoMark size={conf.mark} gradientId={gradientId} />
      )}
    </span>
  );

  const wordmarkNode = !isIconOnly && !isMarkOnly && (
    <span
      style={{
        fontSize: conf.text,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        color: 'var(--text-primary, #0F172A)',
      }}
    >
      Print<span style={{ color: BRAND_START }}>Pass</span>
      {showTagline && (
        <span
          style={{
            display: 'block',
            fontSize: `calc(${conf.text} * 0.55)`,
            fontWeight: 600,
            color: 'var(--text-tertiary, #64748B)',
            letterSpacing: '0.06em',
            marginTop: 3,
          }}
        >
          {tagline}
        </span>
      )}
    </span>
  );

  const innerContent = (
    <>
      {markNode}
      {wordmarkNode}
    </>
  );

  const wrapperStyle = { display: 'inline-flex', alignItems: 'center', gap: conf.gap };

  const animatedInner = animated ? (
    <Motion.span
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={wrapperStyle}
    >
      {innerContent}
    </Motion.span>
  ) : (
    <span style={wrapperStyle}>{innerContent}</span>
  );

  if (!linkTo) {
    return (
      <div className={`navbar-brand ${className}`} aria-label="PrintPass">
        {animatedInner}
      </div>
    );
  }

  return (
    <Link
      to={linkTo}
      className={`navbar-brand ${className}`}
      aria-label="PrintPass"
      {...rest}
    >
      {animatedInner}
    </Link>
  );
};

export default Logo;