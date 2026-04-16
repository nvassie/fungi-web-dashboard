import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { Button } from "../ui/button";
import { useAtom } from "jotai";
import { graphIdsAtom, spikeGroupsAtom } from "@/jotai";
import type { IDockviewPanelProps } from "dockview";
import Graph from "@/components/Graph";
import { v4 as uuidv4 } from "uuid";
import type { FileInfo } from "@/types";
import Upload from "@/components/Upload";
import { parser } from "@/lib/parsers";
import { detectSpikesRolling } from "@/lib/spikes";

interface GraphProps {
  props: IDockviewPanelProps;
  width: number;
  height: number;
}

export default function GraphPanel({ props, width, height }: GraphProps) {
  const [chartData, setChartData] = useState<number[][]>([]);
  const [toggleSpikes, setToggleSpikes] = useState(false);
  const [graphProps, setGraphProps] = useState({});
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [fileInfo, setFileInfo] = useState<FileInfo>();
  const [loading, setLoading] = useState<boolean>(false);
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
  const [graphIds, setGraphIds] = useAtom(graphIdsAtom);
  const [spikeGroups, setSpikeGroups] = useAtom(spikeGroupsAtom);

  useEffect(() => {
    if (fileContent && fileInfo) {
      const columns = parser(fileContent, fileInfo, headers);

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
        cursor: {
          sync: {
            key: "test",
          },
        },
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
      const tempSpikeGroups: number[][] = [];
      let currentGroup: number[] = [];
      for (let i = 0; i < spikes1.length; i += 1) {
        if (i != 0) {
          if (spikes1[i] === spikes1[i - 1] + 1) {
            if (currentGroup.length === 0) {
              currentGroup.push(spikes1[i - 1]);
            }
            currentGroup.push(spikes1[i]);
          } else if (currentGroup.length !== 0) {
            tempSpikeGroups.push(currentGroup);
            currentGroup = [];
          }
        }
      }
      const spikeGroupValues = tempSpikeGroups.map((group) =>
        group.map((idx) => chartData[1][idx]),
      );
      const temp = {
        channel: "Pack 0 probe 2",
        times: tempSpikeGroups,
        values: spikeGroupValues,
      };
      setSpikeGroups((prev) => [...prev, temp]);
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
    <div className="h-full min-h-0 overflow-auto">
      {chartData.length > 0 ? (
        <div>
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
            <Button
              onClick={() => {
                setGraphIds((prev) => [...prev, uuidv4()]);
              }}
              className="text-black"
            >
              Add graph
            </Button>
          </div>
          {graphIds.map((id) => (
            <Graph key={id} width={width} height={height} />
          ))}
        </div>
      ) : (
        <div>
          <p className="pt-20 text-white">
            No data available, please upload data.
          </p>
          <Upload
            fileInfo={fileInfo}
            setFileInfo={setFileInfo}
            setFileContent={setFileContent}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </div>
  );
}
