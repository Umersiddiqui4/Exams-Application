import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ExamOccurrence,
	CreateExamOccurrenceDto,
	UpdateExamOccurrenceDto,
	listExamOccurrences,
	createExamOccurrence,
	updateExamOccurrence,
	deleteExamOccurrence,
} from "./examOccurrencesApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useExamOccurrences() {
	const [items, setItems] = useState<ExamOccurrence[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	const reload = useCallback(async () => {
		setLoadState("loading");
		setError(null);
		try {
			const data = await listExamOccurrences();
			setItems(Array.isArray(data) ? data : []);
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

	return useMemo(() => ({ items, loadState, error, create, update, remove, reload }), [items, loadState, error, create, update, remove, reload]);
}

export type { ExamOccurrence } from "./examOccurrencesApi";


