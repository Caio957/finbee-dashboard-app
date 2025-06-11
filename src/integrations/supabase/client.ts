// src/integrations/supabase/client.ts (VERSÃO FINAL)

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/database.types"; // <-- IMPORTE OS NOVOS TIPOS

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use o tipo genérico <Database> ao criar o cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);