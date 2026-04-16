import { atom } from "jotai";

export const graphIdsAtom = atom<string[]>([]);

export const spikeGroupsAtom = atom<
  {
    channel: string;
    times: number[][];
    values: number[][];
    durations: number[];
    startTimes: number[];
  }[]
>([]);
