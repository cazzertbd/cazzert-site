import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdCancel,
  MdEdit,
  MdFilterList,
  MdRefresh,
  MdSearch,
  MdVisibility,
} from "react-icons/md";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderFilters } from "./OrderFilters";
import { OrderStatusModal } from "./OrderStatusModal";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  createdAt: string;
  deliveryDate?: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const itemsPerPage = 10;

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Actions
  const { execute: getOrders, isPending: isLoadingOrders } = useAstroAction(
    actions.orders.getAll,
  );
  const { execute: getStatistics, isPending: isLoadingStats } = useAstroAction(
    actions.orders.getStatistics,
  );
  const { execute: updateOrderStatus } = useAstroAction(
    actions.orders.updateStatus,
  );
  const { execute: cancelOrder, isPending: isCancelling } = useAstroAction(
    actions.orders.cancel,
  );

  // Load initial data
  useEffect(() => {
    loadOrders();
    loadStatistics();
  }, [currentPage, selectedStatus]);

  const loadOrders = async () => {
    try {
      const result = await getOrders({
        page: currentPage,
        limit: itemsPerPage,
        status: selectedStatus || undefined,
      });

      if (result.success) {
        setOrders(result.data.orders);
        const pagination = result.data.pagination;
        setTotalPages(pagination.totalPages);
        setTotalCount(pagination.totalCount);
        setHasNextPage(pagination.hasNextPage);
        setHasPrevPage(pagination.hasPrevPage);
      } else {
        toast.error(result.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await getStatistics({});
      if (result.success) {
        setStatistics(result.data);
      } else {
        console.error("Failed to fetch statistics:", result.error);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: string,
    notes?: string,
    estimatedReady?: string,
  ) => {
    try {
      const result = await updateOrderStatus({
        orderId,
        status: newStatus as any,
        notes,
        estimatedReady,
      });

      if (result.success) {
        toast.success(result.message || "Order status updated successfully");
        await loadOrders();
        await loadStatistics();
        setShowStatusModal(false);
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const result = await cancelOrder({ orderId });
      if (result.success) {
        toast.success(result.message || "Order cancelled successfully");
        await loadOrders();
        await loadStatistics();
      } else {
        toast.error(result.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoading = isLoadingOrders || isLoadingStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-Secondary text-text-base text-3xl font-bold">
            Order Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Button
          onClick={() => {
            loadOrders();
            loadStatistics();
          }}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <MdRefresh className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <div className="text-text-muted text-sm font-medium">
              Total Orders
            </div>
            <div className="text-text-base mt-1 text-2xl font-bold">
              {statistics.totalOrders}
            </div>
          </div>
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <div className="text-text-muted text-sm font-medium">Pending</div>
            <div className="mt-1 text-2xl font-bold text-yellow-600">
              {statistics.pendingOrders}
            </div>
          </div>
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <div className="text-text-muted text-sm font-medium">Confirmed</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {statistics.confirmedOrders}
            </div>
          </div>
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <div className="text-text-muted text-sm font-medium">Preparing</div>
            <div className="mt-1 text-2xl font-bold text-purple-600">
              {statistics.preparingOrders}
            </div>
          </div>
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <div className="text-text-muted text-sm font-medium">Completed</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {statistics.completedOrders}
            </div>
          </div>
          <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
            <div className="text-text-muted text-sm font-medium">
              Total Revenue
            </div>
            <div className="text-text-base mt-1 text-2xl font-bold">
              {formatCurrency(statistics.totalRevenue)}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-bg-alt border-border/20 rounded-lg border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <MdSearch className="text-text-muted absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-text-base bg-bg border-border focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <MdFilterList className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border-border/20 mt-4 border-t pt-4">
            <OrderFilters
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onReset={() => {
                setSelectedStatus("");
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead align="left">Order</TableHead>
              <TableHead align="left">Customer</TableHead>
              <TableHead align="center">Status</TableHead>
              <TableHead align="center">Items</TableHead>
              <TableHead align="right">Total</TableHead>
              <TableHead align="center">Date</TableHead>
              <TableHead align="center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingOrders ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="flex items-center justify-center">
                    <MdRefresh className="mr-2 h-6 w-6 animate-spin" />
                    Loading orders...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="text-text-muted">
                    {searchTerm
                      ? "No orders found matching your search"
                      : "No orders found"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="text-text-base font-medium">
                        {order.orderNumber}
                      </div>
                      {order.deliveryDate && (
                        <div className="text-text-muted text-xs">
                          Delivery: {formatDate(order.deliveryDate)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-text-base font-medium">
                        {order.customerName}
                      </div>
                      <div className="text-text-muted text-xs">
                        {order.customerEmail}
                      </div>
                      {order.customerPhone && (
                        <div className="text-text-muted text-xs">
                          {order.customerPhone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Badge
                      variant={getStatusBadgeVariant(order.status) as any}
                      size="sm"
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <span className="text-text-base font-medium">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span className="text-text-base font-semibold">
                      {formatCurrency(order.total)}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <span className="text-text-muted text-xs">
                      {formatDate(order.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        onClick={() => {
                          setSelectedOrder({
                            id: order.id,
                            orderNumber: order.orderNumber,
                          });
                          setShowDetailsModal(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <MdVisibility className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        iconOnly
                        size="sm"
                        onClick={() => {
                          setSelectedOrder({
                            id: order.id,
                            orderNumber: order.orderNumber,
                          });
                          setShowStatusModal(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <MdEdit className="h-4 w-4" />
                      </Button>
                      {["PENDING", "CONFIRMED"].includes(order.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          onClick={() => handleCancelOrder(order.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          disabled={isCancelling}
                        >
                          <MdCancel className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onPrevPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
            onNextPage={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            disabled={isLoadingOrders}
          />
        )}
      </div>

      {/* Modals */}
      {selectedOrder && (
        <>
          <OrderDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedOrder(null);
            }}
            orderNumber={selectedOrder.orderNumber}
          />
          <OrderStatusModal
            isOpen={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedOrder(null);
            }}
            orderId={selectedOrder.id}
            onStatusUpdate={handleStatusUpdate}
          />
        </>
      )}
    </div>
  );
}
