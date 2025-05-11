"use client";

import type { Expense, ExpenseFormData } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { convertCurrency } from '@/ai/flows/convert-currency-flow';

const STORAGE_KEY = 'expensa-expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedExpenses = localStorage.getItem(STORAGE_KEY);
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        }
      } catch (error) {
        console.error("Failed to load expenses from localStorage:", error);
        // Optionally clear corrupted data
        // localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
       try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      } catch (error) {
        console.error("Failed to save expenses to localStorage:", error);
      }
    }
  }, [expenses, isLoaded]);

  const addExpense = useCallback(async (expenseData: ExpenseFormData) => {
    let processedExpenseData = { ...expenseData };

    if (processedExpenseData.currency && processedExpenseData.currency !== 'SEK') {
      try {
        const { convertedAmount } = await convertCurrency({
          amount: processedExpenseData.amount,
          fromCurrency: processedExpenseData.currency,
          toCurrency: 'SEK',
        });
        processedExpenseData.amount = convertedAmount;
        processedExpenseData.currency = 'SEK'; // Set currency to SEK after conversion
      } catch (error) {
        console.error('Failed to convert currency:', error);
        // Optionally handle the error, e.g., show a toast message
      }
    }

    const newExpense: Expense = { ...processedExpenseData, id: uuidv4() };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  }, [setExpenses]);

  const updateExpense = useCallback(async (id: string, updatedData: ExpenseFormData) => {
    // Currency conversion is currently only applied during addExpense.
    // If you need to support currency conversion during update,
    // similar logic to addExpense would be required here.
    setExpenses(prevExpenses => prevExpenses.map(expense => expense.id === id ? { ...expense, ...updatedData } : expense));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  }, []);

  return { expenses, addExpense, updateExpense, deleteExpense, isLoaded };
}

// Helper to ensure uuid is only imported on client
export const generateId = () => uuidv4();
