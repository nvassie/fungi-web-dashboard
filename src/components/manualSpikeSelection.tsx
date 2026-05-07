import {
  availableSpikeChannelsAtom,
  manualSpikeSelectionAtom,
  spikeGroupsAtom,
} from "@/jotai";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

function parseTimeToSeconds(time: string) {
  const parts = time.split(":").map(Number);

  if (parts.length < 2 || parts.some(Number.isNaN)) {
    return null;
  }

  const [hours, minutes, seconds = 0] = parts;
  return hours * 3600 + minutes * 60 + seconds;
}

function formatTime(time: string) {
  const parts = time.split(":");

  if (parts.length === 2) {
    return `${time}:00`;
  }

  return time;
}

function formatUnixSecondsAsTime(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleTimeString("en-AU", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function ManualSpikeSelection() {
  const [spikeGroups, setSpikeGroups] = useAtom(spikeGroupsAtom);
  const [graphSelection, setGraphSelection] = useAtom(manualSpikeSelectionAtom);
  const [availableChannels] = useAtom(availableSpikeChannelsAtom);
  const channels = useMemo(() => {
    const spikeGroupChannels = spikeGroups.map((group) => group.channel);
    return Array.from(new Set([...availableChannels, ...spikeGroupChannels]));
  }, [availableChannels, spikeGroups]);
  const [channel, setChannel] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channel && channels.length > 0) {
      setChannel(channels[0]);
    }
  }, [channel, channels]);

  useEffect(() => {
    if (graphSelection.startTime !== undefined) {
      setStartTime(formatUnixSecondsAsTime(graphSelection.startTime));
    }

    if (graphSelection.endTime !== undefined) {
      setEndTime(formatUnixSecondsAsTime(graphSelection.endTime));
    }
  }, [graphSelection.endTime, graphSelection.startTime]);

  function addManualSpike() {
    const startSeconds = parseTimeToSeconds(startTime);
    const endSeconds = parseTimeToSeconds(endTime);

    if (!channel) {
      setError("Select a channel before adding a spike.");
      return;
    }

    if (startSeconds === null || endSeconds === null) {
      setError("Enter a valid start and end time.");
      return;
    }

    if (endSeconds <= startSeconds) {
      setError("End time must be after start time.");
      return;
    }

    const duration = endSeconds - startSeconds;

    setSpikeGroups((currentGroups) => {
      const groupExists = currentGroups.some(
        (group) => group.channel === channel,
      );
      const nextGroups = groupExists
        ? currentGroups
        : [
            ...currentGroups,
            {
              channel,
              times: [],
              values: [],
              durations: [],
              startTimes: [],
            },
          ];

      return nextGroups.map((group) => {
        if (group.channel !== channel) {
          return group;
        }

        return {
          ...group,
          times: [...group.times, [startSeconds, endSeconds]],
          values: [...group.values, []],
          durations: [...group.durations, duration],
          startTimes: [...group.startTimes, formatTime(startTime)],
        };
      });
    });

    setStartTime("");
    setEndTime("");
    setError("");
    setGraphSelection((currentSelection) => ({
      enabled: currentSelection.enabled,
    }));
  }

  return (
    <section className="border-b bg-card/40 p-4 text-card-foreground">
      <h2 className="mb-3 text-sm font-semibold">Manual Spike Selection</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <Label htmlFor="manual-spike-channel">Channel</Label>
          <Select
            disabled={channels.length === 0}
            value={channel}
            onValueChange={setChannel}
          >
            <SelectTrigger className="w-56" id="manual-spike-channel">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Channels</SelectLabel>
                {channels.map((channelName) => (
                  <SelectItem key={channelName} value={channelName}>
                    {channelName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="manual-spike-start">Start time</Label>
          <Input
            className="w-40"
            id="manual-spike-start"
            onChange={(event) => setStartTime(event.target.value)}
            step="1"
            type="time"
            value={startTime}
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="manual-spike-end">End time</Label>
          <Input
            className="w-40"
            id="manual-spike-end"
            onChange={(event) => setEndTime(event.target.value)}
            step="1"
            type="time"
            value={endTime}
          />
        </div>

        <Button
          disabled={channels.length === 0}
          onClick={addManualSpike}
          type="button"
        >
          Add Spike
        </Button>

        <Button
          onClick={() =>
            setGraphSelection((currentSelection) => ({
              enabled: !currentSelection.enabled,
            }))
          }
          type="button"
        >
          {graphSelection.enabled ? "Stop Graph Select" : "Select on Graph"}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setStartTime("");
            setEndTime("");
            setError("");
            setGraphSelection((currentSelection) => ({
              enabled: currentSelection.enabled,
            }));
          }}
          type="button"
        >
          Clear
        </Button>
      </div>

      {graphSelection.enabled ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Click the graph once for the start time, then click again for the end
          time.
        </p>
      ) : null}
      {channels.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Upload data to be able to manually add spikes.
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </section>
  );
}
