
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; 

export type Bill = {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  category: string;
  recurring: boolean;
  credit_card_id?: string | null;
  created_at: string;
};

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

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Omit<Bill, "id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("bills")
        .insert([{ ...bill, user_id: user.id }])
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

export const useDeleteBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting bill: ${id}`);
      
      // Primeiro, buscar a fatura para verificar se é de cartão de crédito
      const { data: bill, error: fetchError } = await supabase
        .from("bills")
        .select("credit_card_id, amount")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Deletar transações relacionadas à fatura se existirem
      if (bill?.credit_card_id) {
        console.log(`Deleting transactions related to bill ${id} for credit card ${bill.credit_card_id}`);
        
        await supabase
          .from("transactions")
          .delete()
          .eq("credit_card_id", bill.credit_card_id)
          .eq("description", `Pagamento: Fatura ${bill.credit_card_id}`);
      }

      // Deletar a fatura
      const { error } = await supabase
        .from("bills")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Fatura excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir fatura");
    },
  });
};



export const useUpdateBillStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log(`Updating bill ${id} status to ${status}`);
      
      // Buscar a fatura para verificar detalhes
      const { data: bill, error: fetchError } = await supabase
        .from("bills")
        .select("credit_card_id, amount, description")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Se estamos estornando uma fatura (mudando de paid para pending)
      if (status === "pending" && bill) {
        console.log(`Reverting bill payment for bill ${id}`);
        
        // Deletar transações de pagamento relacionadas
        if (bill.credit_card_id) {
          const paymentDescription = `Pagamento fatura ${bill.description}`;
          console.log(`Deleting payment transactions with description: ${paymentDescription}`);
          
          await supabase
            .from("transactions")
            .delete()
            .eq("credit_card_id", bill.credit_card_id)
            .ilike("description", `%${paymentDescription}%`);
        } else {
          // Para faturas não de cartão de crédito
          const paymentDescription = `Pagamento: ${bill.description}`;
          console.log(`Deleting payment transactions with description: ${paymentDescription}`);
          
          await supabase
            .from("transactions")
            .delete()
            .ilike("description", `%${paymentDescription}%`);
        }
      }

      // Atualizar status da fatura
      const { data, error } = await supabase
        .from("bills")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      
      // Forçar refetch das contas para garantir atualização
      queryClient.refetchQueries({ queryKey: ["accounts"] });
      
      toast.success("Status da fatura atualizado!");
    },
    onError: (error: any) => {
      console.error("Error updating bill status:", error);
      toast.error(error.message || "Erro ao atualizar fatura");
    },
  });
};

export const useRevertBillPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      // 1. Deletar a transação de pagamento vinculada a esta fatura
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("bill_id", billId);

      if (transactionError) {
        // Se não encontrar transação, não é um erro fatal, pode ser que já foi removida.
        // Mas se for outro erro, lançamos.
        if (transactionError.code !== 'PGRST204') { // PGRST204 = No rows found
           throw new Error("Erro ao deletar a transação: " + transactionError.message);
        }
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
      queryClient.invalidateQueries({ queryKey: ["accounts"] }); // Invalida as contas para recalcular o saldo
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};
