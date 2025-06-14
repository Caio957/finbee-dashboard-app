// src/hooks/useCreditCards.ts (VERSÃO FINAL E VERIFICADA)

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CreditCard } from '@/types';

// Opcional: Mantenha suas funções auxiliares aqui se as tiver
const createOrUpdateCreditCardBill = async (card: CreditCard, amount: number) => {
    // Implemente a lógica para criar ou atualizar a fatura (bill) aqui
};


// Hook principal para buscar e processar os cartões de crédito
export const useCreditCards = () => {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
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
        cards.map(async (card: CreditCard) => {
          try {
            const { data: transactions, error: transactionsError } = await supabase
              .from("transactions")
              .select("amount")
              .eq("credit_card_id", card.id)
              .eq("type", "expense")
              .eq("status", "completed");

            if (transactionsError) {
              console.error(`Erro ao buscar transações para o cartão ${card.name}:`, transactionsError);
              return card;
            }

            const calculatedUsedAmount = (transactions || []).reduce((sum, transaction) => {
              return sum + Number(transaction.amount);
            }, 0);

            if (Math.abs(calculatedUsedAmount - Number(card.used_amount)) > 0.01) {
              await supabase
                .from("credit_cards")
                .update({ used_amount: calculatedUsedAmount })
                .eq("id", card.id);
            }

            // Chamada à sua função auxiliar para atualizar a fatura no banco
            await createOrUpdateCreditCardBill(card, calculatedUsedAmount);

            return {
              ...card,
              used_amount: calculatedUsedAmount,
            };
          } catch (e) {
            console.error(`ERRO FATAL processando o cartão ${card.name}:`, e);
            return card;
          }
        })
      );
      // A asserção de tipo é necessária aqui por causa do Supabase
      return cardsWithUsedAmount as CreditCard[];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // A forma correta de executar uma ação após a query, usando useEffect
  useEffect(() => {
    if (queryResult.isSuccess) {
      console.log("Dados dos cartões recalculados, invalidando faturas para atualização...");
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    }
  }, [queryResult.data, queryResult.isSuccess, queryClient]);

  return queryResult;
};

// Hook para criar um novo cartão de crédito
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
      // O retorno correto que estava faltando
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


// Hook para atualizar um cartão de crédito existente
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

// Hook para deletar um cartão de crédito
export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await supabase.from("bills").delete().eq("credit_card_id", id);
      const { error } = await supabase.from("credit_cards").delete().eq("id", id);
      if (error) throw error;
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