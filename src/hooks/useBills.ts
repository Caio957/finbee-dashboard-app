// src/hooks/useBills.ts (VERSÃO COM TIPAGEM EXPLÍCITA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Bill } from '@/types';

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
  // CORREÇÃO: Tipando explicitamente o useMutation
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
  // CORREÇÃO: Tipando explicitamente o useMutation
  return useMutation<Bill, Error, Partial<Bill> & { id: string }>({
    mutationFn: async ({ id, ...bill }) => {
      const { data, error } = await supabase
        .from("bills")
        .update(bill)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
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
  // CORREÇÃO: Tipando explicitamente o useMutation
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

// Em src/hooks/useBills.ts

// Hook para estornar uma fatura paga (VERSÃO DE TESTE PARA DEBUG)
export const useRevertBillPayment = () => {
  const queryClient = useQueryClient();

  // Usando 'any' de propósito para simplificar ao máximo a inferência de tipos
  return useMutation<any, Error, string>({
    mutationFn: async (billId: string) => {
      console.log(`Iniciando estorno para o billId: ${billId}`);
      
      // Vamos comentar a chamada ao supabase temporariamente
      // const { error: transactionError } = await supabase
      //   .from("transactions")
      //   .delete()
      //   .eq("bill_id", billId);

      // console.log("Erro da transação (se houver):", transactionError);

      // Apenas retornamos uma promessa vazia para satisfazer a função async
      return Promise.resolve();
    },
    onSuccess: () => {
      console.log("Sucesso na mutação (teste)");
    },
    onError: (error) => {
      console.error("Erro na mutação (teste):", error);
    },
  });
};