// src/pages/Accounts.tsx (VERSÃO CORRIGIDA)

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

// --- CORREÇÃO NAS IMPORTAÇÕES ---
import type { Account } from "@/types"; // Corrige o import do tipo
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useAccounts";
import { AccountFormDialog } from "@/components/AccountFormDialog";
// --- FIM DA CORREÇÃO ---

export default function Accounts() {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleOpenDialog = (account: Account | null = null) => {
    setSelectedAccount(account);
    setIsDialogOpen(true);
  };

  const handleSaveAccount = async (formData: Omit<Account, "id" | "created_at" | "user_id" | "balance">) => {
    if (selectedAccount) {
      // Lógica de Edição
      await updateAccount.mutateAsync({ id: selectedAccount.id, ...formData });
    } else {
      // Lógica de Criação
      await createAccount.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    setSelectedAccount(null);
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta? Todas as transações relacionadas serão mantidas, mas desvinculadas.")) {
      await deleteAccount.mutateAsync(id);
    }
  };

  if (isLoading) return <div className="p-6">Carregando contas...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e saldos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{account.name}</span>
                <Badge variant="outline">{account.type === 'checking' ? 'Corrente' : 'Poupança'}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(account)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AccountFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveAccount}
        account={selectedAccount}
      />
    </div>
  );
}
