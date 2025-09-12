import { useCallback, useEffect, useMemo, useState } from "react";
import {
	createExamDateOption,
	deleteExamDateOption,
	ExamDateOption,
	getExamDateOptions,
	seedDefaultExamDatesOnce,
} from "./fakeExamDatesApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useExamDates() {
	const [items, setItems] = useState<ExamDateOption[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		seedDefaultExamDatesOnce();
		let mounted = true;
		setLoadState("loading");
		getExamDateOptions()
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

	const create = useCallback(async (label: string) => {
		const created = await createExamDateOption(label);
		setItems((prev) => [created, ...prev]);
		return created;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteExamDateOption(id);
		setItems((prev) => prev.filter((o) => o.id !== id));
	}, []);

	return useMemo(
		() => ({ items, loadState, error, create, remove }),
		[items, loadState, error, create, remove],
	);
}

export type { ExamDateOption } from "./fakeExamDatesApi";


