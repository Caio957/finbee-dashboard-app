// src/types.ts

export type Bill = {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  category: string;
  recurring: boolean;
  user_id: string;
  credit_card_id?: string | null;
  created_at: string;
  account_id?: string | null;
};

export type Account = {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  user_id: string;
  created_at: string;
};

export type CreditCard = {
  id: string;
  name: string;
  bank: string;
  card_limit: number;
  used_amount: number;
  due_date: number;
  closing_date: number;
  status: "active" | "blocked";
  user_id: string;
  created_at: string;
};

// Em src/types.ts

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  user_id: string;
  account_id?: string | null;
  category_id?: string | null;
  credit_card_id?: string | null;
  bill_id?: string | null; // <-- ADICIONE ESTA LINHA
  created_at: string;
  accounts: { name: string; bank: string; } | null;
  categories: { name: string; color: string; icon: string; } | null;
};

export type NewAccount = {
  name: string;
  type: 'checking' | 'savings';
  bank: string;
};