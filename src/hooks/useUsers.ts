import { useCallback, useEffect, useMemo, useState } from "react";
import {
  User,
  UsersResponse,
  UsersQueryParams,
  getUsers,
  updateUser,
  deleteUser,
} from "@/api/usersApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useUsers(initialParams: UsersQueryParams = {}) {
  const [items, setItems] = useState<User[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<UsersResponse['meta'] | null>(null);
  const [params, setParams] = useState<UsersQueryParams>({
    page: 1,
    take: 10,
    ...initialParams,
  });

  const fetchUsers = useCallback(async (queryParams: UsersQueryParams) => {
    setLoadState("loading");
    setError(null);
    
    try {
      const response = await getUsers(queryParams);
      setItems(response.data);
      setMeta(response.meta);
      setLoadState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    fetchUsers(params);
  }, [fetchUsers, params]);

  const updateParams = useCallback((newParams: Partial<UsersQueryParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const create = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    // This would typically call a createUser API, but since we only have signupWithEmail
    // in authApi, we'll just reload the users list
    await fetchUsers(params);
    return userData as User;
  }, [fetchUsers, params]);

  const update = useCallback(async (id: string, changes: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const updated = await updateUser(id, changes);
    setItems((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteUser(id);
    setItems((prev) => prev.filter((u) => u.id !== id));
    // Update meta count
    if (meta) {
      setMeta(prev => prev ? { ...prev, itemCount: prev.itemCount - 1 } : null);
    }
  }, [meta]);

  const reload = useCallback(() => {
    fetchUsers(params);
  }, [fetchUsers, params]);

  const goToPage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  const setPageSize = useCallback((take: number) => {
    updateParams({ take, page: 1 });
  }, [updateParams]);

  const setSearch = useCallback((q: string) => {
    updateParams({ q, page: 1 });
  }, [updateParams]);

  const setRoleFilter = useCallback((role: string) => {
    updateParams({ role: role || undefined, page: 1 });
  }, [updateParams]);

  const setSorting = useCallback((sort: string, order: string) => {
    updateParams({ sort, order, page: 1 });
  }, [updateParams]);

  return useMemo(() => ({
    items,
    loadState,
    error,
    meta,
    params,
    create,
    update,
    remove,
    reload,
    goToPage,
    setPageSize,
    setSearch,
    setRoleFilter,
    setSorting,
    updateParams,
  }), [
    items,
    loadState,
    error,
    meta,
    params,
    create,
    update,
    remove,
    reload,
    goToPage,
    setPageSize,
    setSearch,
    setRoleFilter,
    setSorting,
    updateParams,
  ]);
}

export type { User, UsersQueryParams } from "@/api/usersApi";
