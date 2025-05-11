"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpDown, Filter } from 'lucide-react';

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

interface ExpenseListControlsProps {
  categories: string[];
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  filterText: string;
  onFilterTextChange: (value: string) => void;
}

export function ExpenseListControls({
  categories,
  sortOption,
  onSortChange,
  filterCategory,
  onFilterCategoryChange,
  filterText,
  onFilterTextChange
}: ExpenseListControlsProps) {
  return (
    <div className="my-6 p-4 bg-card border border-border rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-1 w-full sm:w-auto">
        <Label htmlFor="sort-expenses" className="sr-only">Sort by</Label>
        <div className="flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2 text-muted-foreground" />
            <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger id="sort-expenses" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="date-desc">Date (Newest first)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
                <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      <div className="flex-1 w-full sm:w-auto">
        <Label htmlFor="filter-category" className="sr-only">Filter by category</Label>
        <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
            <SelectTrigger id="filter-category" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>
      
      <div className="flex-1 w-full sm:w-auto">
        <Label htmlFor="filter-text" className="sr-only">Search expenses</Label>
         <Input 
            id="filter-text"
            type="text"
            placeholder="Search description/vendor..."
            value={filterText}
            onChange={(e) => onFilterTextChange(e.target.value)}
            className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
