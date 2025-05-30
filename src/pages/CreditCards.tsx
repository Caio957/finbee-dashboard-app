
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, CreditCard, Calendar, DollarSign } from "lucide-react";

interface CreditCardData {
  id: string;
  name: string;
  bank: string;
  limit: number;
  used: number;
  dueDate: string;
  closingDate: string;
  status: "active" | "blocked";
}

const creditCards: CreditCardData[] = [
  {
    id: "1",
    name: "Nubank Roxinho",
    bank: "Nubank",
    limit: 5000,
    used: 1200,
    dueDate: "2024-02-10",
    closingDate: "2024-01-25",
    status: "active"
  },
  {
    id: "2",
    name: "Itaú Click",
    bank: "Itaú",
    limit: 3000,
    used: 850,
    dueDate: "2024-02-15",
    closingDate: "2024-01-30",
    status: "active"
  }
];

export default function CreditCards() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cartão de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões e faturas</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Cartão
        </Button>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 8.000,00</div>
            <p className="text-xs text-muted-foreground">Todos os cartões</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fatura Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 2.050,00</div>
            <p className="text-xs text-muted-foreground">25,6% do limite</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 5.950,00</div>
            <p className="text-xs text-muted-foreground">74,4% do limite</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cartões */}
      <div className="grid gap-4 md:grid-cols-2">
        {creditCards.map((card) => {
          const usagePercentage = (card.used / card.limit) * 100;
          const available = card.limit - card.used;
          
          return (
            <Card key={card.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                </div>
                <Badge variant={card.status === "active" ? "default" : "destructive"}>
                  {card.status === "active" ? "Ativo" : "Bloqueado"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{card.bank}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Limite usado</span>
                    <span>R$ {card.used.toLocaleString('pt-BR')} de R$ {card.limit.toLocaleString('pt-BR')}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Disponível: R$ {available.toLocaleString('pt-BR')} ({(100 - usagePercentage).toFixed(1)}%)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Fechamento
                    </p>
                    <p className="font-medium">{new Date(card.closingDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Vencimento
                    </p>
                    <p className="font-medium">{new Date(card.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Fatura
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Últimas Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações do Cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { description: "Supermercado Extra", amount: 150, date: "14/01", card: "Nubank Roxinho" },
              { description: "Netflix", amount: 32.90, date: "13/01", card: "Itaú Click" },
              { description: "Uber", amount: 25, date: "12/01", card: "Nubank Roxinho" },
              { description: "Farmácia", amount: 67.50, date: "11/01", card: "Itaú Click" }
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.card} • {transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">R$ {transaction.amount.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
