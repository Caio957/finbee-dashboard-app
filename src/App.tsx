
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import CreditCards from "./pages/CreditCards";
import Bills from "./pages/Bills";
import Investments from "./pages/Investments";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1">
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4">
                  <SidebarTrigger />
                </div>
              </div>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/credit-cards" element={<div className="p-6"><h1 className="text-3xl font-bold">Cartão de Crédito</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
                <Route path="/bills" element={<div className="p-6"><h1 className="text-3xl font-bold">Faturas a Pagar</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
                <Route path="/investments" element={<div className="p-6"><h1 className="text-3xl font-bold">Investimentos</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<div className="p-6"><h1 className="text-3xl font-bold">Configurações</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
