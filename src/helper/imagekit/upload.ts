import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";

export interface UploadedFile {
  url: string | undefined;
  fileId: string | undefined;
  name: string | undefined;
  size: number | undefined;
  fileType: string;
}

export interface UploadFileOptions {
  file: File;
  fileName?: string;
  folder?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
}

interface UploadAuthResponse {
  signature: string;
  expire: number;
  token: string;
}

export async function uploadFile({
  file,
  fileName,
  folder,
  tags,
  onProgress,
}: UploadFileOptions): Promise<UploadedFile> {
  if (!file || file.size === 0) {
    throw new Error("Please select a valid file.");
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("ImageKit public key is missing.");
  }

  // Request secure upload authentication from the server.
  const authResponse = await fetch("/api/upload-auth", {
    method: "GET",
    cache: "no-store",
  });

  if (!authResponse.ok) {
    throw new Error("Failed to authenticate ImageKit upload.");
  }

  const auth = (await authResponse.json()) as UploadAuthResponse;

  if (!auth.signature || !auth.token || typeof auth.expire !== "number") {
    throw new Error("Invalid ImageKit authentication response.");
  }

  try {
    const response = await upload({
      file,
      fileName: fileName ?? file.name,
      publicKey,
      signature: auth.signature,
      expire: auth.expire,
      token: auth.token,
      ...(folder
        ? { folder: `/lcc/${folder.replace(/^\/+/, "")}` }
        : {
            folder: "/lcc",
          }),
      ...(tags?.length ? { tags } : {}),
      onProgress: (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percentage = Math.round((event.loaded / event.total) * 100);

          onProgress?.(percentage);
        }
      },
    });

    return {
      url: response.url,
      fileId: response.fileId,
      name: response.name,
      size: response.size,
      fileType: file.type,
    };
  } catch (error: unknown) {
    if (error instanceof ImageKitAbortError) {
      throw new Error("File upload was cancelled.");
    }

    if (error instanceof ImageKitInvalidRequestError) {
      throw new Error("Invalid ImageKit upload request.");
    }

    if (error instanceof ImageKitServerError) {
      throw new Error("ImageKit server error. Try again later.");
    }

    if (error instanceof ImageKitUploadNetworkError) {
      throw new Error("Network error. Check your internet connection.");
    }

    throw error;
  }
}
