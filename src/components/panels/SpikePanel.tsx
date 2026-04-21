import { spikeGroupsAtom } from "@/jotai";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import RasterSpikePlot from "../RasterSpikePlot";

// type SpikeGroup = {
//   channel: string;
//   times: number[][];
//   values: number[][];
//   durations: number[];
//   startTimes: string[];
// };

// type SpikeRow = {
//   channel: string;
//   times: number[];
//   values: number[];
//   duration: number;
//   startTime: string;
// };

type SpikeRow = {
  channel: string;
  spikeNum: number;
  startTimes: string[];
};

// const columnHelper = createColumnHelper<SpikeRow>();

// const columns = [
//   columnHelper.accessor("channel", {
//     header: "Channel",
//     cell: (info) => info.getValue(),
//   }),
//   columnHelper.accessor("duration", {
//     header: "Durations",
//     cell: (info) => info.getValue().toFixed(3),
//   }),
//   columnHelper.accessor("startTime", {
//     header: "Start Times",
//     cell: (info) => info.getValue(),
//   }),
// ];

const columnHelper = createColumnHelper<SpikeRow>();

const columns = [
  columnHelper.accessor("channel", {
    header: "Channel",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("spikeNum", {
    header: "Number of Spikes",
    cell: (info) => info.getValue(),
  }),
];

function SpikePanel() {
  const spikeGroups = useAtomValue(spikeGroupsAtom);

  // const rows = spikeGroups.map((group) => ({
  //   channel: group.channel,
  //   spikeNum: group.values.length,
  // }));

  // const rows: SpikeRow[] = spikeGroups.flatMap((group) =>
  //   group.durations.map((duration, i) => ({
  //     channel: group.channel,
  //     times: group.times[i],
  //     values: group.values[i],
  //     duration,
  //     startTime: group.startTimes[i],
  //   })),
  // );

  const rows = useMemo(() => {
    return spikeGroups.map((group) => ({
      channel: group.channel,
      spikeNum: group.values.length,
      startTimes: group.startTimes,
    }));
  }, [spikeGroups]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      {spikeGroups.length > 0 && rows ? (
        <div>
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
          <RasterSpikePlot rows={rows} />
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
