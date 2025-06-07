import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CreditCard = {
  id: string;
  name: string;
  bank: string;
  card_limit: number;
  used_amount: number;
  due_date: number;
  closing_date: number;
  status: "active" | "blocked";
  created_at: string;
};

export const useCreditCards = () => {
  return useQuery({
    queryKey: ["credit_cards"],
    queryFn: async (): Promise<CreditCard[]> => {
      // Primeiro, buscamos os cartões
      const { data: cards, error: cardsError } = await supabase
        .from("credit_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (cardsError) throw cardsError;

      // Para cada cartão, calculamos o valor usado baseado nas transações
      const cardsWithUsedAmount = await Promise.all(
        (cards || []).map(async (card) => {
          // Buscar transações deste cartão
          const { data: transactions, error: transactionsError } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("credit_card_id", card.id)
            .eq("type", "expense");

          if (transactionsError) {
            console.error("Error fetching transactions for card:", transactionsError);
            return card;
          }

          // Calcular valor usado baseado nas transações
          const calculatedUsedAmount = (transactions || []).reduce((sum, transaction) => {
            return sum + Number(transaction.amount);
          }, 0);

          // Atualizar o used_amount no cartão se for diferente
          if (Math.abs(calculatedUsedAmount - Number(card.used_amount)) > 0.01) {
            const { error: updateError } = await supabase
              .from("credit_cards")
              .update({ used_amount: calculatedUsedAmount })
              .eq("id", card.id);

            if (updateError) {
              console.error("Error updating card used amount:", updateError);
            }
          }

          return {
            ...card,
            used_amount: calculatedUsedAmount
          };
        })
      );

      return cardsWithUsedAmount as CreditCard[];
    },
  });
};

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<CreditCard, "id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("credit_cards")
        .insert([{ ...card, user_id: user.id }])
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

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...card }: Partial<CreditCard> & { id: string }) => {
      const { data, error } = await supabase
        .from("credit_cards")
        .update(card)
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

export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("credit_cards")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Cartão excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir cartão");
    },
  });
};
