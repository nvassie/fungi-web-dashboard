import { useEffect, useMemo, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { Button } from "../ui/button";
import { useAtom, useSetAtom } from "jotai";
import {
  availableSpikeChannelsAtom,
  graphIdsAtom,
  manualSpikeSelectionAtom,
  spikeGroupsAtom,
  userSpikeFunctionsAtom,
} from "@/jotai";
import type { IDockviewPanelProps } from "dockview";
import Graph from "@/components/Graph";
import { v4 as uuidv4 } from "uuid";
import type { FileInfo } from "@/types";
import Upload from "@/components/Upload";
import { buildManualSpikeGraphData } from "@/lib/manualSpikeGraph";
import { parser } from "@/lib/parsers";
import { detectSpikesRolling } from "@/lib/spikes";
import { toUnixTimestamp } from "@/lib/time";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { wrap } from "comlink";

interface GraphProps {
  props: IDockviewPanelProps;
  width: number;
  height: number;
}

export default function GraphPanel({ props, width, height }: GraphProps) {
  const [chartData, setChartData] = useState<number[][]>([]);
  const [detectedSpikeData, setDetectedSpikeData] = useState<number[][]>([]);
  const [toggleSpikes, setToggleSpikes] = useState(false);
  const [graphProps, setGraphProps] = useState({});
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [fileInfo, setFileInfo] = useState<FileInfo>();
  const [loading, setLoading] = useState<boolean>(false);
  // const headers = [
  // "Time (seconds)",
  // "Pack 0 probe 1",
  // "Pack 0 probe 2",
  // "Pack 1 probe 1",
  // "Pack 1 probe 2",
  // "Pack 2 probe 1",
  // "Pack 2 probe 2",
  // "Pack 3 probe 1",
  // "Pack 3 probe 2",
  // ];
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
  const [headerSeries, setHeaderSeries] = useState<any[]>([]);
  const [graphIds, setGraphIds] = useAtom(graphIdsAtom);
  const [spikeGroups, setSpikeGroups] = useAtom(spikeGroupsAtom);
  const [userSpikeFunctions, setSpikeUserFunctions] = useAtom(
    userSpikeFunctionsAtom,
  );
  const [manualSelection, setManualSelection] = useAtom(
    manualSpikeSelectionAtom,
  );
  const setAvailableSpikeChannels = useSetAtom(availableSpikeChannelsAtom);
  const [detectionFunction, setDetectionFunction] = useState<string>("default");
  const codeworker = new Worker(
    new URL("../../workers/userSpikeFunctionWorker.ts", import.meta.url),
    {
      type: "module",
    },
  );
  const codeRunner = wrap(codeworker);
  const spikeWorker = new Worker(
    new URL("../../workers/spikeGroupWorker.ts", import.meta.url),
    {
      type: "module",
    },
  );
  const spikeRunner = wrap(spikeWorker);
  const manualSpikeGraphData = useMemo(
    () => buildManualSpikeGraphData(chartData, headers, spikeGroups),
    [chartData, headers, spikeGroups],
  );
  const visibleChartData = useMemo(
    () => [...chartData, ...detectedSpikeData, ...manualSpikeGraphData.data],
    [chartData, detectedSpikeData, manualSpikeGraphData.data],
  );
  const visibleGraphProps = useMemo(() => {
    const series =
      "series" in graphProps
        ? (graphProps.series as { label?: string; stroke?: string; width?: number }[])
        : [];

    return {
      ...graphProps,
      series: [...series, ...manualSpikeGraphData.series],
    };
  }, [graphProps, manualSpikeGraphData.series]);

  useEffect(() => {
    if (fileContent && fileInfo && headers) {
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

      setHeaderSeries(tempHeaderSeries);

      setGraphProps({
        width: props.api.width - 10,
        height: props.api.height * 0.6,
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
          {
            stroke: "white",
            font: "12px Arial",
            grid: { stroke: "#444" },
            label: "Voltage",
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
    if (toggleSpikes && headerSeries) {
      const detectSpikes = async () => {
        const spikesArray: number[][] = [];
        const filteredArray: number[][] = [];
        for (let i = 1; i < chartData.length; i++) {
          if (chartData[i].length > 0) {
            const workerResult = await userCode(
              detectionFunction,
              chartData[i],
            );
            spikesArray.push(workerResult.spike);
            filteredArray.push(workerResult.filtered);
          }
        }
        for (let j = 0; j < spikesArray.length; j++) {
          if (spikesArray[j].length > 0) {
            const workerResult = await spikeRunner.groupSpikes(
              headers[j + 1],
              spikesArray[j],
              chartData[j + 1],
              fileInfo,
            );
            setSpikeGroups((prev) => [...prev, workerResult]);
          }
        }

        const spikeHeaderSeries = headerSeries.map((series) => ({
          label: `${series.label} spikes`,
          stroke: "orange",
          width: 5,
        }));

        setGraphProps((prev) => ({
          ...prev,
          series: [{}, ...headerSeries, ...spikeHeaderSeries],
        }));
        setDetectedSpikeData(filteredArray);
      };

      detectSpikes();
    }
  }, [toggleSpikes]);

  useEffect(() => {
    if (!chartRef.current) return;

    plotRef.current = new uPlot(
      visibleGraphProps as uPlot.Options,
      visibleChartData as uPlot.AlignedData,
      chartRef.current,
    );

    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [visibleChartData, visibleGraphProps]);

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

  async function userCode(functionName: string, input: number[]) {
    try {
      const code = userSpikeFunctions.find(
        (func) => func.name === functionName,
      ).code;
      const output = await codeRunner.runCode(code, input);
      return output;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  return (
    <div className="h-[calc(100%-55px)] min-h-0 overflow-y-auto overflow-x-hidden">
      {chartData.length > 0 ? (
        <div>
          <div>
            <div className="text-white" ref={chartRef} />
            <div className="flex gap-3 justify-center mt-3">
              <Select
                value={detectionFunction}
                onValueChange={setDetectionFunction}
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="Select function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Spike Detection Functions</SelectLabel>
                    {userSpikeFunctions.map((func) => (
                      <SelectItem value={func.name}>{func.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setToggleSpikes((prev) => !prev);
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
              <Button
                onClick={() => {
                  setChartData([]);
                  setDetectedSpikeData([]);
                  setGraphProps({});
                  setFileContent();
                  setFileInfo();
                  setToggleSpikes(false);
                  setDetectionFunction("default");
                  setLoading(false);
                  setGraphIds([]);
                  setAvailableSpikeChannels([]);
                  setManualSelection({ enabled: false });
                  chartRef.current = null;
                  plotRef.current = null;
                }}
                className="text-black"
              >
                Clear Data
              </Button>
            </div>
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
            setHeaders={setHeaders}
          />
        </div>
      )}
    </div>
  );
}
