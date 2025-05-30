
import { 
  Home, 
  Wallet, 
  CreditCard, 
  PieChart, 
  Settings,
  FileText,
  TrendingUp,
  Calendar,
  Category
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Transações",
    url: "/transactions",
    icon: FileText,
  },
  {
    title: "Contas",
    url: "/accounts",
    icon: Wallet,
  },
  {
    title: "Cartão de Crédito",
    url: "/credit-cards",
    icon: CreditCard,
  },
  {
    title: "Faturas a Pagar",
    url: "/bills",
    icon: Calendar,
  },
  {
    title: "Investimentos",
    url: "/investments",
    icon: TrendingUp,
  },
  {
    title: "Categorias",
    url: "/categories",
    icon: Category,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: PieChart,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FinanceApp
          </h2>
          <p className="text-sm text-muted-foreground">Controle Financeiro</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          © 2024 FinanceApp
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
