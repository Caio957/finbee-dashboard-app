
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Salary = {
  id: string;
  user_id: string;
  description: string;
  gross_amount: number;
  net_amount: number;
  account_id: string;
  payment_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const useSalaries = () => {
  return useQuery({
    queryKey: ["salaries"],
    queryFn: async (): Promise<Salary[]> => {
      const { data, error } = await supabase
        .from("salaries")
        .select(`
          *,
          accounts(name, bank)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Salary[];
    },
  });
};

export const useCreateSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (salary: Omit<Salary, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("salaries")
        .insert([{ ...salary, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      toast.success("Salário configurado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao configurar salário");
    },
  });
};

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...salary }: Partial<Salary> & { id: string }) => {
      const { data, error } = await supabase
        .from("salaries")
        .update(salary)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      toast.success("Salário atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar salário");
    },
  });
};

export const useDeleteSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("salaries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      toast.success("Salário excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir salário");
    },
  });
};
