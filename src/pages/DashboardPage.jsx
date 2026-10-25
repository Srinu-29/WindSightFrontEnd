import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, ChartNoAxesCombined } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Panel from '../components/dashboard/Panel.jsx';
import { getHealth } from '../services/api.js';

export default function DashboardPage() {
  // State controls the connection message. attempt is a counter used to rerun
  // the connection check when the user presses the retry button.
  const [status, setStatus] = useState('checking');
  // [value, setter] is array destructuring: useState returns a pair. Calling the
  // setter schedules a new render; directly assigning the value would not do so.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    // Effects run after rendering. Each attempt gets its own controller and
    // eight-second timer. Aborting stops waiting for a slow or unwanted request.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    // Prevent an old request from updating the page after cleanup or a new attempt.
    let active = true;
    // let allows reassignment (cleanup changes active). () => ... is an arrow
    // function: a callback passed to run later, rather than called immediately.
    setStatus('checking');
    // .then handles success, .catch handles rejection, and .finally runs after
    // either outcome. These methods chain actions onto the request's Promise.
    getHealth(controller.signal).then(() => { if (active) setStatus('connected'); })
      .catch(() => { if (active) setStatus('offline'); }).finally(() => clearTimeout(timeout));
    // Cleanup runs before another attempt and when this page is removed. finally
    // above also clears the timer on completion. This supports StrictMode checks.
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  // Dependency array: run on first mount and whenever attempt changes.
  }, [attempt]);

  return <DashboardLayout>
    {/* Inside JSX, braces evaluate JavaScript. .map turns each array item into
        a component, and key helps React match items between renders. The status
        expressions use condition ? valueIfTrue : valueIfFalse. The button's
        value => value + 1 receives the latest counter before incrementing it. */}
    {/* JSX describes the UI. Tailwind className utilities control appearance;
        md:/lg:/xl: apply styles at larger screen sizes. The cards below are
        empty states, not market data: this page only calls the health endpoint. */}
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-8">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Purchasing workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Market overview</h1><p className="mt-2 text-sm text-slate-500">A clear view of your electricity purchasing landscape.</p></div>
      <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">United Kingdom · GBP · Europe/London</span>
    </header>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{['Wholesale electricity', 'Wind generation', 'Purchasing outlook'].map(title => <Panel key={title} title={title}><div className="mt-5 flex items-center justify-between"><span className="text-3xl text-slate-300">—</span><ArrowUpRight size={18} className="text-slate-300" aria-hidden="true" /></div><p className="mt-3 text-xs text-slate-500">Awaiting data integration</p></Panel>)}</div>
    {/* The market panel reserves space for future charts. The status panel uses
        role="status" for screen-reader announcements. Its button increments
        attempt with the latest state value and is disabled while checking. */}
    <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
      <Panel title="Electricity market activity"><div className="flex min-h-72 flex-col items-center justify-center text-center"><ChartNoAxesCombined className="mb-5 text-teal-600" size={36} aria-hidden="true" /><h3 className="font-medium">Your market view starts here</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Charts will appear once market data is connected. No live prices or forecasts are loaded.</p></div></Panel>
      <Panel title="Workspace status"><div className="mt-6 flex items-center gap-3"><Activity size={20} className="text-teal-700" aria-hidden="true" /><span role="status" className="text-sm font-medium">{status === 'connected' ? 'Backend connected' : status === 'checking' ? 'Checking backend…' : 'Backend unavailable'}</span></div><p className="mt-4 text-sm leading-6 text-slate-500">{status === 'offline' ? 'Start the backend and check your API configuration, then retry.' : 'The workspace is ready for the next stage of development.'}</p><button onClick={() => setAttempt(value => value + 1)} disabled={status === 'checking'} className="mt-6 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50">Check connection</button></Panel>
    </div>
    <p className="mt-8 text-xs text-slate-400">WindSight · Foundation workspace · No market data connected</p>
  </DashboardLayout>;
}
