/** Read an image as PNG data URL, preserving transparency. */

export function readTransparentPngFile(file: File, maxSize = 900) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/") && !/\.png$/i.test(file.name)) {
      reject(new Error("File must be an image."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const image = new Image();
      image.onload = () => {
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        if (!width || !height) {
          reject(new Error("Invalid image dimensions."));
          return;
        }

        const maxDim = Math.max(width, height);
        const isPng =
          file.type === "image/png" ||
          dataUrl.startsWith("data:image/png") ||
          /\.png$/i.test(file.name);

        // Keep original transparent PNG when already small enough.
        if (isPng && maxDim <= maxSize) {
          resolve(dataUrl);
          return;
        }

        const scale = Math.min(1, maxSize / maxDim);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
          reject(new Error("Canvas not supported."));
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("Failed to read image."));
      image.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}
