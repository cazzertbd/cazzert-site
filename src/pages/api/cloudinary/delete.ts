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

    const { publicId } = await request.json();

    if (!publicId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Public ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to delete image",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
