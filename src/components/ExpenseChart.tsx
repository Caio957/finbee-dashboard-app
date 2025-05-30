
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Alimentação', value: 1200, color: '#FF6B6B' },
  { name: 'Transporte', value: 800, color: '#4ECDC4' },
  { name: 'Moradia', value: 2000, color: '#45B7D1' },
  { name: 'Lazer', value: 600, color: '#96CEB4' },
  { name: 'Saúde', value: 400, color: '#FECA57' },
  { name: 'Outros', value: 300, color: '#FF9FF3' },
];

export function ExpenseChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
