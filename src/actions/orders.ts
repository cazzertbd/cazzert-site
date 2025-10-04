import { auth } from "@/lib";
import { prisma } from "@/lib/prisma";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

// Helper function to generate order number
const generateOrderNumber = async (): Promise<string> => {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

  // Get the count of orders created today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const dailyOrderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const orderNumber = `ORD-${today}-${String(dailyOrderCount + 1).padStart(3, "0")}`;
  return orderNumber;
};

// Helper function to calculate order totals
const calculateOrderTotals = async (
  items: { productId: string; quantity: number }[],
) => {
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    // Check stock availability
    if (product.stock !== null && product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
      );
    }

    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: itemSubtotal,
    });
  }

  // Calculate delivery fee (free delivery over 2000 BDT)
  const deliveryFee = subtotal >= 2000 ? 0 : 100;

  // No tax or discount for now
  const tax = 0;
  const discount = 0;

  const total = subtotal + deliveryFee + tax - discount;

  return {
    orderItems,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
  };
};

// Helper function to determine payment status based on order status and payment method
const getPaymentStatusForOrderStatus = (
  orderStatus: string,
  paymentMethod: string,
  currentPaymentStatus: string,
): "PENDING" | "PAID" | "FAILED" => {
  // Don't change payment status if it's already PAID or FAILED
  if (currentPaymentStatus === "PAID" || currentPaymentStatus === "FAILED") {
    return currentPaymentStatus as "PAID" | "FAILED";
  }

  // For Cash on Delivery orders
  if (paymentMethod === "CASH_ON_DELIVERY") {
    switch (orderStatus) {
      case "DELIVERED":
      case "COMPLETED":
        return "PAID"; // Payment received upon delivery
      case "CANCELLED":
      case "REFUNDED":
        return "FAILED"; // No payment needed for cancelled orders
      default:
        return "PENDING"; // Payment pending until delivery
    }
  }

  // For other payment methods, keep existing logic
  switch (orderStatus) {
    case "PAID":
    case "PREPARING":
    case "READY":
    case "OUT_FOR_DELIVERY":
    case "DELIVERED":
    case "COMPLETED":
      return "PAID";
    case "CANCELLED":
    case "REFUNDED":
      return "FAILED";
    default:
      return currentPaymentStatus as "PENDING" | "PAID" | "FAILED";
  }
};

