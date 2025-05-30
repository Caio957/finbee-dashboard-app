
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseChart } from "@/components/ExpenseChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
  { month: 'Jan', receitas: 5800, despesas: 3300, saldo: 2500 },
  { month: 'Fev', receitas: 5800, despesas: 3800, saldo: 2000 },
  { month: 'Mar', receitas: 6200, despesas: 3200, saldo: 3000 },
  { month: 'Abr', receitas: 5800, despesas: 4100, saldo: 1700 },
  { month: 'Mai', receitas: 6500, despesas: 3600, saldo: 2900 },
  { month: 'Jun', receitas: 5800, despesas: 3400, saldo: 2400 },
];

const patrimonioData = [
  { month: 'Jan', patrimonio: 18500 },
  { month: 'Fev', patrimonio: 20500 },
  { month: 'Mar', patrimonio: 23500 },
  { month: 'Abr', patrimonio: 25200 },
  { month: 'Mai', patrimonio: 28100 },
  { month: 'Jun', patrimonio: 30500 },
];

export default function Reports() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="last6months">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastmonth">Último mês</SelectItem>
              <SelectItem value="last3months">Últimos 3 meses</SelectItem>
              <SelectItem value="last6months">Últimos 6 meses</SelectItem>
              <SelectItem value="lastyear">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Exportar PDF</Button>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 35.900,00</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 21.400,00</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 14.500,00</div>
            <p className="text-xs text-muted-foreground">40% das receitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gasto Médio Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 3.567,00</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
                  <Bar dataKey="receitas" fill="#16a34a" name="Receitas" />
                  <Bar dataKey="despesas" fill="#dc2626" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart />
          </CardContent>
        </Card>
      </div>

      {/* Evolução do Patrimônio */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patrimonioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Patrimônio']} />
                <Line 
                  type="monotone" 
                  dataKey="patrimonio" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Maiores Gastos por Categoria</h4>
              <div className="space-y-2">
                {[
                  { category: "Moradia", amount: 12000, percentage: 56 },
                  { category: "Alimentação", amount: 4200, percentage: 20 },
                  { category: "Transporte", amount: 3600, percentage: 17 },
                  { category: "Lazer", amount: 1600, percentage: 7 }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{item.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">R$ {item.amount.toLocaleString('pt-BR')}</span>
                      <span className="text-xs text-muted-foreground ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Metas de Economia</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Meta Mensal (30%)</span>
                    <span>R$ 1.740 / R$ 2.500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '69.6%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Meta Emergência (3x despesas)</span>
                    <span>R$ 30.500 / R$ 10.200</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
