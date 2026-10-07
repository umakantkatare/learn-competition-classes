import { NextResponse } from "next/server";

import { getSubjects } from "@/services/academic/subject/queries";

export async function GET() {
  try {
    const subjects = await getSubjects();

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch subjects.",
      },
      {
        status: 500,
      },
    );
  }
}
