import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  colSpan?: number;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  colSpan?: number;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="bg-bg-alt border-border/20 overflow-hidden rounded-xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className={`w-full table-auto ${className}`}>{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-bg border-border/20 border-b ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({
  children,
  className = "",
  hover = true,
}: TableRowProps) {
  return (
    <tr
      className={`border-border/20 border-b transition-colors last:border-b-0 ${
        hover ? "hover:bg-bg/50" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
  align = "center",
  colSpan,
}: TableHeadProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th
      className={`text-text-base px-4 py-3 text-sm font-semibold ${alignClasses[align]} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  align = "left",
  colSpan,
}: TableCellProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={`text-text-muted px-4 py-3 text-sm ${alignClasses[align]} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}
