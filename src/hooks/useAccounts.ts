// src/hooks/useAccounts.ts (VERSÃO CORRIGIDA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Account } from "@/types";

export const useAccounts = () => {
  // ... (este hook não precisa de alteração)
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Omit<Account, "id" | "created_at" | "user_id" | "balance">) => {
      // --- CORREÇÃO APLICADA AQUI ---
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);
      if (!data.session) throw new Error("Usuário não autenticado.");
      
      const user = data.session.user;
      // --- FIM DA CORREÇÃO ---

      const { data: accountData, error } = await supabase
        .from("accounts")
        .insert([{ ...account, user_id: user.id, balance: 0 }]) // Adicionado balance: 0 como padrão
        .select()
        .single();

      if (error) throw error;
      return accountData;
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

// ... (outros hooks do arquivo se existirem)