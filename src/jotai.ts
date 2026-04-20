import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const graphIdsAtom = atom<string[]>([]);

export const spikeGroupsAtom = atom<
  {
    channel: string;
    times: number[][];
    values: number[][];
    durations: number[];
    startTimes: string[];
  }[]
>([]);

export const userSpikeFunctionsAtom = atomWithStorage("functions", []);
