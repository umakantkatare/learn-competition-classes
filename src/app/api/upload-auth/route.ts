import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { message: "ImageKit is not configured" },
        { status: 500 },
      );
    }

    const authParams = getUploadAuthParams({
      publicKey,
      privateKey,
    });

    return NextResponse.json({
      ...authParams,
      publicKey,
    });
  } catch (error) {
  //  if (error instanceof Error && error.message === "UNAUTHORIZED") {
  //     return NextResponse.json(
  //       { message: "Authentication required" },
  //       { status: 401 },
  //     );
  //   }

  //   if (error instanceof Error && error.message === "FORBIDDEN") {
  //     return NextResponse.json(
  //       { message: "Admin access required" },
  //       { status: 403 },
  //     );
  //   }

    console.error("ImageKit upload auth error:", error);

    return NextResponse.json(
      { message: "Unable to authorize upload" },
      { status: 500 },
    );
  
  }
}
