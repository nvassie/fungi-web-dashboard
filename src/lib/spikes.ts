export function detectSpikesRolling(data: number[], window = 5, threshold = 3) {
  const spikes = [];
  for (let i = window; i < data.length; i++) {
    const slice = data.slice(i - window, i);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const std = Math.sqrt(
      slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length,
    );
    if (Math.abs(data[i] - mean) > threshold * std) {
      spikes.push(i);
    }
  }
  return spikes;
}
