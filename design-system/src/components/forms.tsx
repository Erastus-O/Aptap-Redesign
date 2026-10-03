/**
 * FORMS (molecules) — Field, TextField, SelectField, Checkbox, Radio, OptionCard, Switch, SegmentedControl.
 * Every control is labelled, error text is linked via aria-describedby, and errors are never colour-only
 * (icon + text + aria-invalid).
 */
import { useId, useRef, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode, type KeyboardEvent } from "react";
import { cx } from "./atoms";
import { AlertCircle } from "./icons";

/* ---------------- Field wrapper ---------------- */
export interface FieldProps {
  label: string;
  /** Shown after the label as "(optional)". Prefer marking optional fields over starring required ones. */
  optional?: boolean;
  helper?: ReactNode;
  error?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
}

export function Field({ label, optional, helper, error, children, className }: FieldProps) {
  const id = useId();
  const helperId = helper ? `${id}-help` : undefined;
  const errorId = error ? `${id}-err` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("ap-field", className)}>
      <label className="ap-field__label" htmlFor={id}>
        {label}{optional && <span className="ap-field__optional"> (optional)</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error && <p className="ap-field__error" id={errorId}><AlertCircle size="sm" />{error}</p>}
      {helper && <p className="ap-field__helper" id={helperId}>{helper}</p>}
    </div>
  );
}

export function TextField({ label, optional, helper, error, icon, ...input }: Omit<FieldProps, "children"> & { icon?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} optional={optional} helper={helper} error={error}>
      {({ id, describedBy, invalid }) => {
        const el = <input id={id} className="ap-input" aria-describedby={describedBy} aria-invalid={invalid || undefined} {...input} />;
        return icon ? <div className="ap-input-group">{icon}{el}</div> : el;
      }}
    </Field>
  );
}

export function SelectField({ label, optional, helper, error, options, placeholder, ...select }: Omit<FieldProps, "children"> & { options: Array<{ value: string; label: string }>; placeholder?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} optional={optional} helper={helper} error={error}>
      {({ id, describedBy, invalid }) => (
        <select id={id} className="ap-select" aria-describedby={describedBy} aria-invalid={invalid || undefined} {...select}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}

/* ---------------- Checkbox / Radio ---------------- */
type ChoiceProps = { label: ReactNode; hint?: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ label, hint, className, ...input }: ChoiceProps) {
  return (
    <label className={cx("ap-choice", className)}>
      <input type="checkbox" className="ap-choice__control" {...input} />
      <span className="ap-choice__label">{label}{hint && <span className="ap-choice__hint">{hint}</span>}</span>
    </label>
  );
}

export function Radio({ label, hint, className, ...input }: ChoiceProps) {
  return (
    <label className={cx("ap-choice", className)}>
      <input type="radio" className="ap-choice__control" {...input} />
      <span className="ap-choice__label">{label}{hint && <span className="ap-choice__hint">{hint}</span>}</span>
    </label>
  );
}

/** Large tappable radio for quote questions ("Who's your broadband with now?"). Group inside <fieldset className="ap-fieldset"> with a <legend>. */
export function OptionCard({ label, hint, media, ...input }: ChoiceProps & { media?: ReactNode }) {
  return (
    <label className="ap-option-card">
      <input type="radio" className="ap-choice__control" {...input} />
      {media}
      <span className="ap-choice__label">{label}{hint && <span className="ap-choice__hint">{hint}</span>}</span>
    </label>
  );
}

/* ---------------- Switch ---------------- */
/** Immediate on/off setting. Not for form submission choices — use Checkbox there. */
export function Switch({ label, ...input }: { label: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role">) {
  return (
    <label className="ap-switch">
      <input type="checkbox" role="switch" className="ap-switch__control" {...input} />
      <span>{label}</span>
    </label>
  );
}

/* ---------------- Segmented control (radiogroup) ---------------- */
export interface SegmentedControlProps<T extends string> {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

/** Single choice among 2–4 views, e.g. sort by Price / Speed / Value. Arrow keys move selection (WAI-ARIA radiogroup). */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div className="ap-segmented" role="radiogroup" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o.value} ref={(el) => { refs.current[i] = el; }}
          type="button" role="radio" aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1}
          className="ap-segmented__option" onClick={() => onChange(o.value)} onKeyDown={(e) => onKey(e, i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
