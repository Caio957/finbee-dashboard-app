
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Bill = {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  category: string;
  recurring: boolean;
  credit_card_id?: string | null;
  created_at: string;
};

export const useBills = () => {
  return useQuery({
    queryKey: ["bills"],
    queryFn: async (): Promise<Bill[]> => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      return (data || []) as Bill[];
    },
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Omit<Bill, "id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("bills")
        .insert([{ ...bill, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Fatura adicionada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar fatura");
    },
  });
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...bill }: Partial<Bill> & { id: string }) => {
      const { data, error } = await supabase
        .from("bills")
        .update(bill)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Fatura atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar fatura");
    },
  });
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bills")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Fatura excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir fatura");
    },
  });
};

export const useUpdateBillStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("bills")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Status da fatura atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar fatura");
    },
  });
};
