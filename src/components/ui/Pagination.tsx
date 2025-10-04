import { Button } from "@/components/ui/Button";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPrevPage,
  onNextPage,
  hasNextPage,
  hasPrevPage,
  disabled = false,
}: PaginationProps) {
  // Calculate range of items being shown
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (start > 1) {
        pages.unshift("...");
        pages.unshift(1);
      }

      if (end < totalPages) {
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      {/* Items info */}
      <div className="text-text-muted text-sm">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!hasPrevPage || disabled}
          className="flex items-center gap-1"
        >
          <MdChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="text-text-muted px-2 py-1">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  disabled={disabled}
                  className="min-w-[2rem]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage || disabled}
          className="flex items-center gap-1"
        >
          Next
          <MdChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
