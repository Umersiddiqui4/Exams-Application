const STORAGE_KEY = "exam-date-options";

export type ExamDateOption = {
	/** A unique identifier generated on create */
	id: string;
	/** Display label, e.g., "AKT - November 2019" */
	label: string;
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
			bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
			bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
			const toHex = (n: number) => n.toString(16).padStart(2, "0");
			const hex = Array.from(bytes, toHex).join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
	} catch {}
	return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readFromStorage(): ExamDateOption[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as ExamDateOption[];
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}

function writeToStorage(options: ExamDateOption[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}

function simulateDelay<T>(value: T, ms = 400): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getExamDateOptions(): Promise<ExamDateOption[]> {
	return simulateDelay(readFromStorage());
}

export async function createExamDateOption(label: string): Promise<ExamDateOption> {
	const trimmed = label.trim();
	if (!trimmed) throw new Error("Label is required");
	const current = readFromStorage();
	const exists = current.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
	if (exists) throw new Error("This option already exists");
	const newOption: ExamDateOption = { id: safeRandomUUID(), label: trimmed };
	writeToStorage([newOption, ...current]);
	return simulateDelay(newOption);
}

export async function deleteExamDateOption(id: string): Promise<{ id: string }>{
	const current = readFromStorage();
	const next = current.filter((o) => o.id !== id);
	writeToStorage(next);
	return simulateDelay({ id });
}

// Seed a sensible default once for fresh environments
export function seedDefaultExamDatesOnce(): void {
	const current = readFromStorage();
	if (current.length > 0) return;
	const defaults = [
		"AKT - November 2024",
		"AKT - May 2024",
		"AKT - November 2023",
		"AKT - May 2023",
		"AKT - November 2022",
		"AKT - June 2022",
		"AKT - January 2022",
		"AKT - June 2021",
		"AKT - September 2020",
		"AKT - November 2019",
		"AKT - May 2019",
	];
	const seeded: ExamDateOption[] = defaults.map((label) => ({ id: safeRandomUUID(), label }));
	writeToStorage(seeded);
}


