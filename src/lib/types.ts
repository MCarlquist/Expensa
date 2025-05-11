import { z } from 'zod';

export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(), // Optional because it's generated on creation
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.string().min(1, { message: "Date is required."}), // Should be YYYY-MM-DD
  category: z.string().min(1, { message: "Category is required." }),
  description: z.string().optional(),
  vendor: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema> & { id: string }; // Ensure id is always present after creation
export type ExpenseFormData = z.infer<typeof ExpenseSchema>;
