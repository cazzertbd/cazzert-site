import { Button } from "@/components/ui/Button";
import { MdAdd, MdDelete } from "react-icons/md";

interface DetailsListProps {
  details: string[];
  newDetail: string;
  onNewDetailChange: (value: string) => void;
  onAddDetail: () => void;
  onRemoveDetail: (index: number) => void;
  disabled?: boolean;
}

export function DetailsList({
  details,
  newDetail,
  onNewDetailChange,
  onAddDetail,
  onRemoveDetail,
  disabled = false,
}: DetailsListProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddDetail();
    }
  };

  return (
    <div className="space-y-3">
      {details.map((detail, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="border-border/20 bg-bg flex-1 rounded border px-4 py-2 text-sm">
            {detail}
          </span>
          <button
            type="button"
            onClick={() => onRemoveDetail(index)}
            className="rounded p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            disabled={disabled}
          >
            <MdDelete className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex gap-3">
        <input
          type="text"
          value={newDetail}
          onChange={(e) => onNewDetailChange(e.target.value)}
          placeholder="Add a detail..."
          disabled={disabled}
          className="border-border/20 focus:border-primary focus:ring-primary/30 flex-1 rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          onClick={onAddDetail}
          variant="outline"
          size="sm"
          disabled={!newDetail.trim() || disabled}
          className="px-4 py-3"
        >
          <MdAdd className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
