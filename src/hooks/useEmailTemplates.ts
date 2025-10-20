import { useCallback, useEffect, useMemo, useState } from "react";
import {
	CreateEmailTemplateDto,
	deleteEmailTemplate,
	EmailTemplate,
	listEmailTemplates,
	updateEmailTemplate,
	createEmailTemplate,
} from "@/api/emailTemplatesApi";

type LoadState = "idle" | "loading" | "success" | "error";

export function useEmailTemplates() {
	const [items, setItems] = useState<EmailTemplate[]>([]);
	const [loadState, setLoadState] = useState<LoadState>("idle");
	const [error, setError] = useState<string | null>(null);

	const reload = useCallback(async () => {
		setLoadState("loading");
		setError(null);
		try {
			const data: EmailTemplate[] | { data: EmailTemplate[] } = await listEmailTemplates();
			const normalized: EmailTemplate[] = Array.isArray(data)
				? data
				: Array.isArray((data as { data: EmailTemplate[] }).data)
					? (data as { data: EmailTemplate[] }).data
					: [];
			setItems(normalized);
			setLoadState("success");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to load templates");
			setLoadState("error");
		}
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

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

	return useMemo(() => ({ items, loadState, error, create, update, remove, reload }), [items, loadState, error, create, update, remove, reload]);
}

export type { EmailTemplate } from "@/api/emailTemplatesApi";


