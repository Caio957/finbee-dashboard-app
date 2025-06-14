// src/hooks/useCreditCards.ts

// ADICIONE A IMPORTAÇÃO DO 'useEffect' AQUI
import { useEffect } from "react"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CreditCard } from '@/types';

// ... (suas funções auxiliares e outros hooks permanecem iguais)

// Hook principal para buscar e processar os cartões de crédito
export const useCreditCards = () => {
  const queryClient = useQueryClient();

  // 1. Armazenamos o resultado da sua query original em uma variável
  const queryResult = useQuery({
    queryKey: ["credit_cards"],
    // 2. TODA A SUA LÓGICA DE CÁLCULO DENTRO DE 'queryFn' PERMANECE EXATAMENTE IGUAL
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

      return cardsWithUsedAmount;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    // A propriedade 'onSuccess' foi removida daqui
  });

  // 3. A LÓGICA DO 'onSuccess' FOI MOVIDA PARA CÁ, PARA O LUGAR CERTO
  useEffect(() => {
    // Roda somente se a query for um sucesso
    if (queryResult.isSuccess) {
      console.log("Dados dos cartões recalculados, invalidando faturas para atualização...");
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    }
  }, [queryResult.data, queryResult.isSuccess, queryClient]); // O efeito roda quando os dados mudam

  // 4. Retornamos o resultado original da query para o componente
  return queryResult;
};

// ... (o resto dos seus hooks, como useCreateCreditCard, etc., continuam aqui)