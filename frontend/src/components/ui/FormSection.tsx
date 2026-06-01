import type { ReactNode } from "react";
import { Card } from "./Card";

export const FormSection = ({
  title,
  description,
  children,
  aside
}: {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
}) => (
  <Card className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
    {children}
  </Card>
);
