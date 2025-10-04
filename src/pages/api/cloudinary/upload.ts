import { auth } from "@/lib";
import type { APIRoute } from "astro";
import { v2 as cloudinary } from "cloudinary";

export const prerender = false;

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Authenticate admin user
    const authCheck = await auth.authenticateUser({ cookies } as any, "ADMIN");

    if (!authCheck.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;
    const tags = formData.get("tags") as string;

    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No file provided",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "File must be an image",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate file size (5MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "File size must be less than 5MB",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload options
    const uploadOptions: any = {
      resource_type: "image",
      transformation: [
        {
          width: 800,
          height: 600,
          crop: "fill",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
      eager: [
        {
          width: 400,
          height: 300,
          crop: "fill",
          quality: "auto",
          fetch_format: "auto",
        },
        {
          width: 150,
          height: 150,
          crop: "fill",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    };

    // Add folder if provided
    if (folder) {
      uploadOptions.folder = folder;
    }

    // Add tags if provided
    if (tags) {
      uploadOptions.tags = tags.split(",").map((tag) => tag.trim());
    }

    console.log("Uploading with options:", uploadOptions);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });

    console.log("Upload successful:", result);

    return new Response(
      JSON.stringify({
        success: true,
        secure_url: (result as any).secure_url,
        public_id: (result as any).public_id,
        width: (result as any).width,
        height: (result as any).height,
        format: (result as any).format,
        bytes: (result as any).bytes,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
