import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Input — Accessible, feature-rich text input.
 *
 * Features:
 * - Auto-links `label` ↔ `input` via `useId` (WCAG-friendly)
 * - `hint` (helper text) + `error` messaging with proper ARIA wiring
 * - Password visibility toggle (auto-detects `type="password"`)
 * - Optional leading icon + trailing icon/button
 * - Character counter when `maxLength` + `showCounter` are set
 * - Loading state (async validation feedback)
 * - Success state (green border + check icon)
 * - `aria-invalid`, `aria-describedby` auto-managed
 * - Dev warning when `label` is missing (accessibility guardrail)
 * - Forwards refs
 *
 * @example
 *   <Input label="Email" type="email" icon={Mail} error={errors.email?.message} />
 *   <Input label="Password" type="password" />  // auto show/hide toggle
 *   <Input label="Phone" hint="Include country code" />
 *   <Input label="Code" maxLength={6} showCounter loading={validating} />
 */
const Input = forwardRef(({
  label,
  error,
  hint,
  success = false,
  loading = false,
  icon: Icon,
  trailingIcon: TrailingIcon,
  onTrailingClick,
  trailingLabel,
  showCounter = false,
  maxLength,
  className = '',
  id,
  type = 'text',
  disabled,
  readOnly,
  value,
  defaultValue,
  onChange,
  ...props
}, ref) => {
  const autoId = useId();
  const inputId = id || `input-${autoId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const counterId = `${inputId}-counter`;

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [charCount, setCharCount] = useState(
    typeof value === 'string' ? value.length
      : typeof defaultValue === 'string' ? defaultValue.length
        : 0
  );

  const isPassword = type === 'password';
  const resolvedType = isPassword && passwordVisible ? 'text' : type;

  const hasError = Boolean(error);
  const showSuccess = success && !hasError && !loading;

  // ── Dev warning: label improves accessibility ──
  if (import.meta.env.DEV && !label && !props['aria-label'] && !props['aria-labelledby']) {
    console.warn(
      `[Input] No accessible label provided. ` +
      `Pass a \`label\` prop, or set \`aria-label\` / \`aria-labelledby\` ` +
      `on the input for screen-reader users.`
    );
  }

  // ── aria-describedby wiring: error > hint > counter ──
  const describedBy = [
    hasError && errorId,
    hint && !hasError && hintId,
    showCounter && maxLength && counterId,
  ].filter(Boolean).join(' ') || undefined;

  const handleChange = (event) => {
    setCharCount(event.target.value.length);
    onChange?.(event);
  };

  const wrapperClasses = [
    Icon ? 'input-with-icon' : '',
    TrailingIcon || isPassword || loading || showSuccess || hasError ? 'input-with-trailing' : '',
  ].filter(Boolean).join(' ');

  const fieldClasses = [
    'input-field',
    hasError && 'input-error',
    showSuccess && 'input-success',
    readOnly && 'input-readonly',
    className,
  ].filter(Boolean).join(' ');

  const counterCurrent = typeof value === 'string' ? value.length : charCount;
  const isNearLimit = maxLength && counterCurrent >= maxLength * 0.9;

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        {Icon && (
          <span className="input-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={fieldClasses}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          aria-busy={loading || undefined}
          {...props}
        />

        {/* Trailing slot: password toggle > loading > success > error > custom icon */}
        {(isPassword || loading || showSuccess || hasError || TrailingIcon) && (
          <span className="input-trailing">
            {isPassword && (
              <button
                type="button"
                className="input-trailing-btn"
                onClick={() => setPasswordVisible((v) => !v)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {passwordVisible
                  ? <EyeOff size={16} aria-hidden="true" />
                  : <Eye size={16} aria-hidden="true" />}
              </button>
            )}
            {loading && (
              <Loader2 size={16} className="input-trailing-spinner" aria-label="Validating" />
            )}
            {showSuccess && (
              <CheckCircle2 size={16} className="input-trailing-success" aria-label="Valid" />
            )}
            {hasError && !TrailingIcon && (
              <AlertCircle size={16} className="input-trailing-error" aria-label="Invalid" />
            )}
            {TrailingIcon && (
              <button
                type="button"
                className="input-trailing-btn"
                onClick={onTrailingClick}
                aria-label={trailingLabel}
                disabled={!onTrailingClick}
                tabIndex={onTrailingClick ? 0 : -1}
              >
                <TrailingIcon size={16} aria-hidden="true" />
              </button>
            )}
          </span>
        )}
      </div>

      {/* ── Hint / Error / Counter row ── */}
      {(hint || hasError || (showCounter && maxLength)) && (
        <div className="input-meta">
          {hasError ? (
            <span id={errorId} className="input-error-text" role="alert">
              {error}
            </span>
          ) : hint ? (
            <span id={hintId} className="input-hint-text">{hint}</span>
          ) : <span />}

          {showCounter && maxLength && (
            <span
              id={counterId}
              className={`input-counter ${isNearLimit ? 'input-counter-warning' : ''}`}
              aria-live="polite"
            >
              {counterCurrent}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;