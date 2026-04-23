import type { FileInfo } from "@/types";
import { toUnixTimestamp } from "./time";

export function parser(
  fileContent: string,
  fileInfo: FileInfo,
  headers: string[],
) {
  if (fileInfo.extension === ".lvm") {
    const parsedData = lvmParser(fileContent, fileInfo, headers);
    return parsedData;
  } else if (fileInfo.extension === ".csv") {
    const parsedData = csvParser(fileContent, fileInfo);
    return parsedData;
  } else {
    return [];
  }
}

function lvmParser(fileContent: string, fileInfo: FileInfo, headers: string[]) {
  const columns: number[][] = [];
  const lines = fileContent.split(/\r?\n/);
  let startIndex = 0;

  if (headers.length > 0) {
    startIndex = 1;
    headers.forEach(() => {
      columns.push([]);
    });
  }

  for (let i = startIndex; i < lines.length; i++) {
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

function csvParser(fileContent: string, fileInfo: FileInfo) {
  const columns: number[][] = [[], []];
  const lines = fileContent.split(/\r?\n/);

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

  return columns;
}
