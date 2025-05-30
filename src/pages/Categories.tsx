
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  transactionCount: number;
}

const categories: Category[] = [
  { id: "1", name: "Salário", type: "income", color: "#16a34a", icon: "💰", transactionCount: 12 },
  { id: "2", name: "Freelance", type: "income", color: "#059669", icon: "💻", transactionCount: 8 },
  { id: "3", name: "Alimentação", type: "expense", color: "#dc2626", icon: "🍽️", transactionCount: 45 },
  { id: "4", name: "Transporte", type: "expense", color: "#ea580c", icon: "🚗", transactionCount: 23 },
  { id: "5", name: "Moradia", type: "expense", color: "#b91c1c", icon: "🏠", transactionCount: 6 },
  { id: "6", name: "Lazer", type: "expense", color: "#9333ea", icon: "🎮", transactionCount: 18 },
  { id: "7", name: "Saúde", type: "expense", color: "#0891b2", icon: "⚕️", transactionCount: 12 },
  { id: "8", name: "Educação", type: "expense", color: "#7c3aed", icon: "📚", transactionCount: 4 }
];

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || category.type === filterType;
    return matchesSearch && matchesType;
  });

  const incomeCategories = filteredCategories.filter(cat => cat.type === "income");
  const expenseCategories = filteredCategories.filter(cat => cat.type === "expense");

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Organize suas transações por categorias</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button 
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
              >
                Todas
              </Button>
              <Button 
                variant={filterType === "income" ? "default" : "outline"}
                onClick={() => setFilterType("income")}
              >
                Receitas
              </Button>
              <Button 
                variant={filterType === "expense" ? "default" : "outline"}
                onClick={() => setFilterType("expense")}
              >
                Despesas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categorias de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(cat => cat.type === "income").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categorias de Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {categories.filter(cat => cat.type === "expense").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.transactionCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias de Receita */}
      {(filterType === "all" || filterType === "income") && incomeCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">📈</span>
              Categorias de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.transactionCount} transações
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Receita
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorias de Despesa */}
      {(filterType === "all" || filterType === "expense") && expenseCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-red-600">📉</span>
              Categorias de Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.transactionCount} transações
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Despesa
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
