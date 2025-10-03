import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const specPath = join(process.cwd(), "openapi.yaml");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const file = await readFile(specPath, "utf8");

    return new Response(file, {
      headers: {
        "Content-Type": "application/yaml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/swagger] Failed to load OpenAPI spec", error);

    return NextResponse.json(
      { message: "Failed to load OpenAPI document" },
      { status: 500 },
    );
  }
}
