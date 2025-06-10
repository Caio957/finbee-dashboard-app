// src/hooks/useCreditCards.ts (VERSÃO FINAL CORRIGIDA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CreditCard } from '@/types'; // VERIFIQUE SE ESTÁ ASSIM

// (Funções auxiliares como 'cleanupDuplicateBills' e 'deleteCreditCardBillIfExists' permanecem aqui)

const createOrUpdateCreditCardBill = async (card: CreditCard, amount: number) => {
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

  console.log(`Processing credit card bill for card ${card.name} with amount ${amount}`);

  // O resto da sua lógica para criar/atualizar a fatura do cartão...
};


export const useCreditCards = () => {
  return useQuery({
    queryKey: ["credit_cards"],
    queryFn: async (): Promise<CreditCard[]> => {
      // Sua lógica de fetch e cálculo para useCreditCards continua aqui...
      // (O código que você já tinha para esta função)
    },
    staleTime: 60000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (card: Omit<CreditCard, "id" | "created_at" | "user_id" | "used_amount">) => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!data.session) throw new Error("Usuário não autenticado.");
      const user = data.session.user;

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
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Cartão adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar cartão");
    },
  });
};

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // --- CORREÇÃO APLICADA AQUI ---
    mutationFn: async ({ id, ...creditCard }: Partial<CreditCard> & { id: string }) => {
      const { data, error } = await supabase
        .from("credit_cards")
        .update(creditCard)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Cartão atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar cartão");
    },
  });
};

export const useDeleteCreditCard = () => {
  // ... (Sua lógica do useDeleteCreditCard aqui)
};