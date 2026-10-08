import { NextResponse } from "next/server";

import { getTopicsBySubjectId } from "@/lib/academic/topic/queries";

interface RouteProps {
  params: Promise<{
    subjectId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { subjectId } = await params;

    const topics = await getTopicsBySubjectId(subjectId);

    return NextResponse.json(topics);
  } catch (error) {
    console.error("Get subject topics error:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch subject topics.",
      },
      {
        status: 500,
      },
    );
  }
}
