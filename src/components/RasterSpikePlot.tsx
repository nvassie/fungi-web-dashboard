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
    <div className="mb-3">
      <Plot
        data={[
          {
            x: plotData.x,
            y: plotData.y,
            type: "scatter",
            mode: "lines",
            line: { width: 2, color: "#65d6b4" },
            hoverinfo: "x",
          },
        ]}
        layout={{
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            color: "#f1f5f9",
          },
          margin: {
            l: 110,
            r: 24,
            t: 48,
            b: 48,
          },
          title: { text: "Raster Spike Plot", font: { color: "#f1f5f9" } },
          xaxis: {
            type: "date",
            title: { text: "Time" },
            tickformat: "%H:%M:%S",
            gridcolor: "rgba(255,255,255,0.12)",
            linecolor: "rgba(255,255,255,0.18)",
            zerolinecolor: "rgba(255,255,255,0.18)",
          },
          yaxis: {
            title: { text: "Channel" },
            range: [0.5, plotData.yLabels.length + 0.5],
            tickmode: "array",
            tickvals: plotData.yLabels.map((_, i) => i + 1),
            ticktext: plotData.yLabels,
            autorange: "reversed",
            gridcolor: "rgba(255,255,255,0.12)",
            linecolor: "rgba(255,255,255,0.18)",
            zerolinecolor: "rgba(255,255,255,0.18)",
          },
          showlegend: false,
        }}
        className="w-full"
        config={{
          displayModeBar: true,
          responsive: true,
        }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
