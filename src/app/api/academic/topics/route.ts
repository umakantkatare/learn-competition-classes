import { NextResponse } from "next/server";

import { getTopics } from "@/services/academic/topic/queries";

export async function GET() {
  try {
    const topics = await getTopics();

    return NextResponse.json(topics);
  } catch (error) {
    console.error("Get topics error:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch topics.",
      },
      {
        status: 500,
      },
    );
  }
}
