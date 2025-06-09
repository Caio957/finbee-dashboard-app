
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBillCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log("Starting bill cleanup process...");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Buscar todas as faturas de cartão de crédito pendentes do usuário
      const { data: bills, error } = await supabase
        .from("bills")
        .select("*")
        .eq("status", "pending")
        .not("credit_card_id", "is", null)
        .order("credit_card_id", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!bills || bills.length === 0) {
        console.log("No credit card bills found");
        return;
      }

      // Agrupar faturas por cartão de crédito
      const billsByCard = bills.reduce((acc, bill) => {
        if (!acc[bill.credit_card_id]) {
          acc[bill.credit_card_id] = [];
        }
        acc[bill.credit_card_id].push(bill);
        return acc;
      }, {} as Record<string, any[]>);

      let duplicatesRemoved = 0;

      // Para cada cartão, manter apenas a primeira fatura e deletar as duplicatas
      for (const [cardId, cardBills] of Object.entries(billsByCard)) {
        if (cardBills.length > 1) {
          console.log(`Found ${cardBills.length} bills for card ${cardId}, removing ${cardBills.length - 1} duplicates`);
          
          // Manter a primeira (mais antiga) e deletar as outras
          const billsToDelete = cardBills.slice(1);
          
          for (const bill of billsToDelete) {
            console.log(`Deleting duplicate bill ${bill.id}`);
            const { error: deleteError } = await supabase
              .from("bills")
              .delete()
              .eq("id", bill.id);

            if (deleteError) {
              console.error("Error deleting duplicate bill:", deleteError);
            } else {
              duplicatesRemoved++;
            }
          }
        }
      }

      console.log(`Cleanup completed. Removed ${duplicatesRemoved} duplicate bills`);
      return duplicatesRemoved;
    },
    onSuccess: (duplicatesRemoved) => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      
      if (duplicatesRemoved && duplicatesRemoved > 0) {
        toast.success(`${duplicatesRemoved} faturas duplicadas foram removidas!`);
      } else {
        toast.success("Nenhuma duplicata encontrada!");
      }
    },
    onError: (error: any) => {
      console.error("Error during bill cleanup:", error);
      toast.error(error.message || "Erro ao limpar faturas duplicadas");
    },
  });
};
