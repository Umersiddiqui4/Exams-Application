import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ExamOccurrence,
	CreateExamOccurrenceDto,
	UpdateExamOccurrenceDto,
	listExamOccurrences,
	createExamOccurrence,
	updateExamOccurrence,
	deleteExamOccurrence,
	toggleActiveExamOccurrence,
} from "@/api/examOccurrencesApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useExamOccurrences() {
	const [items, setItems] = useState<ExamOccurrence[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	const reload = useCallback(async () => {
		setLoadState("loading");
		setError(null);
		try {
			const data: ExamOccurrence[] | { data: ExamOccurrence[] } = await listExamOccurrences();
			const normalized: ExamOccurrence[] = Array.isArray(data)
				? data
				: Array.isArray((data as { data: ExamOccurrence[] }).data)
					? (data as { data: ExamOccurrence[] }).data
					: [];
			// Sort by createdAt descending (newest first)
			normalized.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
			setItems(normalized);
			setLoadState("success");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to load occurrences");
			setLoadState("error");
		}
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	const create = useCallback(async (payload: CreateExamOccurrenceDto) => {
		const created = await createExamOccurrence(payload);
		setItems((prev) => [created, ...prev]);
		return created;
	}, []);

	const update = useCallback(async (id: string, payload: UpdateExamOccurrenceDto) => {
		const next = await updateExamOccurrence(id, payload);
		setItems((prev) => prev.map((o) => (o.id === id ? next : o)));
		return next;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteExamOccurrence(id);
		setItems((prev) => prev.filter((o) => o.id !== id));
	}, []);

	const toggleActive = useCallback(async (id: string, isActive: boolean) => {
		const next = await toggleActiveExamOccurrence(id, isActive);
		setItems((prev) => prev.map((o) => (o.id === id ? next : o)));
		return next;
	}, []);

	return useMemo(() => ({ items, loadState, error, create, update, remove, toggleActive, reload }), [items, loadState, error, create, update, remove, toggleActive, reload]);
}

export type { ExamOccurrence } from "@/api/examOccurrencesApi";


