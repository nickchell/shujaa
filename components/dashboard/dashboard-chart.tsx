"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    total: 15,
  },
  {
    name: "Feb",
    total: 40,
  },
  {
    name: "Mar",
    total: 65,
  },
  {
    name: "Apr",
    total: 90,
  },
  {
    name: "May",
    total: 120,
  },
  {
    name: "Jun",
    total: 165,
  },
  {
    name: "Jul",
    total: 210,
  },
  {
    name: "Aug",
    total: 250,
  },
]

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}MB`}
        />
        <Tooltip
          formatter={(value: number) => [`${value}MB`, "Data Earned"]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Bar 
          dataKey="total" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]}
          className="hover:opacity-80"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}