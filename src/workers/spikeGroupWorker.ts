import { toUnixTimestamp } from "@/lib/time";
import type { FileInfo } from "@/types";
import { expose } from "comlink";

const spikeGrouper = {
  async groupSpikes(
    channel: string,
    spikes: number[],
    originalData: number[],
    fileInfo: FileInfo,
  ) {
    try {
      const tempSpikeGroups: number[][] = [];
      const tempSpikeGroupsDurations: number[] = [];
      const tempSpikeGroupsStartTimes: string[] = [];
      let currentGroup: number[] = [];
      for (let i = 0; i < spikes.length; i += 1) {
        if (i != 0) {
          if (spikes[i] === spikes[i - 1] + 1) {
            if (currentGroup.length === 0) {
              currentGroup.push(spikes[i - 1]);
            }
            currentGroup.push(spikes[i]);
          } else if (currentGroup.length !== 0) {
            tempSpikeGroups.push(currentGroup);
            tempSpikeGroupsDurations.push(currentGroup.length * 0.022);
            tempSpikeGroupsStartTimes.push(
              new Date(
                (toUnixTimestamp(fileInfo.date, fileInfo.startTime) +
                  currentGroup[0] * 0.022) *
                  1000,
              ).toLocaleTimeString(),
            );
            currentGroup = [];
          }
        }
      }
      const spikeGroupValues = tempSpikeGroups.map((group) =>
        group.map((idx) => originalData[idx]),
      );
      const temp = {
        channel: channel,
        times: tempSpikeGroups,
        values: spikeGroupValues,
        durations: tempSpikeGroupsDurations,
        startTimes: tempSpikeGroupsStartTimes,
      };
      return temp;
    } catch (error) {
      return error;
    }
  },
};

expose(spikeGrouper);
