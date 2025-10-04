export const prerender = false;

import { prisma } from "@/lib/prisma";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order number and email are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find order by order number and email
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        customerEmail: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    if (!order) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order not found or email doesn't match",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orderNumber: order.orderNumber,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error verifying order:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
