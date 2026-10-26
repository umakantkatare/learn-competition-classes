import { NextRequest, NextResponse } from "next/server";

import { SubjectService } from "@/server/services/academic/subject-service";
import { createSubjectSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const subjectService = new SubjectService();

// GET: Fetch all subjects
export async function GET(_req: NextRequest) {
  try {
    const subjects = await subjectService.getAllSubjects();

    return NextResponse.json(
      {
        success: true,
        data: subjects,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/subjects error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subjects.",
      },
      { status: 500 },
    );
  }
}

// POST: Create a subject
export async function POST(req: NextRequest) {
  try {
    // Authorization
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

    // Parse request body
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

    // Validate request body
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

    // Create subject
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
