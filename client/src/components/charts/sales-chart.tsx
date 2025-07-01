import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SalesChartProps {
  data: Array<{
    name: string;
    ventas: number;
    objetivos: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => [`€${value.toLocaleString()}`, name]}
          labelFormatter={(label) => `Mes: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="ventas" 
          stroke="hsl(340, 75%, 65%)" 
          strokeWidth={3}
          name="Ventas"
          dot={{ fill: "hsl(340, 75%, 65%)", strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="objetivos" 
          stroke="hsl(45, 85%, 70%)" 
          strokeWidth={3}
          name="Objetivos"
          dot={{ fill: "hsl(45, 85%, 70%)", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
