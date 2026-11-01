import "server-only";

const IMAGEKIT_API_BASE_URL = process.env.IMAGEKIT_API_BASE_URL;

if (!IMAGEKIT_API_BASE_URL) {
  throw new Error("ImageKit API base URL is not configured.");
}

export async function deleteImageKitFile(fileId: string): Promise<void> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("ImageKit private key is not configured.");
  }

  if (!fileId.trim()) {
    throw new Error("ImageKit file ID is required.");
  }

  const authorization = Buffer.from(`${privateKey}:`).toString("base64");

  const response = await fetch(
    `${IMAGEKIT_API_BASE_URL}/files/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${authorization}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error(
      `ImageKit file deletion failed with status ${response.status}.`,
    );
  }
}
