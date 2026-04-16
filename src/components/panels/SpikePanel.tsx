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
  durations: number[];
  startTimes: string[];
};

type SpikeRow = {
  channel: string;
  times: number[];
  values: number[];
  duration: number;
  startTime: string;
};

const columnHelper = createColumnHelper<SpikeRow>();

const columns = [
  columnHelper.accessor("channel", {
    header: "Channel",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("duration", {
    header: "Durations",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("startTime", {
    header: "Start Times",
    cell: (info) => info.getValue(),
  }),
];

function SpikePanel() {
  const spikeGroups = useAtomValue(spikeGroupsAtom);

  const rows: SpikeRow[] = spikeGroups.flatMap((group) =>
    group.durations.map((duration, i) => ({
      channel: group.channel,
      times: group.times[i],
      values: group.values[i],
      duration,
      startTime: group.startTimes[i],
    })),
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      {spikeGroups.length > 0 ? (
        <div className="p-4 overflow-x-auto">
          <table className="border-separate border-spacing-x-4">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <p className="pt-20 text-white">
            No data available, please detect spikes.
          </p>
        </div>
      )}
    </div>
  );
}

export default SpikePanel;
