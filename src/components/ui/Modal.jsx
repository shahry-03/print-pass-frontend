import {
  useEffect, useRef, useId, useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Exported for consumers / validation
export const MODAL_SIZES = ['sm', 'md', 'lg', 'xl', 'full'];

// Elements that can receive focus inside the modal
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Modal — Accessible, animated, focus-trapped dialog.
 *
 * Features:
 * - Rendered via Portal (top-level DOM — no z-index/overflow issues)
 * - `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
 * - Focus trap: Tab/Shift+Tab stay inside the modal
 * - Escape key closes (unless `closeOnEsc={false}`)
 * - Restores focus to the previously-focused element on close
 * - Locks body scroll while open (preserves existing styles)
 * - Backdrop click protection (mouse-down-then-drag won't close)
 * - 5 size variants (sm, md, lg, xl, full)
 * - Optional `hideClose` for mandatory-action modals
 * - Auto-focuses first focusable element (or `initialFocus` ref)
 * - Forwards extra props to the dialog element
 *
 * @example
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
 *     <p>Are you sure?</p>
 *   </Modal>
 *
 *   <Modal
 *     isOpen={open}
 *     onClose={close}
 *     title="Delete Shop"
 *     size="sm"
 *     footer={<><Button variant="ghost" onClick={close}>Cancel</Button>
 *               <Button variant="danger" onClick={del}>Delete</Button></>}
 *   >
 *     ...
 *   </Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnBackdrop = true,
  hideClose = false,
  initialFocus,
  className = '',
  ...props
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const backdropRef = useRef(null);
  const previousFocusRef = useRef(null);
  const mouseDownOnBackdropRef = useRef(false);

  // ── Dev validation ──
  if (import.meta.env.DEV) {
    if (!MODAL_SIZES.includes(size)) {
      console.warn(
        `[Modal] Unknown size "${size}". Falling back to "md". ` +
        `Valid: ${MODAL_SIZES.join(', ')}.`
      );
    }
    if (isOpen && !title && !props['aria-label'] && !props['aria-labelledby']) {
      console.warn(
        '[Modal] No accessible name provided. Pass `title`, or set ' +
        '`aria-label` / `aria-labelledby` for screen-reader users.'
      );
    }
  }

  const safeSize = MODAL_SIZES.includes(size) ? size : 'md';

  // ── Save previous focus when opening, restore on close ──
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current && previousFocusRef.current.focus) {
      // Only restore if the element is still in the DOM
      if (document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // ── Body scroll lock ──
  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isOpen]);

  // ── Escape closes ──
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeOnEsc, onClose]);

  // ── Focus trap: Tab / Shift+Tab cycle within modal ──
  useEffect(() => {
    if (!isOpen) return undefined;

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetParent !== null); // visible only
      if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isOpen]);

  // ── Auto-focus initial element on open ──
  useEffect(() => {
    if (!isOpen) return undefined;

    const timer = setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      // 1. Consumer-provided ref
      if (initialFocus?.current) {
        initialFocus.current.focus();
        return;
      }
      // 2. First focusable
      const first = dialog.querySelector(FOCUSABLE_SELECTOR);
      if (first) {
        first.focus();
        return;
      }
      // 3. Fallback — focus the dialog itself
      dialog.focus();
    }, 50); // after mount animation starts

    return () => clearTimeout(timer);
  }, [isOpen, initialFocus]);

  // ── Backdrop click protection (mouse-down target must be backdrop) ──
  const handleBackdropMouseDown = useCallback((e) => {
    mouseDownOnBackdropRef.current = e.target === backdropRef.current;
  }, []);

  const handleBackdropClick = useCallback((e) => {
    if (
      closeOnBackdrop &&
      mouseDownOnBackdropRef.current &&
      e.target === backdropRef.current
    ) {
      onClose?.();
    }
    mouseDownOnBackdropRef.current = false;
  }, [closeOnBackdrop, onClose]);

  const handleCloseClick = useCallback(() => onClose?.(), [onClose]);

  // ── SSR safety: don't portal during SSR ──
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          ref={backdropRef}
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={handleBackdropMouseDown}
          onClick={handleBackdropClick}
        >
          <Motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={`modal-content modal-${safeSize} ${className}`.trim()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            <div className="modal-header">
              {title && <h3 id={titleId}>{title}</h3>}
              {!hideClose && (
                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseClick}
                  aria-label="Close dialog"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>

            {description && (
              <p id={descriptionId} className="modal-description">
                {description}
              </p>
            )}

            <div className="modal-body">{children}</div>

            {footer && <div className="modal-footer">{footer}</div>}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;