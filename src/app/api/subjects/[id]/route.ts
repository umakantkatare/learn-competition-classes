import { NextRequest, NextResponse } from "next/server";

import { SubjectService } from "@/server/services/academic/subject-service";
import { updateSubjectSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const subjectService = new SubjectService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch a subject by ID
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject ID is required.",
        },
        { status: 400 },
      );
    }
    const subject = await subjectService.getSubjectById(id);

    return NextResponse.json(
      {
        success: true,
        data: subject,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/subjects/[id] error:", error);

    if (error instanceof Error && error.message === "Subject not found.") {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 },
      );
    }

    if (error instanceof Error && error.message === "Subject ID is required.") {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subject.",
      },
      { status: 500 },
    );
  }
}

// PATCH: Update a subject
export async function PATCH(req: NextRequest, { params }: RouteContext) {
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

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject ID is required.",
        },
        { status: 400 },
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
    const validationResult = updateSubjectSchema.safeParse(body);

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

    // Update subject
    const updatedSubject = await subjectService.updateSubject(
      id,
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Subject updated successfully.",
        data: updatedSubject,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/subjects/[id] error:", error);

    if (error instanceof Error) {
      if (error.message === "Subject not found.") {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 },
        );
      }

      if (
        error.message === "Subject name cannot be empty." ||
        error.message ===
          "At least one field is required to update a subject." ||
        error.message === "Subject ID is required." ||
        error.message === "Batch ID cannot be empty."
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update subject.",
      },
      { status: 500 },
    );
  }
}

// DELETE: Delete a subject
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
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

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject ID is required.",
        },
        { status: 400 },
      );
    }

    const deletedSubject = await subjectService.deleteSubject(id);

    return NextResponse.json(
      {
        success: true,
        message: "Subject deleted successfully.",
        data: deletedSubject,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("DELETE /api/subjects/[id] error:", error);

    if (error instanceof Error) {
      if (error.message === "Subject not found.") {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 },
        );
      }

      if (error.message === "Subject ID is required.") {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete subject.",
      },
      { status: 500 },
    );
  }
}
