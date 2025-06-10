// src/hooks/useBillCleanup.ts (VERSÃO CORRIGIDA)

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBillCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      // ... (resto da lógica do cleanup)
    },
    // ...
  });
};