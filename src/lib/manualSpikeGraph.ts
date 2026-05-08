type SpikeGroup = {
  channel: string;
  times: number[][];
  values: number[][];
};

type GraphSeries = {
  label: string;
  stroke: string;
  width: number;
};

function timeOfDaySeconds(unixSeconds: number) {
  const date = new Date(unixSeconds * 1000);
  return (
    date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
  );
}

export function buildManualSpikeGraphData(
  chartData: number[][],
  headers: string[],
  spikeGroups: SpikeGroup[],
) {
  const timeData = chartData[0] ?? [];
  const channelHeaders = headers.slice(1);
  const data: (number | null)[][] = [];
  const series: GraphSeries[] = [];

  if (timeData.length === 0 || channelHeaders.length === 0) {
    return { data, series };
  }

  channelHeaders.forEach((channel, channelIndex) => {
    const channelData = chartData[channelIndex + 1] ?? [];
    const manualSpikeData: (number | null)[] = timeData.map(() => null);
    const spikeGroup = spikeGroups.find((group) => group.channel === channel);

    spikeGroup?.times.forEach((timeRange, spikeIndex) => {
      const isManualSpike =
        spikeGroup.values[spikeIndex]?.length === 0 && timeRange.length === 2;

      if (!isManualSpike) {
        return;
      }

      const [startSeconds, endSeconds] = timeRange;

      timeData.forEach((unixSeconds, sampleIndex) => {
        const sampleSeconds = timeOfDaySeconds(unixSeconds);

        if (sampleSeconds >= startSeconds && sampleSeconds <= endSeconds) {
          manualSpikeData[sampleIndex] = channelData[sampleIndex] ?? null;
        }
      });
    });

    if (manualSpikeData.some((value) => value !== null)) {
      data.push(manualSpikeData);
      series.push({
        label: `${channel} manual spikes`,
        stroke: "cyan",
        width: 5,
      });
    }
  });

  return { data, series };
}

export function buildAutomaticSpikeGraphData(
  chartData: number[][],
  headers: string[],
  spikeGroups: SpikeGroup[],
) {
  const timeData = chartData[0] ?? [];
  const channelHeaders = headers.slice(1);
  const data: (number | null)[][] = [];
  const series: GraphSeries[] = [];

  if (timeData.length === 0 || channelHeaders.length === 0) {
    return { data, series };
  }

  channelHeaders.forEach((channel, channelIndex) => {
    const channelData = chartData[channelIndex + 1] ?? [];
    const automaticSpikeData: (number | null)[] = timeData.map(() => null);
    const spikeGroup = spikeGroups.find((group) => group.channel === channel);

    spikeGroup?.times.forEach((sampleIndexes, spikeIndex) => {
      const isManualSpike =
        spikeGroup.values[spikeIndex]?.length === 0 &&
        sampleIndexes.length === 2;

      if (isManualSpike) {
        return;
      }

      sampleIndexes.forEach((sampleIndex) => {
        automaticSpikeData[sampleIndex] = channelData[sampleIndex] ?? null;
      });
    });

    if (automaticSpikeData.some((value) => value !== null)) {
      data.push(automaticSpikeData);
      series.push({
        label: `${channel} spikes`,
        stroke: "orange",
        width: 5,
      });
    }
  });

  return { data, series };
}
