import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

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

    return NextResponse.json(
      {
        ...authParams,
        publicKey,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("ImageKit upload authentication error:", error);

    return NextResponse.json(
      { error: "Authentication for ImageKit failed." },
      { status: 500 },
    );
  }
}
