// src/hooks/useCreditCards.ts (VERSÃO CORRIGIDA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Transaction } from "@/types";

const createOrUpdateCreditCardBill = async (card: CreditCard, amount: number) => {
  // --- 1ª CORREÇÃO APLICADA AQUI ---
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("Error fetching session:", sessionError);
    return;
  }
  if (!data.session) {
    console.error("User not authenticated for creating/updating bill.");
    return;
  }
  const user = data.session.user;
  // --- FIM DA 1ª CORREÇÃO ---

  console.log(`Processing credit card bill for card ${card.name} with amount ${amount}`);
  // ... (o resto da função continua)
};

// ... (outras funções auxiliares do arquivo)

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<CreditCard, "id" | "created_at" | "user_id" | "used_amount">) => {
      // --- 2ª CORREÇÃO APLICADA AQUI ---
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!data.session) throw new Error("Usuário não autenticado.");
      const user = data.session.user;
      // --- FIM DA 2ª CORREÇÃO ---

      const { data: cardData, error } = await supabase
        .from("credit_cards")
        .insert([{ ...card, user_id: user.id }])
        .select()
        .single();
        
      if (error) throw error;
      return cardData;
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

// ... (o resto dos hooks do arquivo: useCreditCards, useUpdateCreditCard, etc.)