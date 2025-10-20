import { useCallback, useEffect, useMemo, useState } from "react";
import { createExam, deleteExam, Exam, getExams, seedDefaultExamsOnce, updateExam } from "@/api/fakeExamsApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useExams() {
	const [items, setItems] = useState<Exam[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		seedDefaultExamsOnce();
		let mounted = true;
		setLoadState("loading");
		getExams()
			.then((data) => {
				if (!mounted) return;
				setItems(data);
				setLoadState("success");
			})
			.catch((err: unknown) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : "Failed to load exams");
				setLoadState("error");
			});
		return () => {
			mounted = false;
		};
	}, []);

	const create = useCallback(async (name: string, description: string) => {
		const created = await createExam({ name, description });
		setItems((prev) => [created, ...prev]);
		return created;
	}, []);

	const update = useCallback(async (id: string, changes: Partial<Pick<Exam, "name" | "description">>) => {
		const next = await updateExam(id, changes);
		setItems((prev) => prev.map((e) => (e.id === id ? next : e)));
		return next;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteExam(id);
		setItems((prev) => prev.filter((e) => e.id !== id));
	}, []);

	return useMemo(() => ({ items, loadState, error, create, update, remove }), [items, loadState, error, create, update, remove]);
}

export type { Exam } from "@/api/fakeExamsApi";


