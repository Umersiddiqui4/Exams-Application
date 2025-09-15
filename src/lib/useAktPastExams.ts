import { useCallback, useEffect, useMemo, useState } from "react";
import {
	AktPastExam,
	createAktPastExam,
	deleteAktPastExam,
	listAktPastExams,
	updateAktPastExam,
} from "./aktPastExamsApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useAktPastExams() {
	const [items, setItems] = useState<AktPastExam[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		setLoadState("loading");
		listAktPastExams()
			.then((data) => {
				if (!mounted) return;
				setItems(data);
				setLoadState("success");
			})
			.catch((err: unknown) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : "Failed to load");
				setLoadState("error");
			});
		return () => {
			mounted = false;
		};
	}, []);

	const create = useCallback(async (name: string, description?: string) => {
		const created = await createAktPastExam({ name, description });
		setItems((prev) => [created, ...prev]);
		return created;
	}, []);

	const update = useCallback(async (id: string, changes: Partial<Pick<AktPastExam, "name" | "description">>) => {
		const next = await updateAktPastExam(id, changes);
		setItems((prev) => prev.map((e) => (e.id === id ? next : e)));
		return next;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteAktPastExam(id);
		setItems((prev) => prev.filter((e) => e.id !== id));
	}, []);

	return useMemo(() => ({ items, loadState, error, create, update, remove }), [items, loadState, error, create, update, remove]);
}

export type { AktPastExam } from "./aktPastExamsApi";


