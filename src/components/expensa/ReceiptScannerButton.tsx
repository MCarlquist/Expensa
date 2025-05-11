"use client";

import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { scanReceipt, type ScanReceiptOutput } from '@/ai/flows/scan-receipt';
import { Loader2, ScanLine } from 'lucide-react';

interface ReceiptScannerButtonProps {
  onScanComplete: (data: Partial<ScanReceiptOutput>) => void;
}

export function ReceiptScannerButton({ onScanComplete }: ReceiptScannerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoDataUri = reader.result as string;
        try {
          const result = await scanReceipt({ photoDataUri });
          onScanComplete(result);
          toast({
            title: "Receipt Scanned",
            description: "Expense details populated from receipt.",
          });
        } catch (error) {
          console.error("Error scanning receipt:", error);
          toast({
            variant: "destructive",
            title: "Scan Failed",
            description: "Could not extract details from the receipt. Please enter manually.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
        });
        setIsLoading(false);
      }
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "An unexpected error occurred while processing the file.",
      });
      setIsLoading(false);
    } finally {
      // Reset file input to allow scanning the same file again if needed
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="receipt-upload"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ScanLine className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Scanning...' : 'Scan Receipt'}
      </Button>
    </>
  );
}
