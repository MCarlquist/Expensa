"use client";

import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePenLine, Trash2, CalendarDays, Tag, Building } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  return (
    <Card className="w-full shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4 bg-secondary/30">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl font-semibold text-primary">
                {expense.amount.toFixed(2)} Kr
                </CardTitle>
                {expense.vendor && (
                    <CardDescription className="text-sm text-muted-foreground flex items-center mt-1">
                        <Building size={14} className="mr-1.5" /> {expense.vendor}
                    </CardDescription>
                )}
            </div>
            <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} aria-label="Edit expense">
                <FilePenLine className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} aria-label="Delete expense">
                <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center text-sm text-foreground">
          <CalendarDays size={16} className="mr-2 text-muted-foreground" />
          <span>{format(parseISO(expense.date), 'MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center text-sm text-foreground">
          <Tag size={16} className="mr-2 text-muted-foreground" />
          <span className="font-medium">{expense.category}</span>
        </div>
        {expense.description && (
          <p className="text-sm text-muted-foreground pt-1 whitespace-pre-wrap">{expense.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
