// src/hooks/useAccounts.ts (VERSÃO FINAL COM TODAS AS CORREÇÕES)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Account } from "@/types";

// Exporta explicitamente o tipo Account do arquivo de tipos
export type { Account } from "@/types";

// Hook para buscar todas as contas
export const useAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase.from("accounts").select("*").order('created_at');
      if (error) throw error;
      // CORREÇÃO DO 'RETURN': Adicionada asserção de tipo
      return (data || []) as Account[];
    },
  });
};

// Hook para criar uma nova conta
export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: Omit<Account, "id" | "created_at" | "user_id" | "balance">): Promise<Account> => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!sessionData.session) throw new Error("Usuário não autenticado.");

      // CORREÇÃO DO 'INSERT': Construindo o objeto explicitamente
      const accountToInsert = {
        name: account.name,
        type: account.type,
        bank: (account as any).bank, // 'bank' é opcional, então usamos 'any' para evitar erro de tipo
        balance: 0,
        user_id: sessionData.session.user.id
      };
      
      const { data: newAccountData, error } = await supabase
        .from("accounts")
        .insert([accountToInsert]) // Usamos o objeto explícito
        .select()
        .single();

      if (error) throw error;
      return newAccountData as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta adicionada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar conta");
    },
  });
};

// Implementação de useUpdateAccount
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, Partial<Account> & { id: string }>({
    mutationFn: async ({ id, ...account }) => {
      const { data, error } = await supabase
        .from("accounts")
        .update(account)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar conta");
    },
  });
};

// Implementação de useDeleteAccount
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir conta");
    },
  });
};
