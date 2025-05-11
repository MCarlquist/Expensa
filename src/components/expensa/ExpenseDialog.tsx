"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExpenseForm } from './ExpenseForm';
import type { Expense, ExpenseFormData } from '@/lib/types';

interface ExpenseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: ExpenseFormData) => void;
  expenseToEdit?: Expense | null;
}

export function ExpenseDialog({ isOpen, onOpenChange, onSubmit, expenseToEdit }: ExpenseDialogProps) {
  const handleSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
    onOpenChange(false); // Close dialog on submit
  };
  
  const handleDialogClose = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[480px] p-6 bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {expenseToEdit ? 'Update the details of your expense.' : 'Fill in the details or scan a receipt.'}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm 
          onSubmit={handleSubmit} 
          initialData={expenseToEdit} 
          onClose={handleDialogClose}
        />
      </DialogContent>
    </Dialog>
  );
}
