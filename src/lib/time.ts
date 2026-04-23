export function toUnixTimestamp(date: string, time: string) {
  const [yyyy, mm, dd] = date.split("-");
  const hh = time.slice(0, 2);
  const min = time.slice(3, 5);

  const newDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00Z`);
  return Math.floor(newDate.getTime() / 1000);
}
