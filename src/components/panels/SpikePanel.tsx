import { spikeGroupsAtom } from "@/jotai";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";

type SpikeGroup = {
  channel: string;
  times: number[][];
  values: number[][];
};

const columnHelper = createColumnHelper<SpikeGroup>();

const columns = [
  columnHelper.accessor("channel", {
    header: "Channel",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("times", {
    header: "Times",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("values", {
    header: "Values",
    cell: (info) => info.getValue(),
  }),
];

function SpikePanel() {
  const spikeGroups = useAtomValue(spikeGroupsAtom);

  const table = useReactTable({
    data: spikeGroups,
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
