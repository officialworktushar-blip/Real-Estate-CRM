import { ReactNode } from "react";

interface DataTableProps<T> {
  data: T[];
  columns: { key: string; label: string; render?: (item: T) => ReactNode }[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({ data, columns, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={i}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50 border-b border-gray-100" : "border-b border-gray-100"}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(item) : String(item[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
