"use client";

import type { Expense } from '@/lib/types';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseListControls, type SortOption } from './ExpenseListControls';
import { useState, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export function ExpenseList({ expenses, onEditExpense, onDeleteExpense }: ExpenseListProps) {
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');

  const uniqueCategories = useMemo(() => {
    const categories = new Set(expenses.map(exp => exp.category));
    return Array.from(categories).sort();
  }, [expenses]);

  const filteredAndSortedExpenses = useMemo(() => {
    let processedExpenses = [...expenses];

    if (filterCategory) {
      processedExpenses = processedExpenses.filter(exp => exp.category === filterCategory);
    }

    if (filterText) {
      const lowerFilterText = filterText.toLowerCase();
      processedExpenses = processedExpenses.filter(exp => 
        exp.description?.toLowerCase().includes(lowerFilterText) ||
        exp.vendor?.toLowerCase().includes(lowerFilterText)
      );
    }

    switch (sortOption) {
      case 'date-asc':
        processedExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'date-desc':
        processedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'amount-asc':
        processedExpenses.sort((a, b) => a.amount - b.amount);
        break;
      case 'amount-desc':
        processedExpenses.sort((a, b) => b.amount - a.amount);
        break;
    }
    return processedExpenses;
  }, [expenses, sortOption, filterCategory, filterText]);

  if (expenses.length === 0) {
    return (
      <Alert className="mt-8 bg-secondary/50 border-secondary shadow-sm rounded-lg">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-foreground">No Expenses Yet!</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Click the "+" button to add your first expense or try scanning a receipt.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full">
      <ExpenseListControls
        categories={uniqueCategories}
        sortOption={sortOption}
        onSortChange={setSortOption}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        filterText={filterText}
        onFilterTextChange={setFilterText}
      />
      {filteredAndSortedExpenses.length === 0 ? (
         <Alert className="mt-8 bg-secondary/50 border-secondary shadow-sm rounded-lg">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-foreground">No Matching Expenses</AlertTitle>
            <AlertDescription className="text-muted-foreground">
            Try adjusting your filters or search terms.
            </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedExpenses.map(expense => (
            <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={onEditExpense}
                onDelete={onDeleteExpense}
            />
            ))}
        </div>
      )}
    </div>
  );
}
