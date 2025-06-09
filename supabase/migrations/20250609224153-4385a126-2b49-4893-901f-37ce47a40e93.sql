
-- Add credit_card_id column to bills table to link bills to credit cards
ALTER TABLE public.bills 
ADD COLUMN credit_card_id uuid REFERENCES public.credit_cards(id);

-- Add index for performance when querying bills by credit card
CREATE INDEX idx_bills_credit_card_id ON public.bills(credit_card_id);
