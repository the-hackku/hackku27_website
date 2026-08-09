"use client";

import { IconLoader, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableTable } from "./EditableTable";

function useBatchEditing<T extends { id: string }>(originalData: T[]) {
  const [items, setItems] = useState<T[]>(originalData);
  const [edited, setEdited] = useState<Record<string, Partial<T>>>({});

  // Reset items and edited when originalData changes
  useEffect(() => {
    setItems(originalData);
    setEdited({});
  }, [originalData]);

  // Handle cell changes
  const handleChange = (itemId: string, field: keyof T, newValue: unknown) => {
    const originalItem = originalData.find((i) => i.id === itemId);
    const originalValue = originalItem ? originalItem[field] : undefined;

    // If new value is same as original, remove from edited
    if (String(newValue) === String(originalValue)) {
      setEdited((prev) => {
        const updated = { ...prev };
        const changesForItem = { ...updated[itemId] };
        delete changesForItem[field];

        if (Object.keys(changesForItem).length === 0) {
          delete updated[itemId];
        } else {
          updated[itemId] = changesForItem;
        }
        return updated;
      });
    } else {
      // Otherwise mark as edited
      setEdited((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: newValue,
        },
      }));
      console.log(`Marked Row ${itemId}, Field ${String(field)} as edited`);
    }

    // Update the local items array
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, [field]: newValue } : i)),
    );
  };

  // Revert all local changes to the original data
  const revertAll = (originalData: T[]) => {
    setItems(originalData);
    setEdited({});
  };

  // Utility function: count total changes
  const totalChanges = Object.values(edited).reduce(
    (sum, curr) => sum + Object.keys(curr).length,
    0,
  );

  return {
    items,
    edited,
    handleChange,
    revertAll,
    setItems,
    setEdited,
    totalChanges,
  };
}

interface UseSearchablePaginatedDataProps<T> {
  fetchFunction: (
    page: number,
    pageSize: number,
    searchQuery: string,
  ) => Promise<{ data: T[]; total: number }>;
  pageSize?: number;
  debounceTime?: number;
}

function useSearchablePaginatedData<T>({
  fetchFunction,
  pageSize = 10,
  debounceTime = 500,
}: UseSearchablePaginatedDataProps<T>) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, debounceTime);
    return () => clearTimeout(handler);
  }, [searchQuery, debounceTime]);

  // Memoize `fetchFunction` so it doesn't change on each render
  // cannot use `useMemo` because it doesn't work with async functions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedFetchFunction = useCallback(fetchFunction, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await memoizedFetchFunction(
        page,
        pageSize,
        debouncedSearch,
      );
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, memoizedFetchFunction]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    total,
    loading,
    page,
    totalPages,
    searchQuery,
    setPage,
    setSearchQuery,
    fetchData,
  };
}

interface GenericDataContainerProps<T extends { id: string }> {
  /** A function to fetch data from your server/database, returning { data, total } */
  fetchFunction: (
    page: number,
    pageSize: number,
    searchQuery: string,
  ) => Promise<{ data: T[]; total: number }>;

  /** A function to handle batch updates on the backend */
  updateFunction: (
    editedData: Record<string, Partial<T>>,
  ) => Promise<T[] | void>;

  /** Column definitions for rendering the table */
  columns: ColumnDef<T>[];

  /** An optional title for display purposes */
  title?: string;

  /** Pagination & query configuration */
  pageSize?: number;
  debounceTime?: number;
}

/**
 * A Generic Data Container Component
 * ----------------------------------
 * Accepts fetch & update functions, columns, and displays + edits data in a table.
 */
export function GenericDataContainer<T extends { id: string }>({
  fetchFunction,
  updateFunction,
  columns,
  title = "Data Manager",
  pageSize = 10,
  debounceTime = 250,
}: GenericDataContainerProps<T>) {
  // Hook to handle pagination, search, and data fetching
  const {
    data,
    totalPages,
    page,
    searchQuery,
    setPage,
    setSearchQuery,
    loading,
    fetchData, // We'll refetch after a successful update
  } = useSearchablePaginatedData<T>({
    fetchFunction,
    pageSize,
    debounceTime,
  });

  // Hook to handle batch editing state
  const {
    items,
    edited,
    handleChange,
    revertAll,
    setItems,
    setEdited,
    totalChanges,
  } = useBatchEditing<T>(data);

  // Track previous page and search state to know when to reset items/edited
  const prevPageRef = useRef(page);
  const prevSearchQueryRef = useRef(searchQuery);

  // Synchronize local items with fetched data ONLY when page or search changes
  useEffect(() => {
    if (
      page !== prevPageRef.current ||
      searchQuery !== prevSearchQueryRef.current
    ) {
      setItems(data);
      setEdited({}); // Clear any residual edits
      prevPageRef.current = page;
      prevSearchQueryRef.current = searchQuery;
    }
  }, [data, page, searchQuery, setItems, setEdited, title]);

  /** Handle Save All */
  async function saveAll() {
    if (Object.keys(edited).length === 0) {
      toast.message("No changes to save.");
      return;
    }

    try {
      toast.message(`Saving changes for ${title}...`);

      // Optimistically assume the save will succeed
      await updateFunction(edited);

      // Clear edited changes since save was successful
      setEdited({});
      toast.dismiss();
      toast.success(`${title} changes saved.`);

      // Refetch data to synchronize with backend
      await fetchData();
    } catch (err) {
      console.error(`${title}: Error saving changes:`, err);
      toast.error(`Failed to save ${title} changes.`);

      // Revert to original data if save fails
      revertAll(data);
    }
  }

  /** Revert local changes */
  function revert() {
    revertAll(data);
  }

  // Render
  return (
    <div>
      {/* Title */}
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {/* Search & Top Buttons */}
      <div className="flex justify-between gap-2 mb-2">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Input
            placeholder={`Search ${title}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {searchQuery && !loading && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3">
              <IconX className="h-5 w-5" />
            </button>
          )}
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <IconLoader className="animate-spin h-5 w-5" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-x-2">
          {
            // Only show Revert button if there are changes
            totalChanges > 0 && (
              <Button
                variant="outline"
                onClick={revert}
                disabled={totalChanges === 0}>
                Revert
              </Button>
            )
          }
          <Button
            variant={totalChanges === 0 ? "outline" : "destructive"}
            onClick={saveAll}
            disabled={totalChanges === 0}>
            Save All {totalChanges > 0 && `(${totalChanges})`}
          </Button>
        </div>
      </div>

      {/* Editable Table */}
      <EditableTable<T>
        data={items}
        columns={columns}
        edited={edited}
        onCellChange={(rowId, field, newValue) => {
          handleChange(rowId, field, newValue);
        }}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
