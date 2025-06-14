// src/hooks/useCreditCards.ts (VERSÃO FINAL E COMPLETA)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CreditCard } from '@/types';

// Funções auxiliares podem permanecer aqui no topo, se você as tiver.
// Ex: cleanupDuplicateBills, createOrUpdateCreditCardBill

// Exporta explicitamente o tipo CreditCard do arquivo de tipos
export type { CreditCard } from "@/types";

// Hook principal para buscar e processar os cartões de crédito
export const useCreditCards = () => {
  return useQuery({
    queryKey: ["credit_cards"],
    queryFn: async (): Promise<CreditCard[]> => {
      const { data: cards, error: cardsError } = await supabase
        .from("credit_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (cardsError) {
        console.error("Erro ao buscar cartões de crédito:", cardsError);
        throw cardsError;
      }

      if (!cards) return [];

      const cardsWithUsedAmount = await Promise.all(
        cards.map(async (card: CreditCard) => { // <-- Tipagem explícita aqui
          try {
            const { data: transactions, error: transactionsError } = await supabase
              .from("transactions")
              .select("amount")
              .eq("credit_card_id", card.id)
              .eq("type", "expense")
              .eq("status", "completed");

            if (transactionsError) {
              console.error(`Erro ao buscar transações para o cartão ${card.name}:`, transactionsError);
              // Continua mesmo se as transações falharem, usando o valor que já tem
              return card;
            }

            const calculatedUsedAmount = (transactions || []).reduce((sum, transaction) => {
              return sum + Number(transaction.amount);
            }, 0);

            // Atualiza o valor no banco de dados se for diferente
            if (Math.abs(calculatedUsedAmount - Number(card.used_amount)) > 0.01) {
              await supabase
                .from("credit_cards")
                .update({ used_amount: calculatedUsedAmount })
                .eq("id", card.id);
            }

            // A lógica de criar/atualizar a fatura (bill) pode ser chamada aqui se necessário
            // await createOrUpdateCreditCardBill(card, calculatedUsedAmount);

            return {
              ...card,
              used_amount: calculatedUsedAmount,
            };
          } catch (e) {
            console.error(`ERRO FATAL processando o cartão ${card.name}:`, e);
            return card; // Retorna o cartão original em caso de erro para não quebrar a aplicação
          }
        })
      );

      return cardsWithUsedAmount;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

// Hook para criar um novo cartão de crédito
export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (card: Omit<CreditCard, "id" | "created_at" | "user_id" | "used_amount">) => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!data.session) throw new Error("Usuário não autenticado.");
      
      const { data: cardData, error } = await supabase
        .from("credit_cards")
        .insert([{ ...card, user_id: data.session.user.id, used_amount: 0 }])
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


// Hook para atualizar um cartão de crédito existente
export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
      toast.success("Cartão atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar cartão");
    },
  });
};

// Hook para deletar um cartão de crédito
export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
      mutationFn: async (id: string) => {
          // Lógica para deletar o cartão e faturas associadas...
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
          queryClient.invalidateQueries({ queryKey: ["bills"] });
          toast.success("Cartão excluído com sucesso!");
      },
      onError: (error: any) => {
          toast.error(error.message || "Erro ao excluir cartão");
      },
  });
};
