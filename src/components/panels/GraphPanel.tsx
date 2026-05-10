import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { Button } from "../ui/button";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  availableSpikeChannelsAtom,
  graphIdsAtom,
  manualSpikeSelectionAtom,
  spikeGroupsAtom,
  userCustomFunctionGroupsAtom,
  userCustomFunctionsRunOrderAtom,
  userSpikeFunctionsAtom,
} from "@/jotai";
import type { IDockviewPanelProps } from "dockview";
import Graph from "@/components/Graph";
import { v4 as uuidv4 } from "uuid";
import type { FileInfo } from "@/types";
import Upload from "@/components/Upload";
import {
  buildAutomaticSpikeGraphData,
  buildManualSpikeGraphData,
} from "@/lib/ManualSpikeGraph";
import { parser } from "@/lib/parsers";
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

type GraphSeries = {
  label: string;
  stroke: string;
  width: number;
};

type SpikeGroup = {
  channel: string;
  times: number[][];
  values: number[][];
  durations: number[];
  startTimes: string[];
};

type SpikeDetectionResult = {
  spike: number[];
  filtered?: (number | null)[];
};

type CodeRunner = {
  runCode: (code: string, input: number[]) => Promise<SpikeDetectionResult>;
};

type SpikeRunner = {
  groupSpikes: (
    channel: string,
    spikes: number[],
    originalData: number[],
    fileInfo: FileInfo,
  ) => Promise<SpikeGroup>;
};

type CustomFunctionRunner = {
  runFunction: (functions: string[], input: number[][]) => Promise<number[][]>;
};

