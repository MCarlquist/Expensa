"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseSchema, type ExpenseFormData, type Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { ReceiptScannerButton } from './ReceiptScannerButton';
import type { ScanReceiptOutput } from '@/ai/flows/scan-receipt';
import { useEffect } from 'react';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: Expense | null;
  onClose: () => void;
}

// Suggested categories
const categories = ["Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];

export function ExpenseForm({ onSubmit, initialData, onClose }: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: initialData ? {
      ...initialData,
      amount: initialData.amount || 0, // Ensure amount is number
      date: initialData.date ? format(parseISO(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    } : {
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
      vendor: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        amount: initialData.amount || 0,
        date: initialData.date ? format(parseISO(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      });
    } else {
       form.reset({
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        description: '',
        vendor: '',
      });
    }
  }, [initialData, form]);


  const handleScanComplete = (scannedData: Partial<ScanReceiptOutput>) => {
    if (scannedData.date) {
      try {
        form.setValue('date', format(parseISO(scannedData.date), 'yyyy-MM-dd'));
      } catch (e) {
        // If date parsing fails, try to format it assuming it might be MM/DD/YYYY or other common formats.
        // This is a simple fallback, more robust parsing might be needed.
        try {
           form.setValue('date', format(new Date(scannedData.date), 'yyyy-MM-dd'));
        } catch (e2) {
          console.error("Could not parse scanned date:", scannedData.date);
        }
      }
    }
    if (scannedData.amount) {
      form.setValue('amount', scannedData.amount);
    }
    if (scannedData.vendor) {
      form.setValue('vendor', scannedData.vendor);
    }
  };

  const handleSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
    form.reset(); 
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ReceiptScannerButton onScanComplete={handleScanComplete} />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(parseISO(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseISO(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                 <Input placeholder="e.g., Food, Transport" {...field} list="categories-datalist" />
              </FormControl>
              <datalist id="categories-datalist">
                {categories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Starbucks, Amazon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Lunch with colleagues" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="default">
            {initialData ? 'Save Changes' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
