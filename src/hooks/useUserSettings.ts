
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserSettings = {
  id: string;
  user_id: string;
  currency: string;
  date_format: string;
  theme: string;
  notifications_bills: boolean;
  notifications_budget: boolean;
  notifications_monthly: boolean;
  notifications_investments: boolean;
  animations_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export const useUserSettings = () => {
  return useQuery({
    queryKey: ["user-settings"],
    queryFn: async (): Promise<UserSettings | null> => {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
  });
};

export const useCreateOrUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Primeiro tenta atualizar
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingSettings) {
        // Atualiza se existe
        const { data, error } = await supabase
          .from("user_settings")
          .update(settings)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Cria se não existe
        const { data, error } = await supabase
          .from("user_settings")
          .insert([{ ...settings, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar configurações");
    },
  });
};
