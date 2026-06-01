import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./Input";
import { IconButton } from "./IconButton";

export const SearchInput = ({
  label = "Cari",
  value,
  onChange,
  placeholder = "Cari data",
  onClear,
  debounceMs = 300
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  debounceMs?: number;
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);
    return () => window.clearTimeout(timeout);
  }, [debounceMs, localValue, onChange, value]);

  const clearSearch = () => {
    setLocalValue("");
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  return (
    <Input
      label={label}
      value={localValue}
      placeholder={placeholder}
      onChange={(event) => setLocalValue(event.target.value)}
      leftIcon={<Search size={16} />}
      rightElement={
        localValue ? (
          <IconButton
            label="Hapus pencarian"
            className="h-8 w-8 border-none bg-transparent"
            onClick={clearSearch}
          >
            <X size={16} />
          </IconButton>
        ) : null
      }
    />
  );
};
