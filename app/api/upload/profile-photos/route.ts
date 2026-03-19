import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILES_PER_REQUEST = 5;
const MAX_FILE_MB = 5;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Max ${MAX_FILES_PER_REQUEST} files per upload.` },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const entry of files) {
      if (!(entry instanceof File)) continue;

      const sizeMb = entry.size / (1024 * 1024);
      if (sizeMb > MAX_FILE_MB) {
        return NextResponse.json(
          { error: `Each photo must be <= ${MAX_FILE_MB}MB.` },
          { status: 400 }
        );
      }

      const bytes = await entry.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const dataUrl = `data:${entry.type};base64,${buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        folder: `velvetlynk/users/${session.user.id}`,
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      uploadedUrls.push(result.secure_url);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (e: any) {
    console.error("Profile upload error:", e);
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}