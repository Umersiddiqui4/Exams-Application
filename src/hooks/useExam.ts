import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Exam,
	createExam,
	deleteExam,
	listExams,
	updateExam,
} from "@/api/examApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useExams() {
	const [items, setItems] = useState<Exam[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);
	const [created1, setCreated1] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;
		setLoadState("loading");
		listExams()
			.then((data: Exam[] | { data: Exam[] }) => {
				if (!mounted) return;
				const normalized: Exam[] = Array.isArray(data)
					? data
					: Array.isArray((data as { data: Exam[] }).data)
						? (data as { data: Exam[] }).data
						: [];
				setItems(normalized);
				setLoadState("success");
				setCreated1(true);
			})
			.catch((err: unknown) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : "Failed to load");
				setLoadState("error");
			});
		return () => {
			mounted = false;
		};
	}, [created1]);

	const create = useCallback(async (name: string, description?: string) => {
		const created = await createExam({ name, description });
		setItems((prev) => [created, ...prev]);
		setCreated1(false);
		return created;
	}, []);

	const update = useCallback(async (id: string, changes: Partial<Pick<Exam, "name" | "description">>) => {
		const next = await updateExam(id, changes);
		setItems((prev) => prev.map((e) => (e.id === id ? next : e)));
		setCreated1(false);

		return next;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteExam(id);
		setItems((prev) => prev.filter((e) => e.id !== id));
	}, []);

	const reload = useCallback(() => {
		setCreated1(prev => !prev);
	}, []);

	return useMemo(() => ({ items, loadState, error, create, update, remove, reload }), [items, loadState, error, create, update, remove, reload]);
}



export type { Exam } from "@/api/examApi";



