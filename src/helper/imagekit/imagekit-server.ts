import "server-only";

const IMAGEKIT_API_BASE_URL =
  process.env.IMAGEKIT_API_BASE_URL?.replace(/\/+$/, "");

export async function deleteImageKitFile(
  fileId: string,
): Promise<void> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!IMAGEKIT_API_BASE_URL) {
    throw new Error("ImageKit API base URL is not configured.");
  }

  if (!privateKey) {
    throw new Error("ImageKit private key is not configured.");
  }

  const normalizedFileId = fileId?.trim();

  if (!normalizedFileId) {
    throw new Error("ImageKit file ID is required.");
  }

  const authorization = Buffer.from(
    `${privateKey}:`,
  ).toString("base64");

  const response = await fetch(
    `${IMAGEKIT_API_BASE_URL}/files/${encodeURIComponent(normalizedFileId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${authorization}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  // Idempotent deletion
  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error(
      `ImageKit deletion failed: ${response.status} ${response.statusText}`,
    );
  }
}