
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  status: "completed" | "pending";
  date: string;
  account_id: string | null;
  category_id: string | null;
  created_at: string;
  credit_card_id?: string | null;
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          accounts(name, bank),
          categories(name, color, icon)
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as Transaction[];
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas para atualizar os saldos
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Transação criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar transação");
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...transaction }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(transaction)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas para atualizar os saldos
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Transação atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar transação");
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting transaction: ${id}`);
      
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      console.log("Transaction deleted successfully, invalidating all related queries");
      
      // Invalidar todas as queries relacionadas para atualizar os saldos
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      
      // Forçar refetch imediato das contas para garantir atualização
      queryClient.refetchQueries({ queryKey: ["accounts"] });
      
      toast.success("Transação estornada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error deleting transaction:", error);
      toast.error(error.message || "Erro ao estornar transação");
    },
  });
};
