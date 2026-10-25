export default function Panel({ title, children, className = '' }) {
  // export default is this file's main export (import it without { braces }).
  // { title, ... } destructures an object; className = '' is used if that prop
  // is undefined. Backtick strings allow ${...} interpolation in the JSX below.
  // Reusable card: title becomes a heading; children supplies the card contents.
  // Optional className adds page-specific styles while keeping shared defaults.
  // Destructuring in the parameter list reads these values from React props.
  return <section className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}><h2 className="text-base font-semibold">{title}</h2>{children}</section>;
}
