// Chart.tsx
import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { Button } from "../ui/button";
import { useAtomValue, useSetAtom } from "jotai";
import { fileInfoAtom, fileContentAtom, loadingAtom } from "@/jotai";
import type { IDockviewPanelProps } from "dockview";

interface GraphProps {
  props: IDockviewPanelProps;
  width: number;
  height: number;
}

function toUnixTimestamp(date: string, time: string) {
  const [yy, mm, dd] = date.split("-");
  const hh = time.slice(0, 2);
  const min = time.slice(2, 4);

  const newDate = new Date(`20${yy}-${mm}-${dd}T${hh}:${min}:00Z`);
  return Math.floor(newDate.getTime() / 1000);
}

function detectSpikesRolling(data: number[], window = 5, threshold = 3) {
  const spikes = [];
  for (let i = window; i < data.length; i++) {
    const slice = data.slice(i - window, i);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const std = Math.sqrt(
      slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length,
    );
    if (Math.abs(data[i] - mean) > threshold * std) {
      spikes.push(i);
    }
  }
  return spikes;
}

export default function Graph({ props, width, height }: GraphProps) {
  const [chartData, setChartData] = useState<number[][]>([]);
  const [toggleSpikes, setToggleSpikes] = useState(false);
  const [graphProps, setGraphProps] = useState({});
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const fileContent = useAtomValue(fileContentAtom);
  const fileInfo = useAtomValue(fileInfoAtom);
  const setLoading = useSetAtom(loadingAtom);
  const headers = [
    "Time (seconds)",
    "Pack 0 probe 1",
    "Pack 0 probe 2",
    "Pack 1 probe 1",
    "Pack 1 probe 2",
    "Pack 2 probe 1",
    "Pack 2 probe 2",
    "Pack 3 probe 1",
    "Pack 3 probe 2",
  ];

  useEffect(() => {
    if (fileContent) {
      const columns: number[][] = [];
      const lines = fileContent.split(/\r?\n/);

      headers.forEach(() => {
        columns.push([]);
      });

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].trim().split(/\s+/);

        values.forEach((value, index) => {
          columns[index].push(Number(value));
        });
      }

      let t = 0;
      const intervalData = columns[0];

      if (fileInfo?.date && fileInfo?.startTime) {
        const unixTime = toUnixTimestamp(fileInfo?.date, fileInfo?.startTime);
        t = unixTime;
      }

      const times = intervalData.map((delta) => (t += delta));
      columns[0] = times;

      setChartData(columns);
      setLoading(false);

      setGraphProps({
        width: props.api.width,
        height: props.api.height * 0.6,
        series: [
          {},
          { label: "Pack 0 probe 1", stroke: "white", width: 2 },
          { label: "Pack 0 probe 2", stroke: "white", width: 2 },
          { label: "Pack 1 probe 1", stroke: "blue", width: 2 },
          { label: "Pack 1 probe 2", stroke: "blue", width: 2 },
          { label: "Pack 2 probe 1", stroke: "green", width: 2 },
          { label: "Pack 2 probe 2", stroke: "green", width: 2 },
          { label: "Pack 3 probe 1", stroke: "red", width: 2 },
          { label: "Pack 3 probe 2", stroke: "red", width: 2 },
        ],
        axes: [
          {
            stroke: "white",
            font: "12px Arial",
            grid: { stroke: "#444" },
            values: (u, ticks) =>
              ticks.map((t) => new Date(t * 1000).toLocaleTimeString()),
            label: "Time",
            labelFont: "14px Arial",
          },
          {
            stroke: "white",
            font: "12px Arial",
            grid: { stroke: "#444" },
            label: "ADC Values",
            labelFont: "14px Arial",
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fileContent,
    fileInfo?.date,
    fileInfo?.startTime,
    props.api.height,
    props.api.width,
  ]);

  useEffect(() => {
    if (chartData[1] !== undefined && chartData[2] !== undefined) {
      const spikes1 = detectSpikesRolling(chartData[1], 2000, 2.5);
      const filteredSpikes = chartData[1].filter((item, i) =>
        spikes1.includes(i),
      );
      const filtered1 = chartData[1].map((item, i) =>
        spikes1.includes(i) ? item : null,
      );
      const spikes2 = detectSpikesRolling(chartData[2], 2000, 2.5);
      const filtered2 = chartData[2].map((item, i) =>
        spikes2.includes(i) ? item : null,
      );
      setGraphProps((prev) => ({
        ...prev,
        series: [
          {},
          { label: "Pack 0 probe 2", stroke: "white", width: 2 },
          { label: "Pack 0 probe 1", stroke: "white", width: 2 },
          { label: "Pack 1 probe 1", stroke: "blue", width: 2 },
          { label: "Pack 1 probe 2", stroke: "blue", width: 2 },
          { label: "Pack 2 probe 1", stroke: "green", width: 2 },
          { label: "Pack 2 probe 2", stroke: "green", width: 2 },
          { label: "Pack 3 probe 1", stroke: "red", width: 2 },
          { label: "Pack 3 probe 2", stroke: "red", width: 2 },
          { label: "Pack 0 probe 2 Spikes", stroke: "orange", width: 5 },
          { label: "Pack 0 probe 1 Spikes", stroke: "orange", width: 5 },
        ],
      }));
      const spikeGroups: number[][] = [];
      let currentGroup: number[] = [];
      for (let i = 0; i < spikes1.length; i += 1) {
        if (i != 0) {
          if (spikes1[i] === spikes1[i - 1] + 1) {
            if (currentGroup.length === 0) {
              currentGroup.push(spikes1[i - 1]);
            }
            currentGroup.push(spikes1[i]);
          } else if (currentGroup.length !== 0) {
            spikeGroups.push(currentGroup);
            currentGroup = [];
          }
        }
      }
      setChartData([...chartData, filtered1, filtered2]);
    }
  }, [toggleSpikes]);

  useEffect(() => {
    if (!chartRef.current) return;

    plotRef.current = new uPlot(graphProps, chartData, chartRef.current);

    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [chartData, graphProps]);

  useEffect(() => {
    const temp = {
      width: width,
      height: height * 0.6,
    };
    plotRef.current?.setSize(temp);
  }, [width, height]);

  return (
    <div>
      {chartData.length > 0 ? (
        <div>
          <div className="text-white" ref={chartRef} />
          <Button
            onClick={() => {
              setToggleSpikes(true);
            }}
            className="text-black"
          >
            Detect Spikes
          </Button>
        </div>
      ) : (
        <div>
          <p className="pt-20 text-white">
            No data available, please upload data.
          </p>
        </div>
      )}
    </div>
  );
}
