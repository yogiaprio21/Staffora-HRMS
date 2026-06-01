import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { SortingState } from "@tanstack/react-table";

type TableQueryDefaults = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const useTableQueryState = (defaults: TableQueryDefaults = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const sortBy = searchParams.get("sortBy") || defaults.sortBy || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc" | null) || defaults.sortOrder || "desc";
    return {
      page: Number(searchParams.get("page") || defaults.page || 1),
      limit: Number(searchParams.get("limit") || defaults.limit || 10),
      search: searchParams.get("search") || "",
      department: searchParams.get("department") || "",
      role: searchParams.get("role") || "",
      status: searchParams.get("status") || "",
      action: searchParams.get("action") || "",
      entityType: searchParams.get("entityType") || "",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
      sortBy,
      sortOrder,
      sorting: sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []
    };
  }, [defaults.limit, defaults.page, defaults.sortBy, defaults.sortOrder, searchParams]);

  const update = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const setFilter = (key: string, value: string) => update({ [key]: value, page: 1 });
  const setPage = (page: number) => update({ page });
  const setPageSize = (limit: number) => update({ limit, page: 1 });
  const clearFilters = () =>
    update({
      search: undefined,
      department: undefined,
      role: undefined,
      status: undefined,
      action: undefined,
      entityType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1
    });
  const setSorting = (sorting: SortingState) => {
    const first = sorting[0];
    update({
      sortBy: first?.id || defaults.sortBy || "createdAt",
      sortOrder: first?.desc ? "desc" : "asc",
      page: 1
    });
  };

  return {
    ...state,
    setFilter,
    clearFilters,
    setPage,
    setPageSize,
    setSorting
  };
};
