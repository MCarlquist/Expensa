import { Wallet } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Expensa</h1>
        </div>
        {/* Placeholder for future actions like settings or user profile */}
      </div>
    </header>
  );
}
