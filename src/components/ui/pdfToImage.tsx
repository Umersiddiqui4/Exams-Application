import * as pdfjsLib from "pdfjs-dist";
import { logger } from '@/lib/logger';

// Configure PDF.js worker for v5.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function pdfToImages(base64Data: string, maxPages: number = 10): Promise<string[]> {
  try {
    // base64 ko ArrayBuffer me convert karo
    const pdfData = atob(base64Data.split(",")[1]);
    const uint8Array = new Uint8Array(pdfData.length);
    for (let i = 0; i < pdfData.length; i++) {
      uint8Array[i] = pdfData.charCodeAt(i);
    }

    // PDF load karo
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    const images: string[] = [];
    // Limit pages to prevent memory issues
    const totalPages = Math.min(pdf.numPages, maxPages);

    logger.debug(`Converting PDF: ${totalPages} pages`);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Reduced scale for better memory usage (1.0 instead of 1.5)
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", {
        willReadFrequently: false,
        alpha: false
      })!;

      // Limit canvas size to prevent memory issues
      const maxDimension = 2000;
      let scale = 1.0;
      if (viewport.width > maxDimension || viewport.height > maxDimension) {
        scale = Math.min(maxDimension / viewport.width, maxDimension / viewport.height);
      }

      const scaledViewport = page.getViewport({ scale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
        canvas, // Required in v5.x
      }).promise;

      // Use JPEG with compression for smaller file size (70% quality)
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);
      images.push(imageBase64);

      // Clean up canvas immediately
      canvas.width = 0;
      canvas.height = 0;

      // Allow browser to breathe between pages
      if (pageNum < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (pdf.numPages > maxPages) {
      logger.warn(`PDF has ${pdf.numPages} pages, only converted first ${maxPages}`);
    }

    return images;
  } catch (error) {
    logger.error("Error converting PDF to images", error);
    throw new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
