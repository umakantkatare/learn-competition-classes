"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";

import { useRef, useState, type ChangeEvent } from "react";

interface FileUploadProps {
  onSuccess: (response: Awaited<ReturnType<typeof upload>>) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video" | "all";
  maxSizeMB?: number;
  disabled?: boolean;
}

const FileUpload = ({
  onSuccess,
  onProgress,
  fileType = "all",
  maxSizeMB = 100,
  disabled = false,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Determine accepted file types.
  const acceptedTypes = {
    image: "image/*",
    video: "video/*",
    all: "image/*,video/*",
  };

  // Validate the selected file.
  const validateFile = (file: File): string | null => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (fileType === "image" && !isImage) {
      return "Please select a valid image file.";
    }

    if (fileType === "video" && !isVideo) {
      return "Please select a valid video file.";
    }

    if (fileType === "all" && !isImage && !isVideo) {
      return "Please select an image or video file.";
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return `File size must not exceed ${maxSizeMB} MB.`;
    }

    if (file.size === 0) {
      return "The selected file is empty.";
    }

    return null;
  };

  // Extract a useful error message.
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof ImageKitAbortError) {
      return "Upload was cancelled.";
    }

    if (error instanceof ImageKitInvalidRequestError) {
      return "Invalid upload request. Please check the file and configuration.";
    }

    if (error instanceof ImageKitServerError) {
      return "ImageKit server error. Please try again later.";
    }

    if (error instanceof ImageKitUploadNetworkError) {
      return "Network error. Please check your internet connection.";
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong while uploading the file.";
  };

  // Upload the selected file to ImageKit.
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setError(null);
    setProgress(0);

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      input.value = "";
      return;
    }

    setUploading(true);

    try {
      const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
      
      if (!publicKey) {
        throw new Error(
          "ImageKit public key is missing from environment variables.",
        );
      }

      // Get secure upload authentication from the server.
      const authResponse = await fetch("/api/upload-auth", {
        method: "GET",
        cache: "no-store",
      });

      if (!authResponse.ok) {
        throw new Error("Unable to authenticate the ImageKit upload request.");
      }

      const auth = (await authResponse.json()) as {
        signature?: string;
        expire?: number;
        token?: string;
      };

      if (!auth.signature || !auth.token || typeof auth.expire !== "number") {
        throw new Error("Invalid ImageKit authentication response.");
      }

      // Upload directly to ImageKit.
      const response = await upload({
        file,
        fileName: file.name,
        publicKey,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,

        onProgress: (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percentage = Math.round((event.loaded / event.total) * 100);

            setProgress(percentage);
            onProgress?.(percentage);
          }
        },
      });

      setProgress(100);
      onProgress?.(100);

      onSuccess(response);
    } catch (error: unknown) {
      console.error("ImageKit upload failed:", error);

      setError(getErrorMessage(error));
    } finally {
      setUploading(false);

      // Allow selecting the same file again.
      input.value = "";
    }
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes[fileType]}
        onChange={handleFileChange}
        disabled={uploading || disabled}
        aria-label={`Upload ${fileType === "all" ? "image or video" : fileType}`}
        className="block w-full cursor-pointer rounded-md border border-input bg-background text-sm
          file:mr-4 file:border-0 file:bg-muted file:px-4 file:py-2
          file:font-medium file:text-foreground
          disabled:cursor-not-allowed disabled:opacity-50"
      />

      {uploading && (
        <div className="space-y-2" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading file...</span>

            <span className="font-medium">{progress}%</span>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="File upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
