import { NextRequest, NextResponse } from "next/server";

import { SubjectService } from "@/server/services/academic/subject-service";
import { createSubjectSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const subjectService = new SubjectService();

// GET: Fetch subjects, optionally filtered by batchId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");

    const subjects = batchId
      ? await subjectService.getSubjectsByBatchId(batchId)
      : await subjectService.getAllSubjects();

    return NextResponse.json(
      {
        success: true,
        data: subjects,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/subjects error:", error);
    if (error instanceof Error && error.message === "Batch ID is required.") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch subjects." },
      { status: 500 },
    );
  }
}

// POST: Create a subject for a specific batch
export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to perform this action.",
        },
        { status: access.status },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    const validationResult = createSubjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ??
            "Invalid subject data.",
        },
        { status: 400 },
      );
    }

    const newSubject = await subjectService.createSubject(
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Subject created successfully.",
        data: newSubject,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/subjects error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create subject.",
      },
      { status: 500 },
    );
  }
}
