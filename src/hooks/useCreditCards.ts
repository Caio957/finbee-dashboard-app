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

const cleanupDuplicateBills = async (cardId: string) => {
  console.log(`Cleaning up duplicate bills for card ${cardId}`);
  
  // Buscar todas as faturas pendentes para este cartão
  const { data: bills, error } = await supabase
    .from("bills")
    .select("*")
    .eq("credit_card_id", cardId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching bills for cleanup:", error);
    return;
  }

  if (bills && bills.length > 1) {
    console.log(`Found ${bills.length} duplicate bills for card ${cardId}, keeping only the first one`);
    
    // Manter apenas a primeira fatura (mais antiga) e deletar as duplicatas
    const billsToDelete = bills.slice(1);
    
    for (const bill of billsToDelete) {
      console.log(`Deleting duplicate bill ${bill.id}`);
      await supabase
        .from("bills")
        .delete()
        .eq("id", bill.id);
    }
  }
};

const createOrUpdateCreditCardBill = async (card: CreditCard, amount: number) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const user = session.user;

  console.log(`Processing credit card bill for card ${card.name} with amount ${amount}`);

  // Primeiro, limpar duplicatas existentes
  await cleanupDuplicateBills(card.id);

  // Verificar se já existe uma fatura pendente para este cartão após limpeza
  const { data: existingBill } = await supabase
    .from("bills")
    .select("*")
    .eq("credit_card_id", card.id)
    .eq("status", "pending")
    .maybeSingle();

  // Calcular a data de vencimento (próximo dia de vencimento)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let dueDate = new Date(currentYear, currentMonth, card.due_date);
  
  // Se já passou do dia de vencimento neste mês, usar o próximo mês
  if (now.getDate() > card.due_date) {
    dueDate = new Date(currentYear, currentMonth + 1, card.due_date);
  }

  if (existingBill) {
    console.log(`Found existing bill for card ${card.name}. Current amount: ${existingBill.amount}, New amount: ${amount}`);
    
    if (amount > 0.01) {
      // Se o valor mudou significativamente, atualizar
      if (Math.abs(existingBill.amount - amount) > 0.01) {
        console.log(`Updating existing bill for card ${card.name} from ${existingBill.amount} to ${amount}`);
        
        const { error } = await supabase
          .from("bills")
          .update({
            amount: amount,
            due_date: dueDate.toISOString().split('T')[0]
          })
          .eq("id", existingBill.id);

        if (error) {
          console.error("Error updating credit card bill:", error);
        }
      }
    } else {
      // Se não há valor usado, deletar a fatura
      console.log(`Deleting bill for card ${card.name} as amount is ${amount}`);
      await supabase
        .from("bills")
        .delete()
        .eq("id", existingBill.id);
    }
  } else if (amount > 0.01) {
    console.log(`Creating new bill for card ${card.name} with amount ${amount}`);
    
    // Só criar nova fatura se não existir e o valor for maior que R$ 0,01
    const { error } = await supabase
      .from("bills")
      .insert({
        description: `Fatura ${card.name} - ${card.bank}`,
        amount: amount,
        due_date: dueDate.toISOString().split('T')[0],
        status: "pending",
        category: "Cartão de Crédito",
        recurring: false,
        credit_card_id: card.id,
        user_id: user.id
      });

    if (error) {
      console.error("Error creating credit card bill:", error);
    }
  }
};

const deleteCreditCardBillIfExists = async (cardId: string) => {
  console.log(`Checking if should delete bill for card ${cardId}`);
  
  // Verificar se existe fatura pendente para este cartão
  const { data: existingBill } = await supabase
    .from("bills")
    .select("*")
    .eq("credit_card_id", cardId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingBill) {
    console.log(`Deleting bill ${existingBill.id} for card ${cardId} as there are no transactions`);
    const { error } = await supabase
      .from("bills")
      .delete()
      .eq("id", existingBill.id);

    if (error) {
      console.error("Error deleting credit card bill:", error);
    }
  }
};

export const useCreditCards = () => {
  return useQuery({
    queryKey: ["credit_cards"],
    queryFn: async (): Promise<CreditCard[]> => {
      console.log("Fetching credit cards...");
      
      // Primeiro, buscamos os cartões
      const { data: cards, error: cardsError } = await supabase
        .from("credit_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (cardsError) throw cardsError;

      // Para cada cartão, calculamos o valor usado baseado nas transações
      const cardsWithUsedAmount = await Promise.all(
        (cards || []).map(async (card) => {
          console.log(`Processing card: ${card.name}`);
          
          // Buscar transações deste cartão que são gastos e estão completas
          const { data: transactions, error: transactionsError } = await supabase
            .from("transactions")
            .select("amount, type, status")
            .eq("credit_card_id", card.id)
            .eq("type", "expense")
            .eq("status", "completed");

          if (transactionsError) {
            console.error("Error fetching transactions for card:", transactionsError);
            return card;
          }

          // Calcular valor usado baseado nas transações completas
          const calculatedUsedAmount = (transactions || []).reduce((sum, transaction) => {
            return sum + Number(transaction.amount);
          }, 0);

          console.log(`Card ${card.name} calculated used amount: ${calculatedUsedAmount}`);

          // Atualizar o used_amount no cartão se for diferente
          if (Math.abs(calculatedUsedAmount - Number(card.used_amount)) > 0.01) {
            console.log(`Updating card ${card.name} used_amount from ${card.used_amount} to ${calculatedUsedAmount}`);
            
            const { error: updateError } = await supabase
              .from("credit_cards")
              .update({ used_amount: calculatedUsedAmount })
              .eq("id", card.id);

            if (updateError) {
              console.error("Error updating card used amount:", updateError);
            }
          }

          // Processar fatura: criar/atualizar se há valor, deletar se não há
          await createOrUpdateCreditCardBill(card as CreditCard, calculatedUsedAmount);

          return {
            ...card,
            used_amount: calculatedUsedAmount
          };
        })
      );

      return cardsWithUsedAmount as CreditCard[];
    },
    // Configurações para evitar chamadas excessivas
    staleTime: 60000, // 1 minuto
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<CreditCard, "id" | "created_at">) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");
      const user = session.user;

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
    mutationFn: async ({ id, ...creditCard }: Partial<any> & { id: string }) => {
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Primeiro, deletar faturas relacionadas ao cartão
      await supabase
        .from("bills")
        .delete()
        .eq("credit_card_id", id);

      // Depois, deletar o cartão
      const { error } = await supabase
        .from("credit_cards")
        .delete()
        .eq("id", id);

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
