import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files").filter((f) => f instanceof File) as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (files.length > 2) {
      return NextResponse.json(
        { error: "You can upload at most 2 verification images." },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image uploads are allowed." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Each image must be 10MB or less." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

      const upload = await cloudinary.uploader.upload(dataUrl, {
        folder: "secretlink/verification",
        resource_type: "image",
      });

      urls.push(upload.secure_url);
    }

    return NextResponse.json({ ok: true, urls });
  } catch (error) {
    console.error("Verification photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload verification photos." },
      { status: 500 }
    );
  }
}