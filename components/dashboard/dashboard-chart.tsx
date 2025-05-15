"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Task } from "@/lib/types/task"

interface DashboardChartProps {
  tasks: Task[];
}

export function DashboardChart({ tasks }: DashboardChartProps) {
  // Process tasks data for the chart
  const chartData = tasks.reduce((acc: { name: string; total: number; completed: number }[], task) => {
    const date = new Date(task.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    
    const existingMonth = acc.find(item => item.name === month);
    if (existingMonth) {
      existingMonth.total += task.reward || 0;
      if (task.is_completed) {
        existingMonth.completed += task.reward || 0;
      }
    } else {
      acc.push({ 
        name: month, 
        total: task.reward || 0,
        completed: task.is_completed ? (task.reward || 0) : 0
      });
    }
    
    return acc;
  }, []);

  // Sort data by month
  chartData.sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.name) - months.indexOf(b.name);
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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
          tickFormatter={(value) => `KSh ${value}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `KSh ${value}`,
            name === 'total' ? 'Total Rewards' : 'Earned Rewards'
          ]}
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
          name="Total Rewards"
        />
        <Bar 
          dataKey="completed" 
          fill="hsl(var(--success))" 
          radius={[4, 4, 0, 0]}
          className="hover:opacity-80"
          name="Earned Rewards"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}