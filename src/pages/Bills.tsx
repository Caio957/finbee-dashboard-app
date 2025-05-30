
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, CheckCircle } from "lucide-react";

interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  category: string;
  recurring: boolean;
}

const bills: Bill[] = [
  {
    id: "1",
    description: "Aluguel",
    amount: 1200,
    dueDate: "2024-02-05",
    status: "pending",
    category: "Moradia",
    recurring: true
  },
  {
    id: "2",
    description: "Energia Elétrica",
    amount: 120,
    dueDate: "2024-02-10",
    status: "pending",
    category: "Utilities",
    recurring: true
  },
  {
    id: "3",
    description: "Internet",
    amount: 89,
    dueDate: "2024-02-15",
    status: "pending",
    category: "Utilities",
    recurring: true
  },
  {
    id: "4",
    description: "Seguro do Carro",
    amount: 350,
    dueDate: "2024-01-28",
    status: "paid",
    category: "Transporte",
    recurring: false
  },
  {
    id: "5",
    description: "Academia",
    amount: 89,
    dueDate: "2024-01-25",
    status: "overdue",
    category: "Saúde",
    recurring: true
  }
];

export default function Bills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Bill["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const totalPending = bills.filter(bill => bill.status === "pending").reduce((sum, bill) => sum + bill.amount, 0);
  const totalOverdue = bills.filter(bill => bill.status === "overdue").reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Faturas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas contas e compromissos</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Fatura
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {totalPending.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalOverdue.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">faturas vencendo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.409,00</div>
            <p className="text-xs text-muted-foreground">total do período</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar faturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                Todas
              </Button>
              <Button 
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
              >
                Pendentes
              </Button>
              <Button 
                variant={statusFilter === "paid" ? "default" : "outline"}
                onClick={() => setStatusFilter("paid")}
              >
                Pagas
              </Button>
              <Button 
                variant={statusFilter === "overdue" ? "default" : "outline"}
                onClick={() => setStatusFilter("overdue")}
              >
                Vencidas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{bill.description}</p>
                      {bill.recurring && <Badge variant="outline" className="text-xs">Recorrente</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{bill.category}</span>
                      <span>•</span>
                      <span>Vence em {new Date(bill.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      R$ {bill.amount.toLocaleString('pt-BR')}
                    </div>
                    {getStatusBadge(bill.status)}
                  </div>
                  {bill.status === "pending" && (
                    <Button size="sm" className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Pagar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
