// Downloads and the clipboard, as studio/app.js makes them.
import { pngOutputSize, pngScale } from "../../studio/editor-helpers.js";

export function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPng(svg, filename, onError) {
  if (!svg) return;
  const image = new Image();
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  image.onload = () => {
    const canvas = document.createElement("canvas");
    const output = pngOutputSize({ width: image.naturalWidth, height: image.naturalHeight });
    canvas.width = output.width;
    canvas.height = output.height;
    const context = canvas.getContext("2d");
    context.scale(pngScale, pngScale);
    context.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }, "image/png");
    URL.revokeObjectURL(blobUrl);
  };
  image.onerror = () => {
    URL.revokeObjectURL(blobUrl);
    onError();
  };
  image.src = blobUrl;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
}
