import { auth } from "@/lib";
import type { APIRoute } from "astro";
import { v2 as cloudinary } from "cloudinary";

export const prerender = false;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    const body = await request.json();
    const { paramsToSign, customParams } = body;

    console.log("Signature request - params to sign:", paramsToSign);
    console.log("Signature request - custom params:", customParams);

    // Start with params from Cloudinary widget
    const params = { ...paramsToSign };

    // Add custom parameters that need to be signed
    if (customParams) {
      if (customParams.folder) {
        params.folder = customParams.folder;
      }
      if (customParams.tags) {
        params.tags = customParams.tags;
      }
      if (customParams.transformation) {
        params.transformation = customParams.transformation;
      }
    }

    // Remove parameters that shouldn't be signed
    delete params.api_key;

    console.log("Final params being signed:", params);

    // Generate signature using Cloudinary's method
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!,
    );

    console.log("Generated signature:", signature);

    return new Response(
      JSON.stringify({
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp: params.timestamp,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error generating signature:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate signature",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
