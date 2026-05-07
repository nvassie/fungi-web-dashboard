import { spikeGroupsAtom } from "@/jotai";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { useMemo } from "react";
import ManualSpikeSelection from "../manualSpikeSelection";
import RasterSpikePlot from "../RasterSpikePlot";
import { Button } from "../ui/button";

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
  times: number[][];
  values: number[][];
  durations: number[];
  startTimes: string[];
};

function downloadSpikeRow(row: SpikeRow) {
  const csvRows = row.values.map((spikeValues, spikeIndex) => ({
    channel: row.channel,
    spikeIndex: spikeIndex + 1,
    duration: row.durations[spikeIndex] ?? "",
    startTime: row.startTimes[spikeIndex] ?? "",
    values: spikeValues.join(", "),
  }));

  const csv = Papa.unparse(csvRows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeChannel = row.channel.replace(/[^a-z0-9_-]+/gi, "_");

  link.href = url;
  link.download = `${safeChannel || "spike-row"}-spikes.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
  columnHelper.display({
    id: "download",
    header: "Download",
    cell: ({ row }) => (
      <Button
        aria-label={`Download ${row.original.channel} spikes as CSV`}
        disabled={row.original.spikeNum === 0}
        onClick={() => downloadSpikeRow(row.original)}
        size="sm"
        type="button"
      >
        <Download />
        CSV
      </Button>
    ),
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
      times: group.times,
      values: group.values,
      durations: group.durations,
      startTimes: group.startTimes,
    }));
  }, [spikeGroups]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="panel-surface">
      <ManualSpikeSelection />
      {spikeGroups.length > 0 && rows ? (
        <div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full min-w-md border-separate border-spacing-0 overflow-hidden rounded-lg border text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-muted">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left font-medium text-muted-foreground"
                      >
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
                  <tr key={row.id} className="border-t">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-t px-4 py-3 text-foreground"
                      >
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
          <p className="empty-state">
            No data available, please detect spikes.
          </p>
        </div>
      )}
    </div>
  );
}

export default SpikePanel;
