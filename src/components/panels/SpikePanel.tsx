import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type SpikeGroup = {
  timeRange: string;
  values: number[];
};

const data: SpikeGroup[] = [
  { timeRange: "10-15", values: [23, 435, 6] },
  { timeRange: "100-120", values: [233, 5, 34346, 12] },
  { timeRange: "1000-1005", values: [233, 5] },
];

const columnHelper = createColumnHelper<SpikeGroup>();

const columns = [
  columnHelper.accessor("timeRange", {
    header: "Time range",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("values", {
    header: "Values",
    cell: (info) => info.getValue(),
  }),
];

function SpikePanel() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 overflow-x-auto">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-white">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="text-white">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SpikePanel;
