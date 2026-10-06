import { NextResponse } from "next/server";
import { getExams } from "@/services/academic/exam/queries";

export async function GET() {
  try {
    const exams = await getExams();

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Get exams error:", error);

    return NextResponse.json(
      { error: "Unable to fetch exams." },
      { status: 500 },
    );
  }
}
