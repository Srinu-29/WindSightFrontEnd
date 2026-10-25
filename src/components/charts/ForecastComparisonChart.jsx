import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function ForecastComparisonChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-slate-400">
        Loading chart data…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-slate-400">
        No delivery periods available for this date.
      </div>
    );
  }

  const hasValues = data.some(
    (item) => item.forecastMW !== null || item.actualMW !== null,
  );
  if (!hasValues) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center text-center text-sm text-slate-400">
        <p className="font-medium text-slate-600">
          No Elexon records found for this date
        </p>
        <p className="mt-1 text-xs">
          There are no published forecasts or actuals available in the Elexon
          stream for this day.
        </p>
      </div>
    );
  }

  // Format data points for readable display on the X-axis
  const formattedData = data.map((item) => {
    let timeLabel = `SP ${item.settlementPeriod}`;
    if (item.startTime) {
      const d = new Date(item.startTime);
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const mins = String(d.getUTCMinutes()).padStart(2, "0");
      timeLabel = `${hours}:${mins}`;
    }
    return {
      ...item,
      timeLabel,
      forecast: item.forecastMW !== null ? Math.round(item.forecastMW) : null,
      actual: item.actualMW !== null ? Math.round(item.actualMW) : null,
      signedError:
        item.signedErrorMW !== null ? Math.round(item.signedErrorMW) : null,
    };
  });

  return (
    <div className="w-full">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={11}
              interval={3}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(value) => `${value.toLocaleString()} MW`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const record = payload[0]?.payload;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md">
                    <p className="text-xs font-semibold text-slate-600">
                      Time: {label} UTC (SP {record?.settlementPeriod})
                    </p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p className="flex justify-between gap-4 font-medium text-teal-700">
                        <span>Expected Wind Generation:</span>
                        <span>
                          {record?.forecast !== null
                            ? `${record.forecast.toLocaleString()} MW`
                            : "N/A"}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4 font-medium text-slate-800">
                        <span>Actual Generation:</span>
                        <span>
                          {record?.actual !== null
                            ? `${record.actual.toLocaleString()} MW`
                            : "N/A"}
                        </span>
                      </p>
                      {record?.signedError !== null && (
                        <p className="flex justify-between gap-4 border-t border-slate-100 pt-1 text-slate-500">
                          <span>Signed Error:</span>
                          <span>
                            {record.signedError > 0
                              ? `+${record.signedError}`
                              : record.signedError}{" "}
                            MW
                          </span>
                        </p>
                      )}
                      {record?.forecastPublishTime && (
                        <p className="border-t border-slate-100 pt-1 text-[11px] text-slate-400">
                          Forecast Updated At:{" "}
                          {new Date(record.forecastPublishTime)
                            .toISOString()
                            .replace("T", " ")
                            .slice(0, 16)}{" "}
                          UTC
                        </p>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Expected Wind Generation (MW)"
              stroke="#0f766e"
              strokeWidth={2.5}
              // WINDFOR supplies hourly points while the chart also contains
              // half-hour actuals. Join the available hourly forecast points so
              // clients can see the expected-generation trend as one clear line.
              // Missing values remain null and are still excluded from metrics.
              connectNulls
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Generation (MW)"
              stroke="#1e293b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          UTC delivery intervals across 48 half-hour settlement periods
        </span>
        <span>
          Green solid: Expected Wind Generation · Black dashed: Actual
          Generation
        </span>
      </div>
    </div>
  );
}
