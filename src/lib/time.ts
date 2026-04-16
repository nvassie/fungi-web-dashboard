export function toUnixTimestamp(date: string, time: string) {
  const [yy, mm, dd] = date.split("-");
  const hh = time.slice(0, 2);
  const min = time.slice(2, 4);

  const newDate = new Date(`20${yy}-${mm}-${dd}T${hh}:${min}:00Z`);
  return Math.floor(newDate.getTime() / 1000);
}
