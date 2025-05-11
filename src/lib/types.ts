import { z } from 'zod';

export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(), // Optional because it's generated on creation
  amount: z.coerce.number().positive({ message: "Amount in SEK must be positive." }), // This amount is always in SEK
  date: z.string().min(1, { message: "Date is required."}), // Should be YYYY-MM-DD
  category: z.string().min(1, { message: "Category is required." }),
  description: z.string().optional(),
  vendor: z.string().optional(),
  originalAmount: z.coerce.number().positive().optional(), // Amount in original currency, if different from SEK
  originalCurrency: z.string().trim().toUpperCase().optional(), // Code of original currency (e.g., "USD"), if different from SEK
});

export type Expense = z.infer<typeof ExpenseSchema> & { id: string }; // Ensure id is always present after creation
export type ExpenseFormData = z.infer<typeof ExpenseSchema>;
