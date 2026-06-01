import { useId } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const toDate = (value?: string) => (value ? new Date(`${value}T00:00:00`) : undefined);
const toDateOnly = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : "");

export const DatePickerField = ({
  label,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  error,
  hint,
  disabled
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}) => {
  const idValue = useId();
  const selected = toDate(value);

  return (
    <div className="flex flex-col gap-2 text-sm text-slate-700">
      <label htmlFor={idValue} className="font-medium">
        {label}
      </label>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            id={idValue}
            type="button"
            disabled={disabled}
            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
              error ? "border-red-300" : "border-slate-200"
            }`}
          >
            <span className={value ? "text-slate-900" : "text-slate-400"}>
              {selected ? format(selected, "dd MMMM yyyy", { locale: id }) : placeholder}
            </span>
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-xl animate-fade-in"
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(date) => onChange(toDateOnly(date))}
              locale={id}
              showOutsideDays
              weekStartsOn={1}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
      {hint && !error ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
};
