import { useUserCodeRunner } from "@/components/UserFunctionRunner";
import { Button } from "../ui/button";

export default function TestPanel() {
  const { runUserCode, RunnerFrame } = useUserCodeRunner();

  async function test() {
    try {
      const output = await runUserCode({
        code: `
    const sum = input.a + input.b;
    return sum;
  `,
        input: { a: 2, b: 3 },
      });
      console.log(output);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      {RunnerFrame}
      <p className="text-white">Home Panel</p>
      <Button className="text-black" onClick={() => test()}>
        Click
      </Button>
    </div>
  );
}
