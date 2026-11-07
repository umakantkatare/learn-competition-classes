"use client";

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/constants/image-size";

import { uploadFile, type UploadedFile } from "@/helper/imagekit/upload";

import Image from "next/image";
import React, { useEffect, useState } from "react";

interface IUploadForm {
  image: File | null;
  video: File | null;
}

const ImageUploadForm = () => {
  const [formData, setFormData] = useState<IUploadForm>({
    image: null,
    video: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);

  const [uploadedVideo, setUploadedVideo] = useState<UploadedFile | null>(null);

  const [imageProgress, setImageProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setError(null);
    setUploadedImage(null);

    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);

      setError("Please select a JPG, PNG, or WebP image.");

      e.target.value = "";
      return;
    }

    // Validate image size
    if (file.size > MAX_IMAGE_SIZE) {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);

      setError("Image size must not exceed 5 MB.");

      e.target.value = "";
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setError(null);
    setUploadedVideo(null);

    if (!file) {
      setFormData((prev) => ({ ...prev, video: null }));
      setVideoPreview(null);
      return;
    }

    // Validate video format
    if (
      !ALLOWED_VIDEO_TYPES.includes(
        file.type as (typeof ALLOWED_VIDEO_TYPES)[number],
      )
    ) {
      setFormData((prev) => ({ ...prev, video: null }));
      setVideoPreview(null);

      setError("Please select an MP4, WebM, or MOV video.");

      e.target.value = "";
      return;
    }

    // Validate video size
    if (file.size > MAX_VIDEO_SIZE) {
      setFormData((prev) => ({ ...prev, video: null }));
      setVideoPreview(null);

      setError("Video size must not exceed 100 MB.");

      e.target.value = "";
      return;
    }

    setFormData((prev) => ({ ...prev, video: file }));
    setVideoPreview(URL.createObjectURL(file));
  };


  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [imagePreview, videoPreview]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    const { image, video } = formData;

    if (!image && !video) {
      setError("Please select an image or video before submitting.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    setImageProgress(0);
    setVideoProgress(0);

    try {
      let imageResponse: UploadedFile | null = null;
      let videoResponse: UploadedFile | null = null;

      if (image) {
        imageResponse = await uploadFile({
          file: image,
          folder: "batches/thumbnails",
          tags: ["batch", "thumbnail"],
          onProgress: setImageProgress,
        });

        setUploadedImage(imageResponse);
      }

      if (video) {
        videoResponse = await uploadFile({
          file: video,
          folder: "batches/previews",
          tags: ["batch", "preview"],
          onProgress: setVideoProgress,
        });

        setUploadedVideo(videoResponse);
      }

      const payload = {
        thumbnail: imageResponse
          ? {
              url: imageResponse.url,
              fileId: imageResponse.fileId,
            }
          : null,

        previewVideo: videoResponse
          ? {
              url: videoResponse.url,
              fileId: videoResponse.fileId,
            }
          : null,
      };

      console.log("ImageKit upload successful:", {
        image: imageResponse,
        video: videoResponse,
      });

      console.log("Database payload:", payload);
    } catch (err) {
      console.error("Media upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload media. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        {/* Header */}

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Upload Media
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Upload your image and preview video to ImageKit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Image Upload */}

          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Thumbnail Image
              </h2>

              <p className="text-xs text-gray-500">
                JPG, PNG, WebP · Maximum 5 MB
              </p>
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm file:mr-4 file:border-0 file:bg-gray-900 file:px-4 file:py-3 file:text-white"
            />

            {imagePreview && (
              <div className="space-y-2">
                <Image
                  src={imagePreview}
                  alt="Image preview"
                  width={1000}
                  height={500}
                  unoptimized
                  className="h-56 w-full rounded-xl border object-contain"
                />

                <p className="text-xs text-gray-500">
                  {formData.image?.name} ·{" "}
                  {((formData.image?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {isSubmitting && formData.image && (
              <UploadProgress
                label="Image uploading"
                progress={imageProgress}
              />
            )}

            {uploadedImage && <UploadSuccess file={uploadedImage} />}
          </section>

          {/* Video Upload */}

          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Preview Video
              </h2>

              <p className="text-xs text-gray-500">
                MP4, WebM, MOV · Maximum 100 MB
              </p>
            </div>

            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              disabled={isSubmitting}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm file:mr-4 file:border-0 file:bg-gray-900 file:px-4 file:py-3 file:text-white"
            />

            {videoPreview && (
              <div className="space-y-2">
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded-xl border"
                />

                <p className="text-xs text-gray-500">
                  {formData.video?.name} ·{" "}
                  {((formData.video?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {isSubmitting && formData.video && (
              <UploadProgress
                label="Video uploading"
                progress={videoProgress}
              />
            )}

            {uploadedVideo && <UploadSuccess file={uploadedVideo} />}
          </section>

          {/* Error */}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={isSubmitting || (!formData.image && !formData.video)}
            className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Uploading Media..." : "Upload Media"}
          </button>
        </form>
      </div>
    </div>
  );
};

function UploadProgress({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{progress}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function UploadSuccess({ file }: { file: UploadedFile }) {
  return (
    <div className="space-y-1 rounded-lg border border-green-200 bg-green-50 p-3">
      <p className="text-sm font-semibold text-green-700">
        Uploaded successfully
      </p>

      <p className="break-all text-xs text-green-700">File ID: {file.fileId}</p>

      <p className="break-all text-xs text-green-700">URL: {file.url}</p>
    </div>
  );
}

export default ImageUploadForm;
