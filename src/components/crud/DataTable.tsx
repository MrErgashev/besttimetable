"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchKeys?: (keyof T)[];
  emptyLabel?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  searchKeys = [],
  emptyLabel = "Ma'lumot yo'q",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = useMemo(() => {
    let result = data;

    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[sortKey] ?? "");
        const bVal = String((b as Record<string, unknown>)[sortKey] ?? "");
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return result;
  }, [data, search, searchKeys, sortKey, sortDir]);

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div>
      {/* Search */}
      {searchKeys.length > 0 && (
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-light)] focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left font-medium text-[var(--muted)]",
                    col.sortable && "cursor-pointer hover:text-[var(--foreground)] select-none"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-accent">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
                  Amallar
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-12 text-center text-[var(--muted)]"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-[var(--foreground)]"
                    >
                      {col.render
                        ? col.render(item)
                        : String(
                            (item as Record<string, unknown>)[col.key] ?? ""
                          )}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-accent hover:bg-accent/10 transition-all"
                            title="Tahrirlash"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <>
                            {deleteId === item.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    onDelete(item);
                                    setDeleteId(null);
                                  }}
                                  className="px-2 py-1 rounded-lg text-xs bg-danger text-white hover:bg-red-600 transition-all"
                                >
                                  Ha
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="px-2 py-1 rounded-lg text-xs text-[var(--muted)] hover:bg-[var(--surface)] transition-all"
                                >
                                  Yo&apos;q
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-danger hover:bg-danger/10 transition-all"
                                title="O'chirish"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">
            {filtered.length} ta natija, {page + 1}/{totalPages} sahifa
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Oldingi
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
