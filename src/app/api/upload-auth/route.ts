import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        {
          status: 401,
          headers: NO_STORE_HEADERS,
        },
      );
    }

    // 2. Validate ImageKit environment variables
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      console.error("ImageKit environment variables are missing.");

      return NextResponse.json(
        { error: "ImageKit is not configured." },
        {
          status: 500,
          headers: NO_STORE_HEADERS,
        },
      );
    }

    // 3. Generate temporary upload authentication parameters
    const authParams = getUploadAuthParams({
      privateKey,
      publicKey,
    });

    // 4. Return authentication parameters to the client
    return NextResponse.json(
      {
        ...authParams,
        publicKey,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error: unknown) {
    console.error("ImageKit upload authentication error:", error);

    return NextResponse.json(
      { error: "Authentication for ImageKit failed." },
      {
        status: 500,
        headers: NO_STORE_HEADERS,
      },
    );
  }
}
