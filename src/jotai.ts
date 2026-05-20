import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type SpikeGroup = {
  channel: string;
  times: number[][];
  values: number[][];
  durations: number[];
  startTimes: string[];
};

export type GraphPanelRecord = {
  id: string;
  name: string;
};

export type GraphDataRecord = {
  chartData: number[][];
  headers: string[];
};

export const graphPanelsAtom = atom<GraphPanelRecord[]>([]);

export const graphDataByGraphPanelAtom = atom<
  Record<
    string,
    {
      primary?: GraphDataRecord;
      additional: Record<string, GraphDataRecord>;
    }
  >
>({});

export const spikeGroupsByGraphPanelAtom = atom<Record<string, SpikeGroup[]>>(
  {},
);

export const spikeGroupsAtom = atom<SpikeGroup[]>([]);

export const manualSpikeSelectionAtom = atom<{
  enabled: boolean;
  graphPanelId?: string;
  startTime?: number;
  endTime?: number;
}>({
  enabled: false,
});

export const availableSpikeChannelsByGraphPanelAtom = atom<
  Record<string, string[]>
>({});

export const availableSpikeChannelsAtom = atom<string[]>([]);

export const removeGraphPanelAtom = atom(null, (get, set, panelId: string) => {
  set(
    graphPanelsAtom,
    get(graphPanelsAtom).filter((panel) => panel.id !== panelId),
  );

  set(spikeGroupsByGraphPanelAtom, (currentGroupsByPanel) => {
    const nextGroupsByPanel = { ...currentGroupsByPanel };
    delete nextGroupsByPanel[panelId];
    return nextGroupsByPanel;
  });

  set(availableSpikeChannelsByGraphPanelAtom, (currentChannelsByPanel) => {
    const nextChannelsByPanel = { ...currentChannelsByPanel };
    delete nextChannelsByPanel[panelId];
    return nextChannelsByPanel;
  });

  set(graphDataByGraphPanelAtom, (currentDataByPanel) => {
    const nextDataByPanel = { ...currentDataByPanel };
    delete nextDataByPanel[panelId];
    return nextDataByPanel;
  });

  const manualSelection = get(manualSpikeSelectionAtom);

  if (manualSelection.graphPanelId === panelId) {
    set(manualSpikeSelectionAtom, { enabled: false });
  }
});

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

export const userCustomFunctionGroupsAtom = atomWithStorage<
  {
    id: string;
    content: {
      groupName: string;
      functions: {
        name: string;
        code: string;
      }[];
    };
  }[]
>("customFunctions", []);

export const userCustomFunctionsRunOrderAtom = atomWithStorage<
  {
    type: string;
    functionName: string;
  }[]
>("order", []);
