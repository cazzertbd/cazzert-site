import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  MdCalendarToday,
  MdLocalShipping,
  MdPayment,
  MdShoppingCart,
  MdVisibility,
} from "react-icons/md";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  itemCount: number;
  createdAt: string;
  deliveryDate?: string;
  paymentStatus: string;
}

interface OrderHistoryListProps {
  orders: OrderSummary[];
  onViewOrder: (orderNumber: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusVariant: (status: string) => string;
}

export function OrderHistoryList({
  orders,
  onViewOrder,
  formatCurrency,
  formatDate,
  getStatusVariant,
}: OrderHistoryListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return MdLocalShipping;
      case "PREPARING":
      case "READY":
        return MdShoppingCart;
      case "PAID":
        return MdPayment;
      default:
        return MdCalendarToday;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const StatusIcon = getStatusIcon(order.status);

        return (
          <div
            key={order.id}
            className="bg-bg-alt border-border/20 rounded-lg border p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Order Info */}
              <div className="flex-1">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-Secondary text-text-base text-lg font-semibold">
                      {order.orderNumber}
                    </h4>
                    <p className="text-text-muted text-sm">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="text-text-muted h-4 w-4" />
                    <Badge
                      variant={getStatusVariant(order.status) as any}
                      size="sm"
                    >
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <span className="text-text-muted text-xs">
                      Total Amount
                    </span>
                    <p className="text-text-base font-semibold">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Items</span>
                    <p className="text-text-base font-medium">
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Payment</span>
                    <p className="text-text-base font-medium">
                      <Badge
                        variant={
                          order.paymentStatus === "PAID" ? "success" : "warning"
                        }
                        size="sm"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                  {order.deliveryDate && (
                    <div>
                      <span className="text-text-muted text-xs">
                        Delivery Date
                      </span>
                      <p className="text-text-base font-medium">
                        {formatDate(order.deliveryDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewOrder(order.orderNumber)}
                  className="flex items-center gap-2"
                >
                  <MdVisibility className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
