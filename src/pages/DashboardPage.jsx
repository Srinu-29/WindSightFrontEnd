import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  Clock,
  Gauge,
  Info,
  TrendingDown,
  TrendingUp,
  Wind,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Panel from "../components/dashboard/Panel.jsx";
import ForecastComparisonChart from "../components/charts/ForecastComparisonChart.jsx";
import { getAccuracy, getHealth } from "../services/api.js";

export default function DashboardPage() {
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);
  const [decisionDate, setDecisionDate] = useState("2026-01-10");
  const [accuracyData, setAccuracyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check backend health
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let active = true;

    setStatus("checking");
    getHealth(controller.signal)
      .then(() => {
        if (active) setStatus("connected");
      })
      .catch(() => {
        if (active) setStatus("offline");
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  // Fetch forecast and accuracy metrics for the selected decision date
  useEffect(() => {
    if (status !== "connected") return;

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);

    getAccuracy(decisionDate, undefined, controller.signal)
      .then((data) => {
        if (active) {
          setAccuracyData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active && err.name !== "AbortError") {
          setError(err.message || "Failed to load accuracy data");
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [decisionDate, status]);

  const metrics = accuracyData?.metrics;

  return (
    <DashboardLayout>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            Purchasing workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Market overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Historical day-ahead purchasing replay and forecast accuracy
            analysis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
            <Calendar size={14} className="text-teal-700" />
            <span className="font-medium">Purchase Planning Date:</span>
            <input
              type="date"
              value={decisionDate}
              onChange={(e) => setDecisionDate(e.target.value)}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-sans text-xs focus:border-teal-600 focus:outline-none"
            />
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
            United Kingdom · GBP · Europe/London
          </span>
        </div>
      </header>

      {/* Top Statistical Metric Cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Average Prediction Error */}
        <Panel title="Average Prediction Error (MAE)">
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-slate-900">
              {metrics?.maeMW !== null && metrics?.maeMW !== undefined
                ? `${metrics.maeMW.toLocaleString()} MW`
                : "—"}
            </span>
            <ArrowUpRight
              size={18}
              className="text-slate-400"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Average magnitude of prediction error across matched periods
          </p>
        </Panel>

        {/* Card 2: Over / Under Prediction */}
        <Panel title="Over / Under Prediction">
          <div className="mt-4 flex items-baseline justify-between">
            <span className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
              {metrics?.biasMW !== null && metrics?.biasMW !== undefined ? (
                <>
                  {metrics.biasMW > 0 ? (
                    <TrendingUp size={24} className="text-amber-600" />
                  ) : metrics.biasMW < 0 ? (
                    <TrendingDown size={24} className="text-blue-600" />
                  ) : null}
                  <span>
                    {metrics.biasMW > 0
                      ? `+${metrics.biasMW.toLocaleString()}`
                      : metrics.biasMW.toLocaleString()}{" "}
                    MW
                  </span>
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-600">
            {metrics?.biasDirection || "Awaiting data"}
          </p>
          {metrics &&
            Math.abs(metrics.biasMW) === metrics.maeMW &&
            metrics.matchedPeriods > 0 && (
              <p className="mt-1 text-[11px] text-amber-700">
                100% of periods were{" "}
                {metrics.biasMW > 0 ? "over-predicted" : "under-predicted"}, so
                Over / Under Prediction equals Average Prediction Error.
              </p>
            )}
        </Panel>

        {/* Card 3: Large Error Measure */}
        <Panel title="Large Error Measure (RMSE)">
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-slate-900">
              {metrics?.rmseMW !== null && metrics?.rmseMW !== undefined
                ? `${metrics.rmseMW.toLocaleString()} MW`
                : "—"}
            </span>
            <Gauge size={18} className="text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Penalizes large outlier forecast errors more heavily
          </p>
        </Panel>

      </div>

      {/* Main Analysis Section */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[2.5fr_1fr]">
        {/* Chart Panel */}
        <Panel title="Expected Wind Generation vs Actual Generation">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-teal-800">
              <Clock size={14} /> Purchase Cutoff Time:{" "}
              {accuracyData?.cutoffTime || "14:00:00"} UK Time (
              {accuracyData?.cutoffUtc
                ? new Date(accuracyData.cutoffUtc).toISOString().slice(11, 19) +
                  " UTC"
                : "14:00 UTC"}
              )
            </span>
            <span>
              Power Delivery Date: {accuracyData?.deliveryDate || "—"}
            </span>
          </div>

          {error ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center text-sm text-red-600">
              <p className="font-medium">Failed to load market data</p>
              <p className="mt-1 text-xs text-slate-500">{error}</p>
            </div>
          ) : (
            <ForecastComparisonChart
              data={accuracyData?.chartData}
              loading={loading}
            />
          )}
        </Panel>

        {/* Insights & Operational Status Panel */}
        <div className="space-y-6">
          <Panel title="Purchase Planning Analysis">
            <div className="mt-2 space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Purchase Cutoff Business Rule
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Only forecasts updated at or before 14:00 UK local time on{" "}
                  <span className="font-semibold text-slate-800">
                    {decisionDate}
                  </span>{" "}
                  are used. Later publications are strictly excluded to prevent
                  lookahead bias.
                </p>
              </div>

              {metrics?.biasExplanation && (
                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
                    <Info size={14} className="text-teal-700" /> Over / Under
                    Prediction Impact
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-teal-950">
                    {metrics.biasExplanation}
                  </p>
                </div>
              )}

              {metrics?.maxAbsoluteErrorMW !== null &&
                metrics?.maxAbsoluteErrorMW !== undefined && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">
                      Maximum Observed Error:
                    </span>
                    <p className="text-base font-semibold text-slate-800">
                      {metrics.maxAbsoluteErrorMW.toLocaleString()} MW
                    </p>
                  </div>
                )}

              <p className="text-xs leading-5 text-slate-400">
                Units: Megawatts (MW). Percentage accuracy (MAPE) is omitted to
                avoid division-by-zero distortion during calm wind periods.
              </p>
            </div>
          </Panel>

          <Panel title="Workspace Status">
            <div className="mt-4 flex items-center gap-3">
              <Activity
                size={20}
                className={
                  status === "connected" ? "text-teal-600" : "text-slate-400"
                }
                aria-hidden="true"
              />
              <span role="status" className="text-sm font-medium">
                {status === "connected"
                  ? "Backend Connected"
                  : status === "checking"
                    ? "Checking backend…"
                    : "Backend Unavailable"}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {status === "offline"
                ? "Make sure the backend is running on port 8000 (uvicorn app.main:app --port 8000)."
                : "FastAPI connected and supplying Elexon stream replay data."}
            </p>
            <button
              onClick={() => setAttempt((value) => value + 1)}
              disabled={status === "checking"}
              className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
            >
              Check connection
            </button>
          </Panel>
        </div>
      </div>

      <footer className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-400">
        WindSight · UK Electricity Intelligence · Connected to Elexon BMRS
        Stream API
      </footer>
    </DashboardLayout>
  );
}
