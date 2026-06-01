import * as Dropdown from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import { Ellipsis } from "lucide-react";
import { Button } from "./Button";

type MenuItem = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
};

export const RowActionsMenu = ({ items }: { items: MenuItem[] }) => (
  <Dropdown.Root>
    <Dropdown.Trigger asChild>
      <Button variant="outline" type="button" className="px-3">
        <Ellipsis size={16} />
        Aksi
      </Button>
    </Dropdown.Trigger>
    <Dropdown.Portal>
      <Dropdown.Content
        align="end"
        className="z-50 min-w-40 rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-lg data-[state=open]:animate-fade-in"
      >
        {items.map((item) => (
          <Dropdown.Item
            key={item.label}
            disabled={item.disabled}
            onSelect={item.onSelect}
            className={`flex min-h-10 cursor-pointer items-center rounded-md px-3 py-2 outline-none hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 ${
              item.tone === "danger" ? "text-rose-700" : "text-slate-700"
            }`}
          >
            {item.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Portal>
  </Dropdown.Root>
);

export const DropdownMenu = ({ trigger, children }: { trigger: ReactNode; children: ReactNode }) => (
  <Dropdown.Root>
    <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
    <Dropdown.Portal>
      <Dropdown.Content
        align="end"
        className="z-50 min-w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-lg data-[state=open]:animate-fade-in"
      >
        {children}
      </Dropdown.Content>
    </Dropdown.Portal>
  </Dropdown.Root>
);
