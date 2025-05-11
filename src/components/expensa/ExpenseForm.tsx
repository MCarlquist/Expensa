
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { ReceiptScannerButton } from './ReceiptScannerButton';
import type { ScanReceiptOutput } from '@/ai/flows/scan-receipt';
import { convertCurrency } from '@/ai/flows/convert-currency-flow';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: Expense | null;
  onClose: () => void;
}

// Suggested categories
const categories = ["Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];

export function ExpenseForm({ onSubmit, initialData, onClose }: ExpenseFormProps) {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: initialData ? {
      ...initialData,
      amount: initialData.amount || 0,
      date: initialData.date ? format(parseISO(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      originalAmount: initialData.originalAmount,
      originalCurrency: initialData.originalCurrency,
    } : {
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
      vendor: '',
      originalAmount: undefined,
      originalCurrency: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        amount: initialData.amount || 0,
        date: initialData.date ? format(parseISO(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        originalAmount: initialData.originalAmount,
        originalCurrency: initialData.originalCurrency,
      });
    } else {
       form.reset({
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        description: '',
        vendor: '',
        originalAmount: undefined,
        originalCurrency: undefined,
      });
    }
  }, [initialData, form]);


  const handleScanComplete = async (scannedData: Partial<ScanReceiptOutput>) => {
    form.setValue('originalAmount', undefined);
    form.setValue('originalCurrency', undefined);

    if (scannedData.date) {
      const lowerScannedDate = scannedData.date.toLowerCase();
      if (lowerScannedDate === 'unknown' || scannedData.date.trim() === '') {
        console.info("Scanned date is 'unknown' or empty. Please enter manually.");
      } else {
        let dateToSet: string | undefined = undefined;
        try {
          const parsed = parseISO(scannedData.date);
          if (!isNaN(parsed.getTime())) { 
            dateToSet = format(parsed, 'yyyy-MM-dd');
          }
        } catch (e) {
          // Attempt next parse
        }
        if (!dateToSet) {
          try {
            const parsed = new Date(scannedData.date);
            if (!isNaN(parsed.getTime())) {
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
          toast({ title: "Date Scan Issue", variant: "destructive", description: "Could not automatically fill the date from receipt. Please check and enter manually."});
        }
      }
    }

    if (scannedData.vendor) {
      form.setValue('vendor', scannedData.vendor);
    }

    const receiptCurrency = scannedData.currency?.toUpperCase() || "SEK";
    const receiptAmount = scannedData.amount;

    if (receiptAmount === undefined || receiptAmount === null || isNaN(receiptAmount)) {
        toast({ variant: "destructive", title: "Scan Issue", description: "Could not read amount from receipt. Please enter manually."});
        form.setValue('amount', 0);
        return;
    }
    
    if (receiptCurrency === "SEK") {
      form.setValue('amount', receiptAmount);
    } else {
      form.setValue('originalAmount', receiptAmount);
      form.setValue('originalCurrency', receiptCurrency);
      setIsConverting(true);
      try {
        const conversionResult = await convertCurrency({
          amount: receiptAmount,
          fromCurrency: receiptCurrency,
          toCurrency: "SEK",
        });
        form.setValue('amount', conversionResult.convertedAmount);
        toast({ title: "Currency Converted", description: `${receiptAmount.toFixed(2)} ${receiptCurrency} converted to ${conversionResult.convertedAmount.toFixed(2)} SEK.` });
      } catch (error) {
        console.error("Error converting currency:", error);
        toast({ variant: "destructive", title: "Conversion Failed", description: `Could not convert ${receiptCurrency} to SEK. Please enter SEK amount manually.` });
        form.setValue('amount', 0); 
      } finally {
        setIsConverting(false);
      }
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
              <FormLabel>Amount (SEK)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field} 
                    step="0.01" 
                    disabled={isConverting}
                    value={field.value === undefined || field.value === null || isNaN(field.value) ? '' : field.value}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     <span className="text-muted-foreground sm:text-sm">Kr</span>
                   </div>
                  {isConverting && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </FormControl>
              {form.watch('originalAmount') && form.watch('originalCurrency') && form.watch('originalCurrency')?.toUpperCase() !== 'SEK' && (
                <p className="text-xs text-muted-foreground pt-1">
                  Original: {form.watch('originalAmount')?.toFixed(2)} {form.watch('originalCurrency')}
                </p>
              )}
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isConverting}>Cancel</Button>
          <Button type="submit" variant="default" disabled={isConverting}>
            {isConverting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isConverting ? 'Processing...' : (initialData ? 'Save Changes' : 'Add Expense')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
