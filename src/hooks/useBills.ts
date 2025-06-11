// src/hooks/useBills.ts (VERSÃO CORRIGIDA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Bill } from '@/types'; // VERIFIQUE SE ESTÁ ASSIM

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
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }
      if (!data.session) {
        throw new Error("Usuário não autenticado. Faça o login para continuar.");
      }
      
      const user = data.session.user;

      const { data: billData, error } = await supabase // <-- CORREÇÃO AQUI
        .from("bills")
        .insert([{ ...bill, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return billData; // <-- E AQUI
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

// (O resto dos hooks que já corrigimos, como useDeleteBill e useRevertBillPayment, continuam aqui)