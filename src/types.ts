export interface FileInfo {
  baseInfo: File;
  extension: string;
  date?: string;
  startTime?: string;
}

export type SpikeRow = {
  channel: string;
  spikeNum: number;
  startTimes: string[];
};
