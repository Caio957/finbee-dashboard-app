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
  bill_id?: string | null; // Já inclui o bill_id que adicionamos
  created_at: string;
};