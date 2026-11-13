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

// ----------------------------------------
// Folder utilities
// ----------------------------------------

function getUploadFolder(folder?: string): string {
  if (!folder?.trim()) {
    return IMAGEKIT_BASE_FOLDER;
  }

  const segments = folder.replace(/\\/g, "/").split("/").filter(Boolean);

  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error("Invalid upload folder path.");
  }

  return `${IMAGEKIT_BASE_FOLDER}/${segments.join("/")}`;
}

// ----------------------------------------
// Authentication
// ----------------------------------------

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

  if (
    typeof auth.signature !== "string" ||
    !auth.signature ||
    typeof auth.token !== "string" ||
    !auth.token ||
    typeof auth.expire !== "number" ||
    !Number.isFinite(auth.expire)
  ) {
    throw new Error("Invalid ImageKit authentication response.");
  }

  return auth;
}

// ----------------------------------------
// Upload
// ----------------------------------------

export async function uploadFile({
  file,
  fileName,
  folder,
  tags,
  onProgress,
}: UploadFileOptions): Promise<UploadedFile> {
  if (
    typeof File === "undefined" ||
    !(file instanceof File) ||
    file.size === 0
  ) {
    throw new Error("Please select a valid file.");
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("ImageKit public key is missing.");
  }

  const normalizedFileName = fileName?.trim() || file.name;
  const uploadFolder = getUploadFolder(folder);

  try {
    const auth = await getUploadAuth();

    const response = await upload({
      file,
      fileName: normalizedFileName,
      publicKey,
      signature: auth.signature,
      expire: auth.expire,
      token: auth.token,
      folder: uploadFolder,
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
      name: response.name ?? normalizedFileName,
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

// ----------------------------------------
// Image optimization
// ----------------------------------------

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export function getOptimizedImageUrl(
  imageUrl: string,
  { width = 640, height, quality = 80 }: ImageOptimizationOptions = {},
): string {
  if (!imageUrl || !imageUrl.includes("ik.imagekit.io")) {
    return imageUrl;
  }

  const url = new URL(imageUrl);

  const transformations = [
    "f-auto",
    `q-${Math.min(100, Math.max(1, Math.round(quality)))}`,
    `w-${Math.max(1, Math.round(width))}`,
    ...(height ? [`h-${Math.max(1, Math.round(height))}`, "c-at_max"] : []),
  ];

  url.searchParams.set("tr", transformations.join(","));

  return url.toString();
}

// ----------------------------------------
// Media asset
// ----------------------------------------

export function getMediaAsset(file: UploadedFile): MediaAsset {
  return {
    url: file.url,
    fileId: file.fileId,
  };
}
