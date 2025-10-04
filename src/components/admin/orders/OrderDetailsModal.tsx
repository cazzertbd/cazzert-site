import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdPrint, MdRefresh } from "react-icons/md";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryNotes?: string;
  paymentMethod?: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  estimatedReady?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    customization?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  }>;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  orderNumber,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);

  const { execute: getOrderDetails, isPending: isLoading } = useAstroAction(
    actions.orders.getDetails,
  );

  useEffect(() => {
    if (isOpen && orderNumber) {
      fetchOrderDetails();
    }
  }, [isOpen, orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const result = await getOrderDetails({ orderNumber });

      if (result.success) {
        setOrder(result.data);
      } else {
        toast.error(result.error || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to fetch order details");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "info";
      case "PAID":
        return "success";
      case "PREPARING":
        return "primary";
      case "READY":
        return "success";
      case "OUT_FOR_DELIVERY":
        return "info";
      case "DELIVERED":
        return "success";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "danger";
      case "REFUNDED":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    // Prevent infinite loop by checking if we're already showing placeholder
    if (!target.src.includes("data:image")) {
      // Use a data URI as fallback to prevent network requests
      target.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZIMzRDMzcuMzEzNyAyNiA0MCAyOC42ODYzIDQwIDMyVjM2QzQwIDM5LjMxMzcgMzcuMzEzNyA0MiAzNCA0MkgzMEMyNi42ODYzIDQyIDI0IDM5LjMxMzcgMjQgMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCAzMEgyOFYzNEgzNlYzMEgzNk0zMiAzNEwzMCAzNkgzNEwzMiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=";
      target.alt = "Product image unavailable";
    }
  };

  const handlePrint = () => {
    if (!order) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the order");
      return;
    }

    // Generate the print HTML
    const printHTML = generatePrintHTML(order);

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const generatePrintHTML = (order: OrderDetails) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order ${order.orderNumber} - Cazzert</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .header p {
            color: #6b7280;
            font-size: 16px;
        }
        
        .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 8px;
        }
        
        .order-number {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
        }
        
        .order-date {
            color: #6b7280;
        }
        
        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status.pending { background-color: #fef3c7; color: #92400e; }
        .status.confirmed { background-color: #dbeafe; color: #1e40af; }
        .status.paid { background-color: #d1fae5; color: #065f46; }
        .status.preparing { background-color: #e0e7ff; color: #3730a3; }
        .status.ready { background-color: #d1fae5; color: #065f46; }
        .status.delivered { background-color: #d1fae5; color: #065f46; }
        .status.completed { background-color: #d1fae5; color: #065f46; }
        .status.cancelled { background-color: #fee2e2; color: #991b1b; }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        
        .two-column {
            display: flex;
            gap: 30px;
            margin-bottom: 25px;
        }
        
        .column {
            flex: 1;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 8px;
        }
        
        .field {
            margin-bottom: 10px;
        }
        
        .field-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 2px;
        }
        
        .field-value {
            color: #6b7280;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #374151;
        }
        
        .item-image {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .item-details {
            max-width: 200px;
        }
        
        .item-name {
            font-weight: 500;
            margin-bottom: 2px;
        }
        
        .item-customization {
            font-size: 12px;
            color: #6b7280;
            font-style: italic;
        }
        
        .summary-table {
            width: 100%;
            margin-top: 20px;
        }
        
        .summary-table td {
            padding: 8px 0;
            border: none;
        }
        
        .summary-table .label {
            text-align: right;
            padding-right: 20px;
            color: #6b7280;
        }
        
        .summary-table .value {
            text-align: right;
            font-weight: 500;
        }
        
        .total-row {
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
        }
        
        .total-row .label,
        .total-row .value {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        
        @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cazzert</h1>
        <p>Order Invoice</p>
    </div>
    
    <div class="order-info">
        <div>
            <div class="order-number">Order #${order.orderNumber}</div>
            <div class="order-date">Placed on ${formatDate(order.createdAt)}</div>
        </div>
        <div>
            <span class="status ${order.status.toLowerCase()}">${order.status.replace("_", " ")}</span>
        </div>
    </div>
    
    <div class="two-column">
        <div class="column">
            <div class="section-title">Customer Information</div>
            <div class="field">
                <div class="field-label">Name:</div>
                <div class="field-value">${order.customerName}</div>
            </div>
            <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value">${order.customerEmail}</div>
            </div>
            ${
              order.customerPhone
                ? `
            <div class="field">
                <div class="field-label">Phone:</div>
                <div class="field-value">${order.customerPhone}</div>
            </div>
            `
                : ""
            }
        </div>
        
        <div class="column">
            <div class="section-title">Delivery Information</div>
            ${
              order.deliveryAddress
                ? `
            <div class="field">
                <div class="field-label">Address:</div>
                <div class="field-value">${order.deliveryAddress}</div>
            </div>
            `
                : ""
            }
            ${
              order.deliveryDate
                ? `
            <div class="field">
                <div class="field-label">Date:</div>
                <div class="field-value">${formatDate(order.deliveryDate)}</div>
            </div>
            `
                : ""
            }
            ${
              order.deliveryTime
                ? `
            <div class="field">
                <div class="field-label">Time:</div>
                <div class="field-value">${order.deliveryTime}</div>
            </div>
            `
                : ""
            }
            ${
              order.deliveryNotes
                ? `
            <div class="field">
                <div class="field-label">Notes:</div>
                <div class="field-value">${order.deliveryNotes}</div>
            </div>
            `
                : ""
            }
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Order Items</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items
                  .map(
                    (item) => `
                <tr>
                    <td>
                        <div class="item-details">
                            <div class="item-name">${item.product.name}</div>
                            ${item.customization ? `<div class="item-customization">"${item.customization}"</div>` : ""}
                        </div>
                    </td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unitPrice)}</td>
                    <td>${formatCurrency(item.subtotal)}</td>
                </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <table class="summary-table">
            <tr>
                <td class="label">Subtotal:</td>
                <td class="value">${formatCurrency(order.subtotal)}</td>
            </tr>
            <tr>
                <td class="label">Delivery Fee:</td>
                <td class="value">${formatCurrency(order.deliveryFee)}</td>
            </tr>
            ${
              order.tax > 0
                ? `
            <tr>
                <td class="label">Tax:</td>
                <td class="value">${formatCurrency(order.tax)}</td>
            </tr>
            `
                : ""
            }
            ${
              order.discount > 0
                ? `
            <tr>
                <td class="label">Discount:</td>
                <td class="value">-${formatCurrency(order.discount)}</td>
            </tr>
            `
                : ""
            }
            <tr class="total-row">
                <td class="label">Total:</td>
                <td class="value">${formatCurrency(order.total)}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <div class="section-title">Payment Information</div>
        <div class="field">
            <div class="field-label">Payment Method:</div>
            <div class="field-value">${order.paymentMethod?.replace("_", " ") || "Cash on Delivery"}</div>
        </div>
        <div class="field">
            <div class="field-label">Payment Status:</div>
            <div class="field-value">${order.paymentStatus}</div>
        </div>
    </div>
    
    ${
      order.notes
        ? `
    <div class="section">
        <div class="section-title">Internal Notes</div>
        <div class="field-value">${order.notes}</div>
    </div>
    `
        : ""
    }
    
    <div class="footer">
        <p>Thank you for choosing Cazzert!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
        <p>Generated on ${new Date().toLocaleDateString("en-BD", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
    </div>
</body>
</html>`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Details"
      size="2xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <MdRefresh className="mr-2 h-6 w-6 animate-spin" />
          Loading order details...
        </div>
      ) : !order ? (
        <div className="py-8 text-center">
          <p className="text-text-muted">Order not found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="border-border/20 border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-Secondary text-text-base text-xl font-semibold">
                  {order.orderNumber}
                </h3>
                <p className="text-text-muted text-sm">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={getStatusBadgeVariant(order.status) as any}
                  size="md"
                >
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
              <h4 className="text-text-base mb-3 font-semibold">
                Customer Information
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-text-muted text-sm">Name:</span>
                  <p className="text-text-base font-medium">
                    {order.customerName}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Email:</span>
                  <p className="text-text-base">{order.customerEmail}</p>
                </div>
                {order.customerPhone && (
                  <div>
                    <span className="text-text-muted text-sm">Phone:</span>
                    <p className="text-text-base">{order.customerPhone}</p>
                  </div>
                )}
                {order.user && (
                  <div>
                    <span className="text-text-muted text-sm">
                      Registered User:
                    </span>
                    <p className="text-text-base">Yes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
              <h4 className="text-text-base mb-3 font-semibold">
                Delivery Information
              </h4>
              <div className="space-y-2">
                {order.deliveryAddress && (
                  <div>
                    <span className="text-text-muted text-sm">Address:</span>
                    <p className="text-text-base">{order.deliveryAddress}</p>
                  </div>
                )}
                {order.deliveryDate && (
                  <div>
                    <span className="text-text-muted text-sm">Date:</span>
                    <p className="text-text-base">
                      {formatDate(order.deliveryDate)}
                    </p>
                  </div>
                )}
                {order.deliveryTime && (
                  <div>
                    <span className="text-text-muted text-sm">Time:</span>
                    <p className="text-text-base">{order.deliveryTime}</p>
                  </div>
                )}
                {order.deliveryNotes && (
                  <div>
                    <span className="text-text-muted text-sm">Notes:</span>
                    <p className="text-text-base">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <h4 className="text-text-base mb-4 font-semibold">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="border-border/20 flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={handleImageError}
                      />
                    )}
                    <div>
                      <p className="text-text-base font-medium">
                        {item.product.name}
                      </p>
                      <p className="text-text-muted text-sm">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                      {item.customization && (
                        <p className="text-text-muted text-xs italic">
                          "{item.customization}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-text-base font-semibold">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <h4 className="text-text-base mb-4 font-semibold">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal:</span>
                <span className="text-text-base">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Delivery Fee:</span>
                <span className="text-text-base">
                  {formatCurrency(order.deliveryFee)}
                </span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax:</span>
                  <span className="text-text-base">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Discount:</span>
                  <span className="text-red-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="border-border/20 border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-text-base font-semibold">Total:</span>
                  <span className="text-text-base text-lg font-bold">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <h4 className="text-text-base mb-3 font-semibold">
              Payment Information
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-text-muted text-sm">Payment Method:</span>
                <p className="text-text-base">
                  {order.paymentMethod?.replace("_", " ") || "Cash on Delivery"}
                </p>
              </div>
              <div>
                <span className="text-text-muted text-sm">Payment Status:</span>
                <Badge
                  variant={
                    order.paymentStatus === "PAID" ? "success" : "warning"
                  }
                  size="sm"
                  className="ml-2"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {order.notes && (
            <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
              <h4 className="text-text-base mb-3 font-semibold">
                Internal Notes
              </h4>
              <p className="text-text-muted">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={handlePrint}
            >
              <MdPrint className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
