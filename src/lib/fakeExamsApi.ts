const STORAGE_KEY = "exam-entities";

export type Exam = {
	id: string;
	name: string;
	description: string;
};

function safeRandomUUID(): string {
	try {
		const anyCrypto = (globalThis as unknown as { crypto?: Crypto }).crypto;
		if (anyCrypto && (anyCrypto as unknown as { randomUUID?: () => string }).randomUUID) {
			return (anyCrypto as unknown as { randomUUID: () => string }).randomUUID();
		}
		if (anyCrypto && typeof anyCrypto.getRandomValues === "function") {
			const bytes = new Uint8Array(16);
			anyCrypto.getRandomValues(bytes);
			bytes[6] = (bytes[6] & 0x0f) | 0x40;
			bytes[8] = (bytes[8] & 0x3f) | 0x80;
			const toHex = (n: number) => n.toString(16).padStart(2, "0");
			const hex = Array.from(bytes, toHex).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
	} catch {}
	return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function read(): Exam[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as Exam[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function write(items: Exam[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function delay<T>(v: T, ms = 350): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(v), ms));
}

export async function getExams(): Promise<Exam[]> {
	return delay(read());
}

export async function createExam(payload: { name: string; description: string }): Promise<Exam> {
	const name = payload.name.trim();
	const description = payload.description.trim();
	if (!name) throw new Error("Name is required");
	const current = read();
	const exists = current.some((e) => e.name.toLowerCase() === name.toLowerCase());
	if (exists) throw new Error("Exam with this name already exists");
	const created: Exam = { id: safeRandomUUID(), name, description };
	write([created, ...current]);
	return delay(created);
}

export async function updateExam(id: string, changes: Partial<Pick<Exam, "name" | "description">>): Promise<Exam> {
	const current = read();
	const idx = current.findIndex((e) => e.id === id);
	if (idx < 0) throw new Error("Not found");
	const next: Exam = { ...current[idx], ...changes };
	const uniqueName = current.every((e) => (e.id === id ? true : e.name.toLowerCase() !== next.name.toLowerCase()));
	if (!uniqueName) throw new Error("Another exam already has this name");
	const copy = [...current];
	copy[idx] = next;
	write(copy);
	return delay(next);
}

export async function deleteExam(id: string): Promise<{ id: string }> {
	const current = read();
	write(current.filter((e) => e.id !== id));
	return delay({ id });
}

export function seedDefaultExamsOnce() {
	const current = read();
	if (current.length > 0) return;
	const defaults: Exam[] = [
		{ id: safeRandomUUID(), name: "OSCE", description: "Objective Structured Clinical Examination" },
		{ id: safeRandomUUID(), name: "AKT", description: "Applied Knowledge Test" },
	];
	write(defaults);
}


