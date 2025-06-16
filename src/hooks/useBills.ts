// src/hooks/useBills.ts (VERSÃO COM TIPAGEM EXPLÍCITA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Bill } from '@/types';
import type { Database } from "@/integrations/supabase/types"; // Importa o tipo Database

// Exporta explicitamente o tipo Bill do arquivo de tipos
export type { Bill } from "@/types";

// Hook para buscar todas as faturas
export const useBills = () => {
  return useQuery({
    queryKey: ["bills"],
    queryFn: async (): Promise<Bill[]> => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      return (data || []) as Bill[];
    },
  });
};

// Hook para criar uma nova fatura
export const useCreateBill = () => {
  const queryClient = useQueryClient();
  return useMutation<Bill, Error, Omit<Bill, "id" | "created_at" | "user_id">>({
    mutationFn: async (bill) => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("Usuário não autenticado.");
      
      const { data: billData, error } = await supabase
        .from("bills")
        .insert([{ ...bill, user_id: sessionData.session.user.id }])
        .select()
        .single();

      if (error) throw error;
      return billData as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Fatura adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar fatura");
    },
  });
};

// Hook para atualizar uma fatura existente
export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  return useMutation<Bill, Error, Partial<Bill> & { id: string }>({
    mutationFn: async ({ id, ...bill }) => {
      const { data: oldBill, error: fetchError } = await supabase
        .from("bills")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Explicitamente tipar oldBill como Database['public']['Tables']['bills']['Row']
      const currentBill: Database['public']['Tables']['bills']['Row'] = oldBill as Database['public']['Tables']['bills']['Row'];

      const { data, error } = await supabase
        .from("bills")
        .update(bill)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Se o status mudou para 'paid' e não havia transação vinculada, crie uma
      if (bill.status === "paid" && currentBill.status !== "paid") {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session) throw new Error("Usuário não autenticado.");

        // Buscar o category_id baseado no category da fatura
        let transactionCategoryId: string | null = null;
        if (currentBill.category) {
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("id")
            .eq("name", currentBill.category)
            .single();

          if (categoryError) {
            console.error("Erro ao buscar ID da categoria:", categoryError);
            // Decidir como lidar com este erro (ignorar, lançar, etc.)
            // Por enquanto, vamos apenas registrar o erro e prosseguir com category_id nulo
          } else if (categoryData) {
            transactionCategoryId = categoryData.id;
          }
        }

        const { error: transactionError } = await supabase.from("transactions").insert(
          {
            description: `Pagamento de fatura: ${bill.description || currentBill.description}`,
            amount: bill.amount || currentBill.amount,
            type: "expense",
            status: "completed",
            date: new Date().toISOString().split('T')[0],
            user_id: sessionData.session.user.id,
            bill_id: id, // Vincula a transação à fatura
            account_id: currentBill.account_id, // Usar o account_id da fatura antiga
            category_id: transactionCategoryId, // Usar o category_id obtido
          } as Database['public']['Tables']['transactions']['Insert']
        );

        if (transactionError) {
          console.error("Erro ao criar transação de pagamento:", transactionError);
          throw transactionError;
        }

        // Atualizar o saldo da conta (deduzir o valor)
        if (currentBill.account_id && bill.amount) {
          const { data: account, error: accountError } = await supabase
            .from("accounts")
            .select("balance")
            .eq("id", currentBill.account_id)
            .single();

          if (accountError) {
            console.error("Erro ao buscar conta:", accountError);
            throw accountError;
          }

          const { error: updateAccountError } = await supabase
            .from("accounts")
            .update({ balance: account.balance - bill.amount })
            .eq("id", currentBill.account_id);
          if (updateAccountError) {
            console.error("Erro ao atualizar saldo da conta:", updateAccountError);
            throw updateAccountError;
          }
        }
      }

      return data as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Fatura atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar fatura.");
    },
  });
};

// Hook para deletar uma fatura e sua transação de pagamento
export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await supabase.from("transactions").delete().eq("bill_id", id);
      const { error } = await supabase.from("bills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Fatura excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir fatura");
    },
  });
};

// Hook para estornar uma fatura paga
export const useRevertBillPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: async (billId: string) => {
      console.log(`Iniciando estorno para o billId: ${billId}`);
      
      // Primeiro, buscar a fatura e sua transação
      const { data: bill, error: billFetchError } = await supabase
        .from("bills")
        .select(`
          *,
          transactions (
            id,
            account_id,
            amount
          )
        `)
        .eq("id", billId)
        .single();

      if (billFetchError) {
        console.error("Erro ao buscar fatura:", billFetchError);
        throw billFetchError;
      }

      if (!bill.transactions || bill.transactions.length === 0) {
        throw new Error("Nenhuma transação encontrada para esta fatura");
      }

      const transaction = bill.transactions[0];

      if (!transaction.account_id) {
        throw new Error("Conta não encontrada para esta transação");
      }

      // Buscar a conta atual
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", transaction.account_id)
        .single();

      if (accountError) {
        console.error("Erro ao buscar conta:", accountError);
        throw accountError;
      }

      // Atualizar o saldo da conta (adicionar o valor de volta)
      const { error: updateAccountError } = await supabase
        .from("accounts")
        .update({ balance: account.balance + bill.amount })
        .eq("id", transaction.account_id);

      if (updateAccountError) {
        console.error("Erro ao atualizar saldo da conta:", updateAccountError);
        throw updateAccountError;
      }

      // Deletar a transação de pagamento vinculada à fatura
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("bill_id", billId);

      if (transactionError) {
        console.error("Erro ao deletar transação:", transactionError);
        throw transactionError;
      }

      // Atualizar o status da fatura para 'pending' e limpar o account_id
      const { error: billError } = await supabase
        .from("bills")
        .update({ status: "pending", account_id: null })
        .eq("id", billId);

      if (billError) {
        console.error("Erro ao atualizar status da fatura:", billError);
        throw billError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Pagamento estornado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro na mutação de estorno:", error);
      toast.error(error.message || "Erro ao estornar pagamento");
    },
  });
};
