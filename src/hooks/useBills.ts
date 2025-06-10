import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bill } from "@/types";

// Busca todas as faturas
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

// Cria uma nova fatura
export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Omit<Bill, "id" | "created_at" | "user_id">) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from("bills")
        .insert([{ ...bill, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Fatura adicionada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar fatura");
    },
  });
};

// Atualiza os dados de uma fatura (descrição, valor, etc.)
export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...bill }: Partial<Bill> & { id: string }) => {
      const { data, error } = await supabase
        .from("bills")
        .update(bill)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Fatura atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar fatura");
    },
  });
};

// Deleta uma fatura e sua transação de pagamento vinculada
export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Deleta a transação de pagamento vinculada (se existir)
      await supabase.from("transactions").delete().eq("bill_id", id);
      
      // 2. Deleta a fatura
      const { error } = await supabase.from("bills").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Fatura excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir fatura");
    },
  });
};

// Estorna uma fatura (deleta a transação e volta o status para 'pending')
export const useRevertBillPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      // 1. Deletar a transação de pagamento vinculada
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("bill_id", billId);

      if (transactionError && transactionError.code !== 'PGRST204') {
         throw new Error("Erro ao deletar a transação: " + transactionError.message);
      }

      // 2. Atualizar o status da fatura para "pending"
      const { data, error: billError } = await supabase
        .from("bills")
        .update({ status: "pending" as const })
        .eq("id", billId)
        .select()
        .single();

      if (billError) {
        throw new Error("Erro ao reverter o status da fatura: " + billError.message);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Fatura estornada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};