export const orders = {
  // Place a new order
  place: defineAction({
    accept: "json",
    input: z.object({
      // Customer Information
      customerName: z.string().min(2, "Name must be at least 2 characters"),
      customerEmail: z.string().email("Please enter a valid email"),
      customerPhone: z
        .string()
        .min(10, "Please enter a valid phone number")
        .optional(),

      // Delivery Information
      deliveryAddress: z
        .string()
        .min(10, "Please provide a complete address")
        .optional(),
      deliveryDate: z.string().optional(),
      deliveryTime: z.string().optional(),
      deliveryNotes: z.string().optional(),

      // Order Details
      items: z
        .array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            customization: z.string().optional(),
          }),
        )
        .min(1, "Order must contain at least one item"),

      // Optional user ID for logged-in users
      userId: z.string().optional(),
    }),
    handler: async (input, _context) => {
      try {
        // Calculate order totals
        const orderCalculation = await calculateOrderTotals(input.items);

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
          // Create the order
          const newOrder = await tx.order.create({
            data: {
              orderNumber,
              customerName: input.customerName,
              customerEmail: input.customerEmail,
              customerPhone: input.customerPhone,
              deliveryAddress: input.deliveryAddress,
              deliveryDate: input.deliveryDate
                ? new Date(input.deliveryDate)
                : null,
              deliveryTime: input.deliveryTime,
              deliveryNotes: input.deliveryNotes,
              paymentMethod: "CASH_ON_DELIVERY", // Default for now
              paymentStatus: "PENDING", // COD payment is pending until delivery
              userId: input.userId || null,
              subtotal: orderCalculation.subtotal,
              deliveryFee: orderCalculation.deliveryFee,
              tax: orderCalculation.tax,
              discount: orderCalculation.discount,
              total: orderCalculation.total,
            },
          });

          // Create order items
          for (let i = 0; i < orderCalculation.orderItems.length; i++) {
            const orderItem = orderCalculation.orderItems[i];
            const originalItem = input.items[i];

            await tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                unitPrice: orderItem.unitPrice,
                subtotal: orderItem.subtotal,
                customization: originalItem.customization,
              },
            });

            // Update product stock if applicable
            const product = await tx.product.findUnique({
              where: { id: originalItem.productId },
            });

            if (product && product.stock !== null) {
              await tx.product.update({
                where: { id: originalItem.productId },
                data: {
                  stock: product.stock - orderItem.quantity,
                },
              });
            }
          }

          return newOrder;
        });

        return {
          success: true,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
          },
          message: "Order placed successfully!",
        };
      } catch (error) {
        console.error("Error placing order:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to place order",
        };
      }
    },
  }),

  // Get all orders (Admin only)
  getAll: defineAction({
    accept: "json",
    input: z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      status: z
        .enum([
          "PENDING",
          "CONFIRMED",
          "PAID",
          "PREPARING",
          "READY",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "COMPLETED",
          "CANCELLED",
          "REFUNDED",
        ])
        .optional(),
    }),
    handler: async ({ page, limit, status }, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const [orders, totalCount] = await Promise.all([
          prisma.order.findMany({
            where,
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              user: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: limit,
          }),
          prisma.order.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
          success: true,
          data: {
            orders,
            pagination: {
              currentPage: page,
              totalPages,
              totalCount,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
          },
        };
      } catch (error) {
        console.error("Error fetching orders:", error);
        return {
          success: false,
          error: "Failed to fetch orders",
        };
      }
    },
  }),

  // Get order details
  getDetails: defineAction({
    accept: "json",
    input: z.object({
      orderNumber: z.string(),
    }),
    handler: async ({ orderNumber }, _context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
          },
        });

        if (!order) {
          return {
            success: false,
            error: "Order not found",
          };
        }

        return {
          success: true,
          data: order,
        };
      } catch (error) {
        console.error("Error fetching order details:", error);
        return {
          success: false,
          error: "Failed to fetch order details",
        };
      }
    },
  }),

  // Update order status (Admin only)
  updateStatus: defineAction({
    accept: "json",
    input: z.object({
      orderId: z.string(),
      status: z.enum([
        "PENDING",
        "CONFIRMED",
        "PAID",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ]),
      notes: z.string().optional(),
      estimatedReady: z.string().optional(),
    }),
    handler: async ({ orderId, status, notes, estimatedReady }, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Get current order to check payment method
        const currentOrder = await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            paymentMethod: true,
            paymentStatus: true,
          },
        });

        if (!currentOrder) {
          return {
            success: false,
            error: "Order not found",
          };
        }

        // Determine new payment status based on order status and payment method
        const newPaymentStatus = getPaymentStatusForOrderStatus(
          status,
          currentOrder.paymentMethod || "CASH_ON_DELIVERY",
          currentOrder.paymentStatus,
        );

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status,
            paymentStatus: newPaymentStatus,
            notes: notes || undefined,
            estimatedReady: estimatedReady
              ? new Date(estimatedReady)
              : undefined,
            updatedAt: new Date(),
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
          },
        });

        return {
          success: true,
          data: updatedOrder,
          message: "Order status updated successfully!",
        };
      } catch (error) {
        console.error("Error updating order status:", error);
        return {
          success: false,
          error: "Failed to update order status",
        };
      }
    },
  }),

  // Cancel order
  cancel: defineAction({
    accept: "json",
    input: z.object({
      orderId: z.string(),
    }),
    handler: async ({ orderId }, _context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: true,
          },
        });

        if (!order) {
          return {
            success: false,
            error: "Order not found",
          };
        }

        // Only allow cancellation for certain statuses
        if (!["PENDING", "CONFIRMED"].includes(order.status)) {
          return {
            success: false,
            error: "Order cannot be cancelled at this stage",
          };
        }

        // Update order status and restore stock
        await prisma.$transaction(async (tx) => {
          // Update order status and payment status
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED", // Mark payment as failed for cancelled orders
              updatedAt: new Date(),
            },
          });

          // Restore product stock
          for (const item of order.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });

            if (product && product.stock !== null) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: product.stock + item.quantity,
                },
              });
            }
          }
        });

        return {
          success: true,
          message: "Order cancelled successfully",
        };
      } catch (error) {
        console.error("Error cancelling order:", error);
        return {
          success: false,
          error: "Failed to cancel order",
        };
      }
    },
  }),

  // Get user orders
  getUserOrders: defineAction({
    accept: "json",
    input: z.object({
      userId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
    }),
    handler: async ({ userId, page, limit }, _context) => {
      try {
        const skip = (page - 1) * limit;

        const [orders, totalCount] = await Promise.all([
          prisma.order.findMany({
            where: { userId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: limit,
          }),
          prisma.order.count({ where: { userId } }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
          success: true,
          data: {
            orders,
            pagination: {
              currentPage: page,
              totalPages,
              totalCount,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
          },
        };
      } catch (error) {
        console.error("Error fetching user orders:", error);
        return {
          success: false,
          error: "Failed to fetch orders",
        };
      }
    },
  }),

  // Get order statistics (Admin only)
  getStatistics: defineAction({
    accept: "json",
    handler: async (_input, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        const [
          totalOrders,
          pendingOrders,
          confirmedOrders,
          preparingOrders,
          completedOrders,
          totalRevenue,
        ] = await Promise.all([
          prisma.order.count(),
          prisma.order.count({ where: { status: "PENDING" } }),
          prisma.order.count({ where: { status: "CONFIRMED" } }),
          prisma.order.count({ where: { status: "PREPARING" } }),
          prisma.order.count({ where: { status: "COMPLETED" } }),
          prisma.order.aggregate({
            _sum: { total: true },
            where: {
              status: { in: ["COMPLETED", "DELIVERED"] },
              paymentStatus: "PAID", // Only count paid orders in revenue
            },
          }),
        ]);

        return {
          success: true,
          data: {
            totalOrders,
            pendingOrders,
            confirmedOrders,
            preparingOrders,
            completedOrders,
            totalRevenue: totalRevenue._sum.total || 0,
          },
        };
      } catch (error) {
        console.error("Error fetching order statistics:", error);
        return {
          success: false,
          error: "Failed to fetch statistics",
        };
      }
    },
  }),

  getHistory: defineAction({
    input: z.object({
      email: z.string().email(),
    }),
    handler: async ({ email }) => {
      const trimmedEmail = email.trim().toLowerCase();

      try {
        // Check if email has orders
        const orderCount = await prisma.order.count({
          where: {
            customerEmail: trimmedEmail,
          },
        });

        if (orderCount === 0) {
          return {
            success: true,
            orders: [],
            total: 0,
          };
        }

        // Fetch orders for the email
        const orders = await prisma.order.findMany({
          where: {
            customerEmail: trimmedEmail,
          },
          include: {
            items: {
              select: {
                id: true,
                quantity: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Transform the data for the frontend
        const orderSummaries = orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          total: order.total,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          createdAt: order.createdAt.toISOString(),
          deliveryDate: order.deliveryDate?.toISOString(),
          paymentStatus: order.paymentStatus,
        }));

        return {
          success: true,
          orders: orderSummaries,
          total: orderSummaries.length,
        };
      } catch (error: any) {
        console.error("Error fetching order history:", error);

        return {
          success: false,
          message: "Failed to fetch order history",
        };
      }
    },
  }),

  verifyOrder: defineAction({
    input: z.object({
      orderNumber: z.string(),
      email: z.string().email(),
    }),
    handler: async ({ orderNumber, email }) => {
      const trimmedEmail = email.trim().toLowerCase();

      try {
        // Verify order exists and email matches
        const order = await prisma.order.findFirst({
          where: {
            orderNumber: orderNumber.trim(),
            customerEmail: trimmedEmail,
          },
          select: {
            id: true,
            orderNumber: true,
          },
        });

        if (!order) {
          return {
            success: false,
            message: "Order not found or email doesn't match",
          };
        }

        return {
          success: true,
          message: "Order verified",
        };
      } catch (error: any) {
        console.error("Error verifying order:", error);

        return {
          success: false,
          message: "Failed to verify order",
        };
      }
    },
  }),

  // Bulk update payment status for COD orders (Admin utility)
  updateCODPaymentStatus: defineAction({
    accept: "json",
    handler: async (_input, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Update payment status for delivered/completed COD orders
        const updatedOrders = await prisma.order.updateMany({
          where: {
            paymentMethod: "CASH_ON_DELIVERY",
            paymentStatus: "PENDING",
            status: {
              in: ["DELIVERED", "COMPLETED"],
            },
          },
          data: {
            paymentStatus: "PAID",
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          data: {
            updatedCount: updatedOrders.count,
          },
          message: `Updated payment status for ${updatedOrders.count} COD orders`,
        };
      } catch (error) {
        console.error("Error updating COD payment status:", error);
        return {
          success: false,
          error: "Failed to update COD payment status",
        };
      }
    },
  }),
};
