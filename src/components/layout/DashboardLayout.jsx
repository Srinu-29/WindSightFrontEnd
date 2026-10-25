import { Wind, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({ children }) {
  // children is the content placed inside <DashboardLayout>...</DashboardLayout>.
  // This component supplies shared navigation and the main content container.
  // On large screens, the grid has a 240px sidebar and a flexible content column.
  // aria-current identifies the active page; decorative icons use aria-hidden
  // so screen readers do not announce redundant labels.
  return <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="flex flex-col bg-[#102d35] px-6 py-8 text-white">
      <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight"><Wind className="text-teal-300" aria-hidden="true" />WindSight</div>
      <p className="mt-2 text-xs text-slate-300">ELECTRICITY INTELLIGENCE</p>
      <nav aria-label="Main navigation" className="mt-12"><a href="/" aria-current="page" className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm"><LayoutDashboard size={18} aria-hidden="true" />Overview</a></nav>
      <div className="mt-auto pt-16 text-xs leading-6 text-slate-300">UK electricity purchasing<br />Workspace · Initial setup</div>
    </aside>
    <main className="mx-auto w-full max-w-[1600px] px-6 py-10 lg:px-12">{children}</main>
  </div>;
}
