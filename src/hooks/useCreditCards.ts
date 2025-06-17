// src/hooks/useCreditCards.ts (VERSÃO FINAL E COERENTE)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CreditCard } from '@/types';

// Hook principal - AGORA APENAS PARA LEITURA
export const useCreditCards = () => {
  return useQuery({
    queryKey: ["credit_cards"],
    queryFn: async (): Promise<CreditCard[]> => {
      // A função agora é um simples SELECT.
      // O 'used_amount' já virá correto do banco de dados graças às suas triggers.
      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as CreditCard[];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

// Os hooks de mutação para CRIAR, EDITAR e DELETAR um cartão continuam aqui,
// pois são ações diretas do usuário e não cálculos automáticos.

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation<CreditCard, Error, Omit<CreditCard, "id" | "created_at" | "user_id" | "used_amount">>({
    mutationFn: async (card) => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("Usuário não autenticado.");
      
      const { data: cardData, error } = await supabase
        .from("credit_cards")
        .insert([{ ...card, user_id: sessionData.session.user.id, used_amount: 0 }])
        .select()
        .single();
      
      if (error) throw error;
      return cardData as CreditCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Cartão adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar cartão");
    },
  });
};

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation<CreditCard, Error, Partial<CreditCard> & { id: string }>({
    mutationFn: async ({ id, ...creditCard }) => {
      const { data, error } = await supabase
        .from("credit_cards")
        .update(creditCard)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CreditCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Cartão atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar cartão");
    },
  });
};

export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await supabase.from("bills").delete().eq("credit_card_id", id);
      await supabase.from("transactions").delete().eq("credit_card_id", id);
      const { error } = await supabase.from("credit_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        toast.success("Cartão excluído com sucesso!");
    },
    onError: (error: any) => {
        toast.error(error.message || "Erro ao excluir cartão");
    },
  });
};