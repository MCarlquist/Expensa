"use client";

import type { Expense, ExpenseFormData } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

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

  const addExpense = useCallback((expenseData: ExpenseFormData) => {
    const newExpense: Expense = { ...expenseData, id: uuidv4() };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  }, []);

  const updateExpense = useCallback((id: string, updatedData: ExpenseFormData) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, ...updatedData } : expense
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  }, []);

  return { expenses, addExpense, updateExpense, deleteExpense, isLoaded };
}

// Helper to ensure uuid is only imported on client
export const generateId = () => uuidv4();
