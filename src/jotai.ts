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

export const userSpikeFunctionsAtom = atomWithStorage<
  { name: string; code: string }[]
>("functions", [
  {
    name: "default",
    code: `const window = 2000;
  const threshold = 5;
  const spikes = [];
  for (let i = window; i < input.length; i++) {
    const slice = input.slice(i - window, i);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const std = Math.sqrt(
      slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length,
    );
    if (Math.abs(input[i] - mean) > threshold * std) {
      spikes.push(i);
    }
  }
  return spikes;`,
  },
]);
