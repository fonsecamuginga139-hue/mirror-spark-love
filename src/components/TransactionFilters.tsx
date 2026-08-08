import { useState } from "react";
import { Filter, X, Calendar, Tag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Category } from "@/hooks/useCategories";

export type TransactionFilterPeriod = "all" | "today" | "week" | "month" | "custom";

export interface TransactionFilterState {
  period: TransactionFilterPeriod;
  categoryId: string | null;
  startDate: string;
  endDate: string;
}

interface TransactionFiltersProps {
  categories: Category[];
  filters: TransactionFilterState;
  onFiltersChange: (filters: TransactionFilterState) => void;
}

const periodLabels: Record<TransactionFilterPeriod, string> = {
  all: "All",
  today: "Today",
  week: "Week",
  month: "Month",
  custom: "Custom",
};

const TransactionFilters = ({ categories, filters, onFiltersChange }: TransactionFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TransactionFilterState>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: TransactionFilterState = {
      period: "all",
      categoryId: null,
      startDate: "",
      endDate: "",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  const hasActiveFilters = filters.period !== "all" || filters.categoryId !== null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
          <Filter size={20} className="text-muted-foreground" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-3xl h-[80vh]">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center justify-between">
            <span>Filter Transactions</span>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm text-primary flex items-center gap-1"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto pb-24">
          {/* Period Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-primary" />
              <span className="font-medium text-foreground">Period</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(periodLabels) as TransactionFilterPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setLocalFilters({ ...localFilters, period })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    localFilters.period === period
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
            
            {localFilters.period === "custom" && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                    className="input-field text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={localFilters.endDate}
                    onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                    className="input-field text-sm w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag size={18} className="text-primary" />
              <span className="font-medium text-foreground">Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocalFilters({ ...localFilters, categoryId: null })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  localFilters.categoryId === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setLocalFilters({ ...localFilters, categoryId: category.id })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    localFilters.categoryId === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <Button
            onClick={handleApply}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransactionFilters;
