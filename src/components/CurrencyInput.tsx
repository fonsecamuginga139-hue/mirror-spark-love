import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { useCurrency } from "@/hooks/useCurrency";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
}

const CurrencyInput = ({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
  required = false,
  id,
}: CurrencyInputProps) => {
  const { currency, getCurrencySymbol } = useCurrency();
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Format number to display string based on currency
  const formatToDisplay = (num: number): string => {
    if (num === 0) return "";
    
    // Always work with cents to avoid floating point issues
    const cents = Math.round(num * 100);
    const integerPart = Math.floor(cents / 100);
    const decimalPart = cents % 100;
    
    // Format integer part with thousand separators
    const formattedInteger = integerPart
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Format decimal part with leading zero if needed
    const formattedDecimal = decimalPart.toString().padStart(2, "0");
    
    return `${formattedInteger},${formattedDecimal}`;
  };

  // Parse display string to number
  const parseToNumber = (str: string): number => {
    if (!str) return 0;
    
    // Remove all non-digit characters
    const digits = str.replace(/\D/g, "");
    
    if (!digits) return 0;
    
    // Convert to cents then to decimal
    const cents = parseInt(digits, 10);
    return cents / 100;
  };

  // Format raw digits to display format
  const formatDigits = (digits: string): string => {
    if (!digits) return "";
    
    // Remove leading zeros but keep at least one digit
    const cleanDigits = digits.replace(/^0+/, "") || "0";
    
    // Pad with zeros if less than 3 digits (for decimal places)
    const paddedDigits = cleanDigits.padStart(3, "0");
    
    // Split into integer and decimal parts
    const decimalPart = paddedDigits.slice(-2);
    const integerPart = paddedDigits.slice(0, -2) || "0";
    
    // Remove leading zeros from integer part
    const cleanIntegerPart = integerPart.replace(/^0+/, "") || "0";
    
    // Add thousand separators to integer part
    const formattedInteger = cleanIntegerPart
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return `${formattedInteger},${decimalPart}`;
  };

  // Initialize display value from prop
  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatToDisplay(value));
    } else {
      setDisplayValue("");
    }
  }, []);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Extract only digits
    const digits = inputValue.replace(/\D/g, "");
    
    // Limit to reasonable amount (max 999,999,999.99)
    if (digits.length > 11) return;
    
    // Format and update display
    const formatted = formatDigits(digits);
    setDisplayValue(formatted);
    
    // Convert to number and notify parent
    const numericValue = parseToNumber(formatted);
    onChange(numericValue);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter"
    ) {
      return;
    }
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "v", "x"].includes(e.key.toLowerCase())
    ) {
      return;
    }
    
    // Allow: arrow keys
    if (e.key.startsWith("Arrow")) {
      return;
    }
    
    // Block non-numeric keys
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digits = pastedText.replace(/\D/g, "");
    
    if (digits.length > 11) return;
    
    const formatted = formatDigits(digits);
    setDisplayValue(formatted);
    
    const numericValue = parseToNumber(formatted);
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-base pointer-events-none">
        {getCurrencySymbol()}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={`input-field pl-10 text-lg font-medium ${className}`}
        autoComplete="off"
      />
    </div>
  );
};

export default CurrencyInput;
