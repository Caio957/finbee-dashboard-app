
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, CreditCard, PiggyBank } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  balance: number;
  bank: string;
  icon: React.ReactNode;
}

const accounts: Account[] = [
  {
    id: "1",
    name: "Conta Corrente",
    type: "checking",
    balance: 8500,
    bank: "Banco do Brasil",
    icon: <Wallet className="h-5 w-5" />
  },
  {
    id: "2",
    name: "Poupança",
    type: "savings",
    balance: 15000,
    bank: "Caixa Econômica",
    icon: <PiggyBank className="h-5 w-5" />
  },
  {
    id: "3",
    name: "Cartão de Crédito",
    type: "credit",
    balance: -1200,
    bank: "Nubank",
    icon: <CreditCard className="h-5 w-5" />
  }
];

export default function Accounts() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Resumo Total */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Saldo Total</p>
              <p className="text-2xl font-bold text-green-600">R$ 22.300,00</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Dívidas</p>
              <p className="text-2xl font-bold text-red-600">R$ 1.200,00</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
              <p className="text-2xl font-bold">R$ 21.100,00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {account.icon}
                <CardTitle className="text-base">{account.name}</CardTitle>
              </div>
              <Badge variant="outline">
                {account.type === "checking" && "Corrente"}
                {account.type === "savings" && "Poupança"}
                {account.type === "credit" && "Crédito"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${
                  account.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  R$ {Math.abs(account.balance).toLocaleString('pt-BR')}
                </div>
                <p className="text-sm text-muted-foreground">{account.bank}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    Extrato
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Movimentação Recente por Conta */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { account: "Conta Corrente", description: "Salário", amount: 5000, date: "15/01" },
              { account: "Cartão de Crédito", description: "Supermercado", amount: -150, date: "14/01" },
              { account: "Poupança", description: "Transferência", amount: 1000, date: "13/01" },
              { account: "Conta Corrente", description: "Uber", amount: -25, date: "12/01" }
            ].map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{movement.description}</p>
                  <p className="text-sm text-muted-foreground">{movement.account} • {movement.date}</p>
                </div>
                <div className={`font-medium ${
                  movement.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {movement.amount >= 0 ? "+" : ""}R$ {Math.abs(movement.amount).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
