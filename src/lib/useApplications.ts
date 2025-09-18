import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApplicationData,
  CreateApplicationDto,
  UpdateApplicationDto,
  UpdateApplicationStatusDto,
  listApplications,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  reviewApplication,
  deleteApplication,
} from "./applicationsApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useApplications(examOccurrenceId?: string, status?: string, pageSize = 10) {
  const [items, setItems] = useState<ApplicationData[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
    total: 0,
    pageCount: 0,
  });

  const reload = useCallback(async (pageIndex = 0) => {
    setLoadState("loading");
    setError(null);
    try {
      const response = await listApplications(examOccurrenceId, status, pageIndex + 1, pageSize);
      const normalized: ApplicationData[] = response.data;
      setItems(normalized);
      setPagination({
        pageIndex,
        pageSize,
        total: response.meta.itemCount,
        pageCount: response.meta.pageCount,
      });
      setLoadState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
      setLoadState("error");
    }
  }, [examOccurrenceId, status, pageSize]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (payload: CreateApplicationDto) => {
    const created = await createApplication(payload);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, payload: UpdateApplicationDto) => {
    const next = await updateApplication(id, payload);
    setItems((prev) => prev.map((app) => (app.id === id ? next : app)));
    return next;
  }, []);

  const updateStatus = useCallback(async (id: string, payload: UpdateApplicationStatusDto) => {
    const next = await updateApplicationStatus(id, payload);
    setItems((prev) => prev.map((app) => (app.id === id ? next : app)));
    return next;
  }, []);

  const review = useCallback(async (id: string, status: "APPROVED" | "REJECTED", adminNotes?: string) => {
    const next = await reviewApplication(id, status, adminNotes);
    // Reload the data to ensure proper filtering after status change
    await reload();
    return next;
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    await deleteApplication(id);
    setItems((prev) => prev.filter((app) => app.id !== id));
  }, []);

  const setPageSize = useCallback(async (newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, pageIndex: 0 }));
    // Reload with the new page size
    setLoadState("loading");
    setError(null);
    try {
      const response = await listApplications(examOccurrenceId, status, 1, newPageSize);
      const normalized: ApplicationData[] = response.data;
      setItems(normalized);
      setPagination({
        pageIndex: 0,
        pageSize: newPageSize,
        total: response.meta.itemCount,
        pageCount: response.meta.pageCount,
      });
      setLoadState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
      setLoadState("error");
    }
  }, [examOccurrenceId, status]);

  const setPageIndex = useCallback((newPageIndex: number) => {
    setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
    reload(newPageIndex);
  }, [reload]);

  return useMemo(() => ({
    applications: items,
    loadState,
    error,
    pagination,
    create,
    update,
    updateStatus,
    review,
    remove,
    reload,
    setPageSize,
    setPageIndex
  }), [items, loadState, error, pagination, create, update, updateStatus, review, remove, reload, setPageSize, setPageIndex]);
}

export type { ApplicationData } from "./applicationsApi";