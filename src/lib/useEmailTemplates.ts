import { useCallback, useEffect, useMemo, useState } from "react";
import {
	CreateEmailTemplateDto,
	deleteEmailTemplate,
	EmailTemplate,
	listEmailTemplates,
	updateEmailTemplate,
	createEmailTemplate,
} from "./emailTemplatesApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useEmailTemplates() {
	const [items, setItems] = useState<EmailTemplate[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		setLoadState("loading");
		listEmailTemplates()
			.then((data: any) => {
				if (!mounted) return;
				const normalized: EmailTemplate[] = Array.isArray(data?.data)
					? (data.data as EmailTemplate[])
					: Array.isArray(data)
						? (data as EmailTemplate[])
						: [];
				setItems(normalized);
				setLoadState("success");
			})
			.catch((err: unknown) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : "Failed to load templates");
				setLoadState("error");
			});
		return () => {
			mounted = false;
		};
	}, []);

	const create = useCallback(async (payload: CreateEmailTemplateDto) => {
		const created = await createEmailTemplate(payload);
		setItems((prev) => [created, ...prev]);
		return created;
	}, []);

	const update = useCallback(async (id: string, payload: Partial<CreateEmailTemplateDto>) => {
		const next = await updateEmailTemplate(id, payload);
		setItems((prev) => prev.map((t) => (t.id === id ? next : t)));
		return next;
	}, []);

	const remove = useCallback(async (id: string) => {
		await deleteEmailTemplate(id);
		setItems((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return useMemo(() => ({ items, loadState, error, create, update, remove }), [items, loadState, error, create, update, remove]);
}

export type { EmailTemplate } from "./emailTemplatesApi";


