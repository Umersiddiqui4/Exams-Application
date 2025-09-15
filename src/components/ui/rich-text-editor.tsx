import { useEffect, useMemo, useRef } from "react";
import "quill/dist/quill.snow.css";

type Props = {
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
	className?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const quillRef = useRef<any | null>(null);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	const modules = useMemo(
		() => ({
			toolbar: [
				[{ header: [1, 2, 3, false] }],
				["bold", "italic", "underline", "strike"],
				[{ list: "ordered" }, { list: "bullet" }],
				["link"],
				[{ color: [] }, { background: [] }],
				[{ align: [] }],
				["clean"],
			],
		}),
		[],
	);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (!containerRef.current) return;
			const { default: Quill } = await import("quill");
			if (!isMounted || !containerRef.current) return;
			const editorEl = document.createElement("div");
			containerRef.current.innerHTML = "";
			containerRef.current.appendChild(editorEl);
			const quill = new Quill(editorEl, {
				theme: "snow",
				modules,
				placeholder,
			});
			quillRef.current = quill;
			if (value) quill.clipboard.dangerouslyPasteHTML(value);
			quill.on("text-change", () => {
				if (!quillRef.current) return;
				onChangeRef.current(quillRef.current.root.innerHTML);
			});
		})();
		return () => {
			isMounted = false;
			quillRef.current = null;
		};
	}, [modules, placeholder]);

	useEffect(() => {
		const quill = quillRef.current;
		if (!quill) return;
		const current = quill.root.innerHTML;
		if (value !== current) {
			const sel = quill.getSelection();
			quill.setContents([]);
			if (value) quill.clipboard.dangerouslyPasteHTML(value);
			if (sel) quill.setSelection(sel);
		}
	}, [value]);

	return <div ref={containerRef} className={className} />;
}

export default RichTextEditor;


