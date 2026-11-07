import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";

export interface UploadedFile {
  url: string;
  fileId: string;
  name: string;
  size: number;
  fileType: string;
}

export interface MediaAsset {
  url: string;
  fileId: string;
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

const IMAGEKIT_AUTH_ENDPOINT = "/api/upload-auth";
const IMAGEKIT_BASE_FOLDER = "/lcc";

function getUploadFolder(folder?: string): string {
  const sanitizedFolder = folder?.replace(/^\/+|\/+$/g, "");

  return sanitizedFolder
    ? `${IMAGEKIT_BASE_FOLDER}/${sanitizedFolder}`
    : IMAGEKIT_BASE_FOLDER;
}

async function getUploadAuth(): Promise<UploadAuthResponse> {
  const response = await fetch(IMAGEKIT_AUTH_ENDPOINT, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate ImageKit upload.");
  }

  const auth = (await response.json()) as UploadAuthResponse;

  if (!auth.signature || !auth.token || typeof auth.expire !== "number") {
    throw new Error("Invalid ImageKit authentication response.");
  }

  return auth;
}

export async function uploadFile({
  file,
  fileName,
  folder,
  tags,
  onProgress,
}: UploadFileOptions): Promise<UploadedFile> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select a valid file.");
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("ImageKit public key is missing.");
  }

  try {
    const auth = await getUploadAuth();

    const response = await upload({
      file,
      fileName: fileName ?? file.name,
      publicKey,
      signature: auth.signature,
      expire: auth.expire,
      token: auth.token,
      folder: getUploadFolder(folder),
      useUniqueFileName: true,

      ...(tags?.length ? { tags } : {}),

      onProgress: (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percentage = Math.round((event.loaded / event.total) * 100);

          onProgress?.(percentage);
        }
      },
    });

    if (!response.url || !response.fileId) {
      throw new Error("Invalid ImageKit upload response.");
    }
    return {
      url: response.url,
      fileId: response.fileId,
      name: response.name ?? fileName ?? file.name,
      size: response.size ?? file.size,
      fileType: response.fileType ?? file.type,
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

export function getMediaAsset(file: UploadedFile): MediaAsset {
  return {
    url: file.url,
    fileId: file.fileId,
  };
}
