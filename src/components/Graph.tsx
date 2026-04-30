import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { FileInfo } from "@/types";
import Upload from "@/components/Upload";
import { parser } from "@/lib/parsers";
import {
  availableSpikeChannelsAtom,
  manualSpikeSelectionAtom,
} from "@/jotai";
import { useAtom, useSetAtom } from "jotai";

interface GraphProps {
  width: number;
  height: number;
}

function Graph({ width, height }: GraphProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [fileInfo, setFileInfo] = useState<FileInfo>();
  const [loading, setLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState<number[][]>([]);
  const [graphProps, setGraphProps] = useState({});
  const headerColours = [
    "white",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "cyan",
    "pink",
  ];
  const [headers, setHeaders] = useState<string[]>([]);
  const [manualSelection, setManualSelection] = useAtom(
    manualSpikeSelectionAtom,
  );
  const setAvailableSpikeChannels = useSetAtom(availableSpikeChannelsAtom);

  useEffect(() => {
    if (fileContent && fileInfo) {
      const columns = parser(fileContent, fileInfo, headers, setHeaders);

      setChartData(columns);
      setLoading(false);

      const headersWithNoTime = headers.slice(1);
      setAvailableSpikeChannels((currentChannels) =>
        Array.from(new Set([...currentChannels, ...headersWithNoTime])),
      );

      const tempHeaderSeries = headersWithNoTime.map((header, index) => ({
        label: header,
        stroke: headerColours[index],
        width: 2,
      }));

      const tempAxes = {
        stroke: "white",
        font: "12px Arial",
        grid: { stroke: "#444" },
        label: headersWithNoTime[0],
        labelFont: "14px Arial",
      };

      setGraphProps({
        width: width - 10,
        height: height * 0.6,
        series: [{}, ...tempHeaderSeries],
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
          tempAxes,
        ],
        cursor: {
          sync: {
            key: "test",
          },
        },
      });
    }
  }, [fileContent, fileInfo, height, width]);

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
      width: width - 10,
      height: height * 0.6,
    };
    plotRef.current?.setSize(temp);
  }, [width, height]);

  useEffect(() => {
    const plot = plotRef.current;

    if (!plot || !manualSelection.enabled) {
      return;
    }

    const activePlot = plot;

    function handleGraphClick(event: MouseEvent) {
      const bounds = activePlot.over.getBoundingClientRect();
      const xPosition = event.clientX - bounds.left;
      const clickedTime = activePlot.posToVal(xPosition, "x");

      setManualSelection((currentSelection) => {
        if (
          currentSelection.startTime === undefined ||
          currentSelection.endTime !== undefined
        ) {
          return {
            enabled: true,
            startTime: clickedTime,
          };
        }

        const startTime = Math.min(currentSelection.startTime, clickedTime);
        const endTime = Math.max(currentSelection.startTime, clickedTime);

        return {
          enabled: true,
          startTime,
          endTime,
        };
      });
    }

    activePlot.over.addEventListener("click", handleGraphClick);

    return () => {
      activePlot.over.removeEventListener("click", handleGraphClick);
    };
  }, [manualSelection.enabled, setManualSelection]);

  return (
    <div className="mb-3">
      {chartData.length > 0 ? (
        <div className="text-white" ref={chartRef} />
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
            setHeaders={setHeaders}
          />
        </div>
      )}
    </div>
  );
}

export default Graph;
