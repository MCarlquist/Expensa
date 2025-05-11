
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
// import { useToast } from '@/hooks/use-toast'; // Uncomment if using toast for date scan issues

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: Expense | null;
  onClose: () => void;
}

// Suggested categories
const categories = ["Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];

export function ExpenseForm({ onSubmit, initialData, onClose }: ExpenseFormProps) {
  // const { toast } = useToast(); // Uncomment if using toast for date scan issues
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
      const lowerScannedDate = scannedData.date.toLowerCase();
      if (lowerScannedDate === 'unknown' || scannedData.date.trim() === '') {
        console.info("Scanned date is 'unknown' or empty. Please enter manually.");
        // Optionally, inform user to fill manually:
        // toast({ title: "Date Scan Issue", description: "Date from receipt is unclear. Please enter manually."});
      } else {
        let dateToSet: string | undefined = undefined;
        
        // Try parsing with parseISO first (expects ISO 8601)
        try {
          const parsed = parseISO(scannedData.date);
          if (!isNaN(parsed.getTime())) { // Check if date is valid
            dateToSet = format(parsed, 'yyyy-MM-dd');
          }
        } catch (e) {
          // parseISO failed, will try new Date() next
        }

        // If parseISO failed or resulted in invalid date, try new Date() for more general formats
        if (!dateToSet) {
          try {
            const parsed = new Date(scannedData.date);
            if (!isNaN(parsed.getTime())) { // Check if date is valid
              dateToSet = format(parsed, 'yyyy-MM-dd');
            }
          } catch (e2) {
            // Both parsing attempts failed
          }
        }

        if (dateToSet) {
          form.setValue('date', dateToSet);
        } else {
          console.warn("Could not parse scanned date:", `"${scannedData.date}"`, ". Please enter manually.");
          // Optionally, inform user via toast that the date couldn't be auto-filled
          // toast({ title: "Date Scan Issue", description: "Could not automatically fill the date from receipt. Please check and enter manually."});
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
                <Input type="number" placeholder="0.00 Kr" {...field} step="0.01" />
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
