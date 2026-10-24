export default function Panel({ title, children, className = '' }) {
  return <section className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}><h2 className="text-base font-semibold">{title}</h2>{children}</section>;
}
