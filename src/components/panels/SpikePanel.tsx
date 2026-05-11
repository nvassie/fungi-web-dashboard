import { graphPanelsAtom, spikeGroupsByGraphPanelAtom } from "@/jotai";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { IDockviewPanelProps } from "dockview";
import { useAtom, useAtomValue } from "jotai";
import { Download, Trash2 } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import ManualSpikeSelection from "../ManualSpikeSelection";
import RasterSpikePlot from "../RasterSpikePlot";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type SpikeRow = {
  channel: string;
  spikeNum: number;
  times: number[][];
  values: number[][];
  durations: number[];
  startTimes: string[];
};

type SpikeDetailRow = {
  channel: string;
  duration: number;
  groupIndex: number;
  isManual: boolean;
  spikeIndex: number;
  startTime: string;
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

function SpikePanel({ props }: { props: IDockviewPanelProps }) {
  const graphPanels = useAtomValue(graphPanelsAtom);
  const [selectedGraphPanelId, setSelectedGraphPanelId] = useState("");
  const [spikeGroupsByGraphPanel, setSpikeGroupsByGraphPanel] = useAtom(
    spikeGroupsByGraphPanelAtom,
  );
  const spikeGroups = useMemo(
    () => spikeGroupsByGraphPanel[selectedGraphPanelId] ?? [],
    [selectedGraphPanelId, spikeGroupsByGraphPanel],
  );

  useEffect(() => {
    if (!selectedGraphPanelId && graphPanels.length > 0) {
      setSelectedGraphPanelId(graphPanels[0].id);
      return;
    }

    if (
      selectedGraphPanelId &&
      graphPanels.length > 0 &&
      !graphPanels.some((panel) => panel.id === selectedGraphPanelId)
    ) {
      setSelectedGraphPanelId(graphPanels[0].id);
    }
  }, [graphPanels, selectedGraphPanelId, setSelectedGraphPanelId]);

  useEffect(() => {
    if (!selectedGraphPanelId) {
      return;
    }

    props.api.setTitle(`Spike ${selectedGraphPanelId.slice(0, 5)}`);
  }, [props.api, selectedGraphPanelId]);

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

  const spikeDetailRows = useMemo<SpikeDetailRow[]>(() => {
    return spikeGroups.flatMap((group, groupIndex) =>
      group.startTimes.map((startTime, spikeIndex) => ({
        channel: group.channel,
        duration: group.durations[spikeIndex] ?? 0,
        groupIndex,
        isManual:
          group.values[spikeIndex]?.length === 0 &&
          group.times[spikeIndex]?.length === 2,
        spikeIndex,
        startTime,
      })),
    );
  }, [spikeGroups]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function deleteSpike(groupIndex: number, spikeIndex: number) {
    setSpikeGroupsByGraphPanel((currentGroupsByPanel) => {
      const currentGroups = currentGroupsByPanel[selectedGraphPanelId] ?? [];
      const nextSelectedGroups = currentGroups
        .map((group, currentGroupIndex) => {
          if (currentGroupIndex !== groupIndex) {
            return group;
          }

          return {
            ...group,
            durations: group.durations.filter(
              (_, currentSpikeIndex) => currentSpikeIndex !== spikeIndex,
            ),
            startTimes: group.startTimes.filter(
              (_, currentSpikeIndex) => currentSpikeIndex !== spikeIndex,
            ),
            times: group.times.filter(
              (_, currentSpikeIndex) => currentSpikeIndex !== spikeIndex,
            ),
            values: group.values.filter(
              (_, currentSpikeIndex) => currentSpikeIndex !== spikeIndex,
            ),
          };
        })
        .filter((group) => group.values.length > 0);

      return {
        ...currentGroupsByPanel,
        [selectedGraphPanelId]: nextSelectedGroups,
      };
    });
  }

  return (
    <div className="panel-surface">
      <section className="border-b bg-card/40 p-4 text-card-foreground">
        <div className="grid max-w-64 gap-1">
          <label className="text-sm font-medium" htmlFor="spike-graph-panel">
            Graph panel
          </label>
          <Select
            disabled={graphPanels.length === 0}
            onValueChange={setSelectedGraphPanelId}
            value={selectedGraphPanelId}
          >
            <SelectTrigger id="spike-graph-panel">
              <SelectValue placeholder="Select graph" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Graph Panels</SelectLabel>
                {graphPanels.map((panel) => (
                  <SelectItem key={panel.id} value={panel.id}>
                    {panel.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </section>
      <ManualSpikeSelection selectedGraphPanelId={selectedGraphPanelId} />
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
          <div className="p-4 pt-0 overflow-x-auto">
            <h2 className="mb-3 text-sm font-semibold">Individual Spikes</h2>
            <table className="w-full min-w-md border-separate border-spacing-0 overflow-hidden rounded-lg border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Start Time
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {spikeDetailRows.map((spike) => (
                  <tr
                    key={`${spike.channel}-${spike.groupIndex}-${spike.spikeIndex}`}
                  >
                    <td className="border-t px-4 py-3 text-foreground">
                      {spike.channel}
                    </td>
                    <td className="border-t px-4 py-3 text-foreground">
                      {spike.isManual ? "Manual" : "Automatic"}
                    </td>
                    <td className="border-t px-4 py-3 text-foreground">
                      {spike.startTime}
                    </td>
                    <td className="border-t px-4 py-3 text-foreground">
                      {spike.duration.toFixed(3)}s
                    </td>
                    <td className="border-t px-4 py-3 text-foreground">
                      <Button
                        aria-label={`Delete ${spike.channel} ${spike.startTime} spike`}
                        onClick={() =>
                          deleteSpike(spike.groupIndex, spike.spikeIndex)
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </td>
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
