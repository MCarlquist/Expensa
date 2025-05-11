"use client";

import { useState } from 'react';
import { AppHeader } from '@/components/expensa/AppHeader';
import { ExpenseList } from '@/components/expensa/ExpenseList';
import { ExpenseDialog } from '@/components/expensa/ExpenseDialog';
import { FAB } from '@/components/expensa/FAB';
import { useExpenses } from '@/hooks/useExpenses';
import type { Expense, ExpenseFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { expenses, addExpense, updateExpense, deleteExpense, isLoaded } = useExpenses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const { toast } = useToast();

  const handleOpenDialog = (expense?: Expense) => {
    setExpenseToEdit(expense || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setExpenseToEdit(null); // Clear editing state when dialog closes
  };

  const handleSubmitExpense = (data: ExpenseFormData) => {
    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, data);
      toast({ title: "Expense Updated", description: "Your expense has been successfully updated." });
    } else {
      addExpense(data);
      toast({ title: "Expense Added", description: "Your new expense has been recorded." });
    }
    handleCloseDialog();
  };

  const handleDeleteExpense = (id: string) => {
    // Consider adding a confirmation dialog here
    deleteExpense(id);
    toast({ title: "Expense Deleted", description: "The expense has been removed.", variant: "destructive" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {!isLoaded ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center my-6 p-4">
                <Skeleton className="h-10 w-full sm:w-[180px]" />
                <Skeleton className="h-10 w-full sm:w-[180px]" />
                <Skeleton className="h-10 w-full sm:w-auto flex-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            onEditExpense={handleOpenDialog}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </main>
      <FAB onClick={() => handleOpenDialog()} />
      <ExpenseDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitExpense}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
}

function CardSkeleton() {
    return (
      <div className="border bg-card text-card-foreground shadow-sm rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-1/3" />
            <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
}
