// src/hooks/useCreditCards.ts (VERSÃO CORRIGIDA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard } from "@/types"; // <-- Importação correta

// ... (todo o seu código de useCreditCards, createOrUpdate, etc. aqui)
// Apenas garanta que a definição local de 'CreditCard' foi removida e a importação acima foi adicionada.

// Exemplo da correção em useCreateCreditCard:
export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (card: Omit<CreditCard, "id" | "created_at" | "user_id" | "used_amount">) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("credit_cards")
        .insert([{ ...card, user_id: session.user.id }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Cartão adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar cartão");
    },
  });
};
// ... (continue com os outros hooks do arquivo)