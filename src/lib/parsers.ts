import type { FileInfo } from "@/types";
import { toUnixTimestamp } from "./time";

export function parser(
  fileContent: string,
  fileInfo: FileInfo,
  headers: string[],
  setHeaders,
) {
  if (fileInfo.extension === ".lvm") {
    const parsedData = lvmParser(fileContent, fileInfo, headers, setHeaders);
    return parsedData;
  } else if (fileInfo.extension === ".csv") {
    const parsedData = csvParser(fileContent, fileInfo, setHeaders);
    return parsedData;
  } else {
    return [];
  }
}

function lvmParser(
  fileContent: string,
  fileInfo: FileInfo,
  headers: string[],
  setHeaders,
) {
  const columns: number[][] = [];
  const lines = fileContent.split(/\r?\n/);

  if (headers.length > 0) {
    headers.forEach(() => {
      columns.push([]);
    });
  } else {
    const tempHeaders = lines[0].trim().split(/\s+/);
    setHeaders(tempHeaders);
    tempHeaders.forEach(() => {
      columns.push([]);
    });
  }

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

  return columns;
}

function csvParser(fileContent: string, fileInfo: FileInfo, setHeaders) {
  const columns: number[][] = [];
  const lines = fileContent.split(/\r?\n/);

  const tempHeaders = lines[0].trim().split(",");
  setHeaders(tempHeaders);
  tempHeaders.forEach(() => {
    columns.push([]);
  });

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].trim().split(",");

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

  console.log(columns);
  return columns;
}