export default function GraphPanel({ props, width, height }: GraphProps) {
  const [chartData, setChartData] = useState<number[][]>([]);
  const [toggleSpikes, setToggleSpikes] = useState(false);
  const [graphProps, setGraphProps] = useState<Partial<uPlot.Options>>({});
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [fileInfo, setFileInfo] = useState<FileInfo>();
  const [loading, setLoading] = useState<boolean>(false);
  const [runCustomFunctions, setRunCustomFunctions] = useState(false);
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
  const [headerSeries, setHeaderSeries] = useState<GraphSeries[]>([]);
  const [graphIds, setGraphIds] = useAtom(graphIdsAtom);
  const [spikeGroups, setSpikeGroups] = useAtom(spikeGroupsAtom);
  const userSpikeFunctions = useAtomValue(userSpikeFunctionsAtom);
  const [manualSelection, setManualSelection] = useAtom(
    manualSpikeSelectionAtom,
  );
  const setAvailableSpikeChannels = useSetAtom(availableSpikeChannelsAtom);
  const userCustomFunctionGroups = useAtomValue(userCustomFunctionGroupsAtom);
  const userCustomFunctionsRunOrder = useAtomValue(
    userCustomFunctionsRunOrderAtom,
  );
  const [detectionFunction, setDetectionFunction] = useState<string>("default");
  const codeWorker = useMemo(
    () =>
      new Worker(
        new URL("../../workers/userSpikeFunctionWorker.ts", import.meta.url),
        {
          type: "module",
        },
      ),
    [],
  );
  const codeRunner = useMemo(() => wrap<CodeRunner>(codeWorker), [codeWorker]);
  const spikeWorker = useMemo(
    () =>
      new Worker(
        new URL("../../workers/spikeGroupWorker.ts", import.meta.url),
        {
          type: "module",
        },
      ),
    [],
  );
  const spikeRunner = useMemo(
    () => wrap<SpikeRunner>(spikeWorker),
    [spikeWorker],
  );
  const customDataFunctionWorker = useMemo(
    () =>
      new Worker(
        new URL("../../workers/customDataFunctionWorker.ts", import.meta.url),
        {
          type: "module",
        },
      ),
    [],
  );
  const customFunctionRunner = useMemo(
    () => wrap<CustomFunctionRunner>(customDataFunctionWorker),
    [customDataFunctionWorker],
  );
  const customFunctionCodes = useMemo(
    () =>
      userCustomFunctionsRunOrder
        .map(
          (orderItem) =>
            userCustomFunctionGroups
              .find((group) => group.id === orderItem.type)
              ?.content.functions.find(
                (func) => func.name === orderItem.functionName,
              )?.code,
        )
        .filter((code): code is string => Boolean(code)),
    [userCustomFunctionGroups, userCustomFunctionsRunOrder],
  );
  const manualSpikeGraphData = useMemo(
    () => buildManualSpikeGraphData(chartData, headers, spikeGroups),
    [chartData, headers, spikeGroups],
  );
  const automaticSpikeGraphData = useMemo(
    () => buildAutomaticSpikeGraphData(chartData, headers, spikeGroups),
    [chartData, headers, spikeGroups],
  );
  const visibleChartData = useMemo(
    () => [
      ...chartData,
      ...automaticSpikeGraphData.data,
      ...manualSpikeGraphData.data,
    ],
    [automaticSpikeGraphData.data, chartData, manualSpikeGraphData.data],
  );
  const visibleGraphProps = useMemo(() => {
    const series =
      "series" in graphProps
        ? (graphProps.series as {
            label?: string;
            stroke?: string;
            width?: number;
          }[])
        : [];

    return {
      ...graphProps,
      series: [
        ...series,
        ...automaticSpikeGraphData.series,
        ...manualSpikeGraphData.series,
      ],
    };
  }, [automaticSpikeGraphData.series, graphProps, manualSpikeGraphData.series]);

  useEffect(() => {
    return () => {
      codeWorker.terminate();
      spikeWorker.terminate();
      customDataFunctionWorker.terminate();
    };
  }, [codeWorker, customDataFunctionWorker, spikeWorker]);

  const userCode = useCallback(
    async (functionName: string, input: number[]) => {
      try {
        const selectedFunction = userSpikeFunctions.find(
          (func) => func.name === functionName,
        );

        if (!selectedFunction) {
          return { spike: [] };
        }

        const output = await codeRunner.runCode(selectedFunction.code, input);
        return output;
      } catch (error) {
        console.log(error);
        return { spike: [] };
      }
    },
    [codeRunner, userSpikeFunctions],
  );

  useEffect(() => {
    if (fileContent && fileInfo && headers) {
      const processFile = async () => {
        try {
          const columns = parser(fileContent, fileInfo, headers, setHeaders);
          let processedColumns = columns;

          if (runCustomFunctions && customFunctionCodes.length > 0) {
            const customFunctionResult = await customFunctionRunner.runFunction(
              customFunctionCodes,
              columns,
            );

            if (
              Array.isArray(customFunctionResult) &&
              customFunctionResult.every((series) => Array.isArray(series))
            ) {
              processedColumns = customFunctionResult;
            }
          }

          setChartData(processedColumns);

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
                values: (_u: uPlot, ticks: number[]) =>
                  ticks.map((t: number) =>
                    new Date(t * 1000).toLocaleTimeString(),
                  ),
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
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

      processFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    customFunctionCodes,
    customFunctionRunner,
    fileContent,
    fileInfo?.date,
    fileInfo?.startTime,
    props.api.height,
    props.api.width,
    runCustomFunctions,
  ]);

  useEffect(() => {
    if (toggleSpikes && headerSeries) {
      const detectSpikes = async () => {
        if (!fileInfo) {
          return;
        }

        const spikesArray: number[][] = [];
        for (let i = 1; i < chartData.length; i++) {
          if (chartData[i].length > 0) {
            const workerResult = await userCode(
              detectionFunction,
              chartData[i],
            );
            spikesArray.push(workerResult.spike);
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

        setGraphProps((prev) => ({
          ...prev,
          series: [{}, ...headerSeries],
        }));
      };

      detectSpikes();
    }
  }, [
    chartData,
    detectionFunction,
    fileInfo,
    headerSeries,
    headers,
    setSpikeGroups,
    spikeRunner,
    toggleSpikes,
    userCode,
  ]);

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
    <div className="panel-surface">
      {chartData.length > 0 ? (
        <div>
          <div>
            <div className="text-white" ref={chartRef} />
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <div className="flex gap-2">
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
              >
                Detect Spikes
              </Button>
              <Button
                onClick={() => {
                  setGraphIds((prev) => [...prev, uuidv4()]);
                }}
                variant="secondary"
              >
                Add graph
              </Button>
              <Button
                onClick={() => {
                  setChartData([]);
                  setGraphProps({});
                  setFileContent(undefined);
                  setFileInfo(undefined);
                  setToggleSpikes(false);
                  setDetectionFunction("default");
                  setLoading(false);
                  setRunCustomFunctions(false);
                  setGraphIds([]);
                  setSpikeGroups([]);
                  setAvailableSpikeChannels([]);
                  setManualSelection({ enabled: false });
                  chartRef.current = null;
                  plotRef.current = null;
                }}
                variant="outline"
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
          <p className="empty-state">
            No data available, please an electrical signals file.
          </p>
          <Upload
            fileInfo={fileInfo}
            setFileInfo={setFileInfo}
            setFileContent={setFileContent}
            loading={loading}
            setLoading={setLoading}
            setHeaders={setHeaders}
            runCustomFunctions={runCustomFunctions}
            setRunCustomFunctions={setRunCustomFunctions}
          />
        </div>
      )}
    </div>
  );
}
