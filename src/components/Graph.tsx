import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { FileInfo } from "@/types";
import Upload from "@/components/Upload";
import { parser } from "@/lib/parsers";

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
  const [headerSeries, setHeaderSeries] = useState<any[]>([]);

  useEffect(() => {
    if (fileContent && fileInfo) {
      const columns = parser(fileContent, fileInfo, headers);

      setChartData(columns);
      setLoading(false);

      const tempHeaderSeries = headers.map((header, index) => ({
        label: header,
        stroke: headerColours[index],
        width: 2,
      }));

      setHeaderSeries(tempHeaderSeries);

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
          {
            stroke: "white",
            font: "12px Arial",
            grid: { stroke: "#444" },
            label: "Humidity %",
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
  }, [fileContent, fileInfo, height, width]);

  useEffect(() => {
    if (!chartRef.current) return;

    console.log(graphProps);

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
