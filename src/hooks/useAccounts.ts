import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Account = {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  balance: number;
  bank: string;
  created_at: string;
  updated_at: string;
};

export const useAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      // Primeiro, buscamos as contas
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (accountsError) throw accountsError;

      // Para cada conta, calculamos o saldo baseado nas transações
      const accountsWithBalance = await Promise.all(
        (accounts || []).map(async (account) => {
          // Buscar transações desta conta
          const { data: transactions, error: transactionsError } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("account_id", account.id);

          if (transactionsError) {
            console.error("Error fetching transactions for account:", transactionsError);
            return account;
          }

          // Calcular saldo baseado nas transações
          const calculatedBalance = (transactions || []).reduce((sum, transaction) => {
            if (transaction.type === "income") {
              return sum + Number(transaction.amount);
            } else {
              return sum - Number(transaction.amount);
            }
          }, 0);

          // Atualizar o saldo na conta se for diferente
          if (Math.abs(calculatedBalance - Number(account.balance)) > 0.01) {
            const { error: updateError } = await supabase
              .from("accounts")
              .update({ balance: calculatedBalance })
              .eq("id", account.id);

            if (updateError) {
              console.error("Error updating account balance:", updateError);
            }
          }

          return {
            ...account,
            balance: calculatedBalance
          };
        })
      );

      return accountsWithBalance as Account[];
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Omit<Account, "id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("accounts")
        .insert([{ ...account, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...account }: Partial<Account> & { id: string }) => {
      const { data, error } = await supabase
        .from("accounts")
        .update(account)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar conta");
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir conta");
    },
  });
};
