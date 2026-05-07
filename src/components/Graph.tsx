import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { FileInfo } from "@/types";
import Upload from "@/components/Upload";
import { parser } from "@/lib/parsers";
import { availableSpikeChannelsAtom, manualSpikeSelectionAtom } from "@/jotai";
import { useAtom, useSetAtom } from "jotai";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";

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

  function zoomGraph(multiplier: number) {
    const plot = plotRef.current;
    const timeData = chartData[0];

    if (!plot || !timeData || timeData.length === 0) {
      return;
    }

    const fullMin = timeData[0];
    const fullMax = timeData[timeData.length - 1];
    const currentMin =
      typeof plot.scales.x.min === "number" ? plot.scales.x.min : fullMin;
    const currentMax =
      typeof plot.scales.x.max === "number" ? plot.scales.x.max : fullMax;
    const center = (currentMin + currentMax) / 2;
    const nextRange = (currentMax - currentMin) * multiplier;
    const nextMin = Math.max(fullMin, center - nextRange / 2);
    const nextMax = Math.min(fullMax, center + nextRange / 2);

    if (nextMax > nextMin) {
      plot.setScale("x", {
        min: nextMin,
        max: nextMax,
      });
    }
  }

  function resetGraphZoom() {
    const plot = plotRef.current;
    const timeData = chartData[0];

    if (!plot || !timeData || timeData.length === 0) {
      return;
    }

    plot.setScale("x", {
      min: timeData[0],
      max: timeData[timeData.length - 1],
    });
  }

  return (
    <div className="mb-3">
      {chartData.length > 0 ? (
        <div>
          <div className="chart-shell" ref={chartRef} />
          <div className="mt-3 flex justify-center gap-2">
            <Button
              aria-label="Zoom in"
              onClick={() => zoomGraph(0.5)}
              size="sm"
              title="Zoom in"
              type="button"
            >
              <ZoomIn />
              Zoom In
            </Button>
            <Button
              aria-label="Zoom out"
              onClick={() => zoomGraph(2)}
              size="sm"
              title="Zoom out"
              type="button"
            >
              <ZoomOut />
              Zoom Out
            </Button>
            <Button
              aria-label="Reset zoom"
              onClick={resetGraphZoom}
              size="sm"
              title="Reset zoom"
              type="button"
            >
              <RotateCcw />
              Reset
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="empty-state">No data available, please upload data.</p>
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
