import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { wrap } from "comlink";

export default function TestPanel() {
  const worker = new Worker(
    new URL("../../workers/userSpikeFunctionWorker.ts", import.meta.url),
    {
      type: "module",
    },
  );
  const runner = wrap(worker);

  async function test() {
    try {
      const output = await runner.runCode(
        `
    const sum = input[0] + input[1];
    return sum;
  `,
        [2, 5],
      );
      console.log(output);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="panel-content">
      <h2 className="text-sm font-semibold">Home Panel</h2>
      <Label className="mt-4" htmlFor="test">
        Home Panel
      </Label>
      <Button className="mt-2" onClick={() => test()}>
        Click
      </Button>
    </div>
  );
}
