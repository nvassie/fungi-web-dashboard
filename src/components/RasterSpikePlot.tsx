import type { SpikeRow } from "@/types";
import { useMemo } from "react";
import Plot from "react-plotly.js";

interface RasterSpikePlotProps {
  rows: SpikeRow[];
}

export default function RasterSpikePlot({ rows }: RasterSpikePlotProps) {
  const plotData = useMemo(() => {
    const x = [];
    const y = [];
    const yLabels = [];
    for (let i = 0; i < rows.length; i++) {
      yLabels.push(rows[i].channel);
      for (let j = 0; j < rows[i].startTimes.length; j++) {
        y.push(i + 1 - 0.4, i + 1 + 0.4, null);
        const date = rows[i].startTimes[j];
        const iso = `2026-04-21T${date}`;
        x.push(iso, iso, null);
      }
    }
    return {
      x,
      y,
      yLabels,
    };
  }, [rows]);

  return (
    <Plot
      data={[
        {
          x: plotData.x,
          y: plotData.y,
          type: "scatter",
          mode: "lines",
          line: { width: 2, color: "black" },
          hoverinfo: "x",
        },
      ]}
      layout={{
        margin: {
          l: 110,
        },
        title: { text: "Raster Spike Plot" },
        xaxis: {
          type: "date",
          title: { text: "Time" },
          tickformat: "%H:%M:%S",
        },
        yaxis: {
          title: { text: "Channel" },
          range: [0.5, plotData.yLabels.length + 0.5],
          tickmode: "array",
          tickvals: plotData.yLabels.map((_, i) => i + 1),
          ticktext: plotData.yLabels,
          autorange: "reversed",
        },
        showlegend: false,
      }}
    />
  );
}
