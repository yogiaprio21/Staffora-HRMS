import { Search, X } from "lucide-react";
import { Input } from "./Input";
import { IconButton } from "./IconButton";

export const SearchInput = ({
  label = "Cari",
  value,
  onChange,
  placeholder = "Cari data",
  onClear
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}) => (
  <Input
    label={label}
    value={value}
    placeholder={placeholder}
    onChange={(event) => onChange(event.target.value)}
    leftIcon={<Search size={16} />}
    rightElement={
      value ? (
        <IconButton
          label="Hapus pencarian"
          className="h-8 w-8 border-none bg-transparent"
          onClick={onClear || (() => onChange(""))}
        >
          <X size={16} />
        </IconButton>
      ) : null
    }
  />
);
