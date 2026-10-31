import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      console.error("ImageKit environment variables are missing.");

      return NextResponse.json(
        { error: "ImageKit is not configured." },
        { status: 500 },
      );
    }

    const authParams = getUploadAuthParams({
      privateKey,
      publicKey,
    });

    return NextResponse.json({
      ...authParams,
      publicKey,
    });
  } catch (error: unknown) {
    console.error("ImageKit upload authentication error:", error);

    return NextResponse.json(
      { error: "Authentication for ImageKit failed." },
      { status: 500 },
    );
  }
}
