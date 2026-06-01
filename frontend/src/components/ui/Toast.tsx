import { useMemo, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import {
  ToastContext,
  type ToastContextValue,
  type ToastMessage,
  type ToastTone
} from "./ToastContext";

const toneClasses: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-white text-slate-800"
};

const toneIcons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      notify: (message, tone = "info") => {
        const id = Date.now();
        setMessages((current) => [...current, { id, tone, message }]);
        window.setTimeout(() => {
          setMessages((current) => current.filter((item) => item.id !== id));
        }, 3500);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {messages.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            className={`grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg data-[state=open]:animate-slide-in data-[state=closed]:animate-fade-out ${toneClasses[item.tone]}`}
            duration={3500}
          >
            {(() => {
              const Icon = toneIcons[item.tone];
              return <Icon className="mt-0.5 h-4 w-4 shrink-0" />;
            })()}
            <ToastPrimitive.Title className="leading-6">{item.message}</ToastPrimitive.Title>
            <ToastPrimitive.Close className="rounded-md p-1 opacity-70 transition hover:opacity-100" aria-label="Tutup notifikasi">
              <X size={14} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};
