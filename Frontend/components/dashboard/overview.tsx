"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    total: 120,
  },
  {
    name: "Feb",
    total: 132,
  },
  {
    name: "Mar",
    total: 145,
  },
  {
    name: "Apr",
    total: 155,
  },
  {
    name: "May",
    total: 170,
  },
  {
    name: "Jun",
    total: 185,
  },
  {
    name: "Jul",
    total: 195,
  },
  {
    name: "Aug",
    total: 210,
  },
  {
    name: "Sep",
    total: 225,
  },
  {
    name: "Oct",
    total: 240,
  },
  {
    name: "Nov",
    total: 230,
  },
  {
    name: "Dec",
    total: 245,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
