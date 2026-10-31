"use client";

import React, { useEffect, useState } from "react";

interface IImageUploadForm {
  image: File | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ImageUploadForm = () => {
  const [formData, setFormData] = useState<IImageUploadForm>({
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setError(null);

    if (!file) {
      setFormData({ image: null });
      setPreview(null);
      return;
    }

    // Validate image format
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormData({ image: null });
      setPreview(null);
      setError("Please select a JPG, PNG, or WebP image.");

      // Allow selecting the same file again
      e.target.value = "";
      return;
    }

    // Validate image size
    if (file.size > MAX_FILE_SIZE) {
      setFormData({ image: null });
      setPreview(null);
      setError("Image size must not exceed 5 MB.");

      e.target.value = "";
      return;
    }

    // Update selected image
    setFormData({ image: file });
    setPreview(URL.createObjectURL(file));
  };

  // Clean up object URLs when the preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { image } = formData;

    if (!image) {
      setError("Please select an image before submitting.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("image", image);

      // TODO: Replace with your actual API request.
      // Example:
      // await axios.post("/api/upload", payload);

      console.log("Image ready for upload:", {
        name: image.name,
        size: image.size,
        type: image.type,
      });

      console.log("FormData prepared successfully.");
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Upload Image
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Select an image to upload.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Image Upload */}
          <div className="space-y-2">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Image <span className="text-red-500">*</span>
            </label>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              aria-invalid={!!error}
              aria-describedby="image-help image-error"
              disabled={isSubmitting}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600 file:mr-4 file:border-0 file:bg-gray-900 file:px-4 file:py-3 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <p id="image-help" className="text-xs text-gray-500">
              Supported formats: JPG, PNG, WebP. Maximum size: 5 MB.
            </p>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Image Preview</p>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
                <img
                  src={preview}
                  alt="Selected image preview"
                  className="h-64 w-full rounded-lg object-contain"
                />
              </div>

              {formData.image && (
                <p className="break-all text-xs text-gray-500">
                  {formData.image.name} (
                  {(formData.image.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p
              id="image-error"
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImageUploadForm;
