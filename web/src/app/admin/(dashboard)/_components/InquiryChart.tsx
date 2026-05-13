"use client"

import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export type ChartPoint = { day: string; label: string; count: number }

type Props = { data: ChartPoint[] }

export function InquiryChart({ data }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-md">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Inquiry Trends</p>
          <p className="mt-0.5 text-xs text-slate-500">Daily contact form submissions</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-white">{total}</p>
          <p className="text-[10px] text-slate-500">last 7 days</p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        {mounted ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="copperGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B87333" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#B87333" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="transparent"
                tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0c1524",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                itemStyle={{ color: "#B87333" }}
                labelStyle={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}
                cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Inquiries"
                stroke="#B87333"
                strokeWidth={2}
                fill="url(#copperGrad)"
                dot={{ fill: "#B87333", r: 3, strokeWidth: 0 }}
                activeDot={{ fill: "#d4974a", r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] animate-pulse rounded-xl bg-white/[0.04]" />
        )}
      </div>
    </div>
  )
}
