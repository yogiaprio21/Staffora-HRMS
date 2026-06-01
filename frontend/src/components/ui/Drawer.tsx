import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

type DrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export const Drawer = ({ open, title, description, onClose, children }: DrawerProps) => (
  <Dialog.Root open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 data-[state=open]:animate-fade-in" />
      <Dialog.Content className="fixed bottom-0 right-0 top-auto z-50 flex max-h-[92vh] w-full flex-col rounded-t-lg bg-white shadow-xl outline-none data-[state=open]:animate-slide-up sm:bottom-0 sm:top-0 sm:max-h-none sm:max-w-xl sm:rounded-l-lg sm:rounded-tr-none sm:data-[state=open]:animate-slide-in">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-slate-500">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
              Close
            </Dialog.Close>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
