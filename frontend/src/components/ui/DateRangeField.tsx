import { DatePickerField } from "./DatePickerField";

export const DateRangeField = ({
  fromLabel = "From",
  toLabel = "To",
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className = ""
}: {
  fromLabel?: string;
  toLabel?: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  className?: string;
}) => (
  <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
    <DatePickerField
      label={fromLabel}
      value={dateFrom}
      onChange={onDateFromChange}
      placeholder="Pilih tanggal mulai"
    />
    <DatePickerField
      label={toLabel}
      value={dateTo}
      onChange={onDateToChange}
      placeholder="Pilih tanggal selesai"
    />
  </div>
);
