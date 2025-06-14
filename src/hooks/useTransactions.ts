// src/hooks/useTransactions.ts (VERSÃO FINAL E COMPLETA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Transaction } from "@/types"; // Importa do arquivo central

// Hook para buscar todas as transações com dados relacionados
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

// Define um tipo para novas transações, para maior clareza
type NewTransaction = Omit<Transaction, "id" | "created_at" | "user_id" | "accounts" | "categories">;

// Hook para criar uma nova transação
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, NewTransaction>({
    mutationFn: async (transaction) => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, user_id: sessionData.session.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Transação criada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar transação");
    },
  });
};

// Hook para atualizar uma transação
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, Partial<Transaction> & { id: string }>({
    mutationFn: async ({ id, ...transaction }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(transaction)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Transação atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar transação");
    },
  });
};

// Hook para deletar uma transação
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Transação excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir transação");
    },
  });
};