"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  /** Hide this column in mobile card view */
  hideOnMobile?: boolean;
  /** Use as the primary (bold) label on mobile card */
  primary?: boolean;
}

export interface BulkEditField {
  key: string;
  label: string;
  type: "string" | "number" | "select";
  options?: { value: string; label: string }[];
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchKeys?: (keyof T)[];
  emptyLabel?: string;
  /** Enable checkbox selection for bulk operations */
  selectable?: boolean;
  onBulkDelete?: (items: T[]) => void;
  onBulkEdit?: (items: T[], changes: Record<string, unknown>) => void;
  bulkEditFields?: BulkEditField[];
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  searchKeys = [],
  emptyLabel = "Ma'lumot yo'q",
  selectable = false,
  onBulkDelete,
  onBulkEdit,
  bulkEditFields,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 10;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState<Record<string, string>>({});
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

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

  const primaryCol = columns.find((c) => c.primary) || columns[0];

  // ─── Selection helpers ───────────────────────────────────────────────
  const selectedItems = useMemo(
    () => data.filter((item) => selectedIds.has(item.id)),
    [data, selectedIds]
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((item) => selectedIds.has(item.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((item) => item.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    if (onBulkDelete && selectedItems.length > 0) {
      onBulkDelete(selectedItems);
      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
    }
  }

  function handleBulkEditApply() {
    if (onBulkEdit && selectedItems.length > 0) {
      const changes: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(bulkEditValues)) {
        if (val !== "") {
          const field = bulkEditFields?.find((f) => f.key === key);
          changes[key] = field?.type === "number" ? Number(val) : val;
        }
      }
      if (Object.keys(changes).length > 0) {
        onBulkEdit(selectedItems, changes);
        setSelectedIds(new Set());
        setShowBulkEdit(false);
        setBulkEditValues({});
      }
    }
  }

  return (
    <div>
      {/* Bulk Action Bar */}
      {selectable && selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[var(--color-accent)]/10 border-b border-[var(--color-accent)]/20">
          <span className="text-sm font-medium text-[var(--color-accent)]">
            {selectedIds.size} ta tanlangan
          </span>
          <div className="flex items-center gap-2">
            {onBulkEdit && bulkEditFields && bulkEditFields.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBulkEdit(!showBulkEdit)}
              >
                Tahrirlash
              </Button>
            )}
            {onBulkDelete && (
              <>
                {confirmBulkDelete ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      Ha, o&apos;chirish
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmBulkDelete(false)}
                    >
                      Bekor
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmBulkDelete(true)}
                  >
                    O&apos;chirish
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedIds(new Set());
                setConfirmBulkDelete(false);
              }}
            >
              Bekor
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Edit Panel */}
      {showBulkEdit && bulkEditFields && (
        <div className="px-4 py-3 bg-[var(--surface-secondary)] border-b border-[var(--border)] space-y-3">
          <p className="text-sm text-[var(--muted)]">
            {selectedIds.size} ta elementga qo&apos;llash:
          </p>
          <div className="flex flex-wrap items-end gap-3">
            {bulkEditFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted)]">{field.label}</label>
                {field.type === "select" && field.options ? (
                  <select
                    value={bulkEditValues[field.key] || ""}
                    onChange={(e) =>
                      setBulkEditValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="h-9 px-2 rounded-[8px] text-sm bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                  >
                    <option value="">— Tanlanmagan —</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={bulkEditValues[field.key] || ""}
                    onChange={(e) =>
                      setBulkEditValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="h-9 px-2 rounded-[8px] text-sm bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] w-[120px]"
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}
            <Button size="sm" onClick={handleBulkEditApply}>
              Qo&apos;llash
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      {searchKeys.length > 0 && (
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
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
              className="w-full pl-9 pr-4 py-2.5 rounded-[10px] text-sm bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {selectable && (
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                </th>
              )}
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
                      <span className="text-[var(--color-accent)]">
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
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0) + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-[var(--muted)]"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-[var(--border)] hover:bg-[var(--surface-secondary)] transition-colors",
                    selectedIds.has(item.id) && "bg-[var(--color-accent)]/5"
                  )}
                >
                  {selectable && (
                    <td className="px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                      />
                    </td>
                  )}
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
                            className="p-1.5 rounded-[8px] text-[var(--muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
                            title="Tahrirlash"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                  className="px-2 py-1 rounded-[8px] text-xs bg-[var(--color-danger)] text-white hover:opacity-90 transition-all"
                                >
                                  Ha
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="px-2 py-1 rounded-[8px] text-xs text-[var(--muted)] hover:bg-[var(--surface-secondary)] transition-all"
                                >
                                  Yo&apos;q
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="p-1.5 rounded-[8px] text-[var(--muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all"
                                title="O'chirish"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Mobile Card View (visible only on mobile) */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {paginated.length === 0 ? (
          <div className="px-4 py-12 text-center text-[var(--muted)]">
            {emptyLabel}
          </div>
        ) : (
          paginated.map((item) => (
            <div
              key={item.id}
              className={cn(
                "px-4 py-3 active:bg-[var(--surface-secondary)] transition-colors",
                selectedIds.has(item.id) && "bg-[var(--color-accent)]/5"
              )}
              onClick={() => onEdit && onEdit(item)}
            >
              <div className="flex items-center justify-between">
                {selectable && (
                  <div className="mr-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {/* Primary label */}
                  <p className="text-[15px] font-medium text-[var(--foreground)] truncate">
                    {primaryCol.render
                      ? primaryCol.render(item)
                      : String((item as Record<string, unknown>)[primaryCol.key] ?? "")}
                  </p>
                  {/* Secondary info */}
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {columns
                      .filter((c) => c.key !== primaryCol.key && !c.hideOnMobile)
                      .slice(0, 3)
                      .map((col) => (
                        <span key={col.key} className="text-[13px] text-[var(--muted)]">
                          {col.render
                            ? col.render(item)
                            : String((item as Record<string, unknown>)[col.key] ?? "")}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Chevron or actions */}
                <div className="flex items-center gap-1 ml-2">
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (deleteId === item.id) {
                          onDelete(item);
                          setDeleteId(null);
                        } else {
                          setDeleteId(item.id);
                        }
                      }}
                      className={cn(
                        "p-2 rounded-[10px] transition-colors",
                        deleteId === item.id
                          ? "bg-[var(--color-danger)] text-white"
                          : "text-[var(--muted)]"
                      )}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                  {onEdit && (
                    <svg className="text-[var(--muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
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
