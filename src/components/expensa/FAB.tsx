"use client";

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-xl z-50 text-primary-foreground bg-primary hover:bg-primary/90"
      aria-label="Add new expense"
    >
      <Plus className="h-8 w-8" />
    </Button>
  );
}
