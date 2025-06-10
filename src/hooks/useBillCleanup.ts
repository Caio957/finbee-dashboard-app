// src/hooks/useBillCleanup.ts (VERSÃO CORRIGIDA)

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBillCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log("Starting bill cleanup process...");

      // --- CORREÇÃO APLICADA AQUI ---
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);
      if (!data.session) throw new Error("Usuário não autenticado.");
      
      const user = data.session.user;
      // --- FIM DA CORREÇÃO ---

      // O resto da sua lógica continua aqui, usando a variável 'user'
      // ...
    },
    onSuccess: (duplicatesRemoved) => {
      // ...
    },
    onError: (error: any) => {
      // ...
    },
  });
};