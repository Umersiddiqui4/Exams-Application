import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker for v5.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function pdfToImages(base64Data: string): Promise<string[]> {
  // base64 ko ArrayBuffer me convert karo
  const pdfData = atob(base64Data.split(",")[1]);
  const uint8Array = new Uint8Array(pdfData.length);
  for (let i = 0; i < pdfData.length; i++) {
    uint8Array[i] = pdfData.charCodeAt(i);
  }

  // PDF load karo
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

  const images: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // Canvas banake render karo
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
      canvas, // Required in v5.x
    }).promise;

    // Canvas ko base64 PNG me convert karo
    const imageBase64 = canvas.toDataURL("image/png");
    images.push(imageBase64);
  }

  return images;
}
